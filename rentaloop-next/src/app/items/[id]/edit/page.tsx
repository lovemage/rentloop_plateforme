import { db } from "@/lib/db";
import { items, categories, userProfiles } from "@/lib/schema";
import { ItemEditForm } from "@/components/items/item-edit-form";
import Link from 'next/link';
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: itemId } = await params;

    const session = await auth();
    if (!session?.user?.id) {
        redirect('/auth');
    }

    // Verify host status
    const profileRow = await db
        .select({
            hostStatus: userProfiles.hostStatus,
        })
        .from(userProfiles)
        .where(eq(userProfiles.userId, session.user.id))
        .limit(1);

    const profile = profileRow[0] ?? null;
    if (profile?.hostStatus !== 'approved') {
        redirect('/member');
    }

    // Get item and verify ownership
    const itemRow = await db.select().from(items).where(eq(items.id, itemId)).limit(1);

    if (!itemRow.length) {
        notFound();
    }

    const item = itemRow[0];

    if (item.ownerId !== session.user.id) {
        redirect('/member');
    }

    const allCategories = await db.select().from(categories);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/member" className="text-sm text-gray-500 hover:text-gray-900 mb-2 inline-block">
                        ← 返回會員中心
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">編輯商品</h1>
                    <p className="text-gray-500 mt-1">修改商品資訊，更新後立即生效。</p>
                </div>

                <ItemEditForm item={item} categories={allCategories} />
            </div>
        </div>
    );
}
