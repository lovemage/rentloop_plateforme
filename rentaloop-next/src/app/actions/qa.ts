'use server'

import { db } from "@/lib/db";
import { itemQuestions, items } from "@/lib/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

// 簡單的正則過濾：手機號碼 (09xxxxxxxx)、Email (@)、關鍵字 (Line, 賴)
const SENSITIVE_REGEX = /(09\d{8})|(line)|(賴)|(@)/i;

export async function askQuestion(itemId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "請先登入" };

    if (SENSITIVE_REGEX.test(content)) {
        return { error: "為了您的交易安全，提問請勿包含聯絡方式 (電話、Line、Email)。訂單成立後系統將自動交換雙方資訊。" };
    }

    try {
        await db.insert(itemQuestions).values({
            itemId,
            userId: session.user.id,
            content,
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

    // TODO: Verify if session.user.id is truly the owner of the item (Security)
    // For MVP we assume UI handles visibility, but backend check is recommended.
    const item = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
    if (!item.length || item[0].ownerId !== session.user.id) {
        return { error: "您沒有權限回覆此問題" };
    }

    try {
        await db.update(itemQuestions)
            .set({ reply: replyContent, repliedAt: new Date() })
            .where(eq(itemQuestions.id, questionId));

        revalidatePath(`/products/${itemId}`);
        return { success: true };
    } catch (e) {
        console.error("Reply Question Error:", e);
        return { error: "回覆失敗" };
    }
}
