import { Resend } from 'resend';
import { db } from './db';
import { emailTemplates } from './schema';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_TEMPLATES = {
    register_success: {
        subject: "歡迎加入 Rentaloop！",
        body: `<p>親愛的 {{name}}，</p><p>歡迎加入 Rentaloop！我們很高興見到您。</p><p>現在您可以開始探索或上架商品了。</p>`,
        description: "註冊成功通知",
        variables: "name"
    },
    kyc_submitted: {
        subject: "Rentaloop - 租賃會員申請已收到",
        body: `<p>親愛的 {{name}}，</p><p>我們已收到您的租賃會員申請。我們將在 72 小時內進行審核。</p>`,
        description: "KYC 提交確認",
        variables: "name"
    },
    kyc_approved: {
        subject: "恭喜！您已成為 Rentaloop 租賃會員",
        body: `<p>親愛的 {{name}}，</p><p>恭喜您！您的租賃會員申請已通過審核。您現在可以開始上架商品並進行租賃業務了。</p>`,
        description: "KYC 通過通知",
        variables: "name"
    },
    kyc_rejected: {
        subject: "Rentaloop - 租賃會員申請結果",
        body: `<p>親愛的 {{name}}，</p><p>很遺憾通知您，您的租賃會員申請未通過。</p><p>原因：文件不清晰或資格不符。</p><p>請登入系統重新提交。</p>`,
        description: "KYC 退回通知",
        variables: "name"
    },
    rental_booking_renter: {
        subject: "預約確認：{{item}}",
        body: `<p>親愛的 {{name}}，</p><p>您已成功預約 {{item}}。</p><p>租期：{{dates}}</p><p>請等待出租者確認。</p>`,
        description: "租客預約通知",
        variables: "name, item, dates, owner"
    },
    rental_booking_owner: {
        subject: "新預約通知：{{item}}",
        body: `<p>親愛的 {{name}}，</p><p>您的商品 {{item}} 有新的預約。</p><p>租客：{{renter}}</p><p>租期：{{dates}}</p><p>請登入系統進行確認。</p>`,
        description: "出租者收到預約通知",
        variables: "name, item, dates, renter"
    },
    review_invite: {
        subject: "邀請評價：{{item_title}}",
        body: `<p>親愛的 {{name}}，</p><p>感謝您租用 {{item_title}}。希望您有愉快的體驗。</p><p>請花一點時間為此次租賃留下評價：</p><p><a href="{{link}}">前往評價</a></p>`,
        description: "邀請租客評價",
        variables: "name, item_title, link"
    }
};

const LOGO_HTML = `
<div style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px;">
    <img src="https://rentaloop-next.vercel.app/logo.png" alt="Rentaloop" width="100" style="display:block; margin-bottom: 10px;" />
    <p style="color: #888; font-size: 12px;">© 2024 Rentaloop. All rights reserved.</p>
</div>
`;

export async function sendEmail({
    to,
    templateKey,
    data
}: {
    to: string;
    templateKey: keyof typeof DEFAULT_TEMPLATES;
    data: Record<string, string>;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Email not sent.");
        return { success: false, error: "Missing API Key" };
    }

    try {
        // Fetch template from DB or seed if missing
        let template = await db.query.emailTemplates.findFirst({
            where: eq(emailTemplates.key, templateKey)
        });

        if (!template) {
            // Seed
            const def = DEFAULT_TEMPLATES[templateKey];
            await db.insert(emailTemplates).values({
                key: templateKey,
                subject: def.subject,
                body: def.body,
                description: def.description,
                variables: def.variables
            });
            template = { key: templateKey, ...def, updatedAt: new Date() };
        }

        // Replace variables
        let subject = template.subject;
        let body = template.body;

        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, value);
            body = body.replace(regex, value);
        });

        // Add Logo
        const fullBody = `
            <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                ${body}
                ${LOGO_HTML}
            </div>
        `;

        const { data: resendData, error } = await resend.emails.send({
            from: 'Rentaloop <no-reply@rentaloop.lovemage.com>', // User needs to verify domain or use 'onboarding@resend.dev' for testing
            to: [to],
            subject: subject,
            html: fullBody,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { success: false, error };
        }

        return { success: true, data: resendData };

    } catch (e) {
        console.error("Send Email Logic Error:", e);
        return { success: false, error: e };
    }
}
