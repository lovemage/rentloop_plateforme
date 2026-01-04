'use server'

import { db } from "@/lib/db";
import { itemQuestions, items } from "@/lib/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

/**
 * 正規化字串：將全形字元轉換為半形，移除零寬字元等
 * 防止使用 Unicode 變體繞過敏感資訊過濾
 */
function normalizeString(input: string): string {
    return input
        // 移除零寬字元
        .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
        // 全形英數字轉半形 (Ａ-Ｚ → A-Z, ａ-ｚ → a-z, ０-９ → 0-9)
        .replace(/[\uFF21-\uFF3A]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
        .replace(/[\uFF41-\uFF5A]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
        .replace(/[\uFF10-\uFF19]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
        // 全形符號轉半形 (＠ → @)
        .replace(/\uFF20/g, '@')
        // 簡體「赖」轉繁體「賴」
        .replace(/赖/g, '賴')
        // 常見變體處理
        .replace(/ℓ|ℒ|Ⅼ|ⓛ/gi, 'l')
        .replace(/ⓘ|ℹ|ⅰ/gi, 'i')
        .replace(/ⓝ|ℕ/gi, 'n')
        .replace(/ⓔ|ℯ/gi, 'e')
        // 移除空格和特殊分隔符
        .replace(/[\s\u3000]+/g, '')
        .toLowerCase();
}

// 敏感資訊正則：手機號碼 (09xxxxxxxx)、Email (@)、關鍵字 (Line, 賴, Wechat, 微信, Telegram)
const SENSITIVE_PATTERNS = [
    /09\d{8}/,                          // 台灣手機號碼
    /0\d{9,10}/,                        // 其他電話格式
    /@/,                                // Email
    /line/i,                            // Line
    /賴/,                               // 賴 (Line 的常見暱稱)
    /wechat|weixin|微信/i,              // WeChat
    /telegram|tg/i,                     // Telegram
    /whatsapp|wa/i,                     // WhatsApp
    /messenger|fb.*m/i,                 // Facebook Messenger
    /加我|加入|私聊|私訊|私下/,           // 引導私下聯繫的字眼
];

function containsSensitiveInfo(content: string): boolean {
    const normalized = normalizeString(content);
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(normalized));
}

export async function askQuestion(itemId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "請先登入" };

    // 檢查內容長度
    if (content.trim().length < 2) {
        return { error: "提問內容過短" };
    }
    if (content.length > 500) {
        return { error: "提問內容過長，最多500字" };
    }

    if (containsSensitiveInfo(content)) {
        return { error: "為了您的交易安全，提問請勿包含聯絡方式 (電話、Line、Email 等)。訂單成立後系統將自動交換雙方資訊。" };
    }

    try {
        await db.insert(itemQuestions).values({
            itemId,
            userId: session.user.id,
            content: content.trim(),
        });

        revalidatePath(`/products/${itemId}`);
        return { success: true };
    } catch (e) {
        console.error("Ask Question Error:", e);
        return { error: "發送失敗，請稍後再試" };
    }
}

export async function replyQuestion(itemId: string, questionId: string, replyContent: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "請先登入" };

    // 檢查內容長度
    if (replyContent.trim().length < 1) {
        return { error: "回覆內容不可為空" };
    }
    if (replyContent.length > 1000) {
        return { error: "回覆內容過長，最多1000字" };
    }

    // Verify if session.user.id is truly the owner of the item
    const item = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
    if (!item.length || item[0].ownerId !== session.user.id) {
        return { error: "您沒有權限回覆此問題" };
    }

    try {
        await db.update(itemQuestions)
            .set({ reply: replyContent.trim(), repliedAt: new Date() })
            .where(eq(itemQuestions.id, questionId));

        revalidatePath(`/products/${itemId}`);
        return { success: true };
    } catch (e) {
        console.error("Reply Question Error:", e);
        return { error: "回覆失敗" };
    }
}
