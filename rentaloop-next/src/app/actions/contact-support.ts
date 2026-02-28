'use server'

import { Resend } from 'resend';
import { z } from 'zod';

const contactSchema = z.object({
    name: z.string().min(2, '姓名至少 2 個字').max(80, '姓名過長'),
    email: z.email('請輸入有效的 Email').max(255, 'Email 過長'),
    phone: z.string().max(30, '電話過長').optional(),
    topic: z.string().min(1, '請選擇主題').max(100, '主題過長'),
    subject: z.string().min(2, '主旨至少 2 個字').max(120, '主旨過長'),
    message: z.string().min(10, '內容至少 10 個字').max(3000, '內容過長'),
});

function escapeHtml(input: string): string {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export async function sendContactSupportEmail(input: {
    name: string;
    email: string;
    phone?: string;
    topic: string;
    subject: string;
    message: string;
}) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        return { success: false, error: 'RESEND_API_KEY 未設定，無法送出信件' };
    }

    const resend = new Resend(resendApiKey);

    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? '欄位驗證失敗' };
    }

    const { name, email, phone, topic, subject, message } = parsed.data;

    try {
        const supportInbox = process.env.SUPPORT_EMAIL || 'service@rentaloop.net';
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'Rentaloop Support <no-reply@rentaloop.net>';

        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #0f172a;">
                <h2 style="margin: 0 0 12px;">Rentaloop 客服表單新訊息</h2>
                <p style="margin: 0 0 16px;">以下是用戶提交的客服需求：</p>
                <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 680px; border: 1px solid #e2e8f0;">
                    <tr><td style="font-weight: 700; width: 120px; background: #f8fafc;">姓名</td><td>${escapeHtml(name)}</td></tr>
                    <tr><td style="font-weight: 700; background: #f8fafc;">Email</td><td>${escapeHtml(email)}</td></tr>
                    <tr><td style="font-weight: 700; background: #f8fafc;">電話</td><td>${escapeHtml(phone || '未填寫')}</td></tr>
                    <tr><td style="font-weight: 700; background: #f8fafc;">主題分類</td><td>${escapeHtml(topic)}</td></tr>
                    <tr><td style="font-weight: 700; background: #f8fafc;">信件主旨</td><td>${escapeHtml(subject)}</td></tr>
                    <tr><td style="font-weight: 700; background: #f8fafc; vertical-align: top;">內容</td><td style="white-space: pre-wrap;">${escapeHtml(message)}</td></tr>
                </table>
            </div>
        `;

        const { error } = await resend.emails.send({
            from: fromAddress,
            to: [supportInbox],
            replyTo: email,
            subject: `[客服表單] ${subject}`,
            html,
        });

        if (error) {
            console.error('Resend sendContactSupportEmail error:', error);
            return { success: false, error: '信件送出失敗，請稍後再試' };
        }

        return { success: true };
    } catch (error) {
        console.error('sendContactSupportEmail failed:', error);
        return { success: false, error: '系統忙碌中，請稍後再試' };
    }
}
