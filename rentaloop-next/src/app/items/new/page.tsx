import { db } from "@/lib/db";
import { categories, userProfiles } from "@/lib/schema";
import { ItemCreateForm } from "@/components/items/item-create-form";
import Link from 'next/link';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

// Note: This page is protected by middleware.ts, so we assume user is logged in.

export default async function NewItemPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/auth');
    }

    const profileRow = await db
        .select({
            hostStatus: userProfiles.hostStatus,
            hostRulesAccepted: userProfiles.hostRulesAccepted,
            kycIdFrontUrl: userProfiles.kycIdFrontUrl,
            kycIdBackUrl: userProfiles.kycIdBackUrl,
        })
        .from(userProfiles)
        .where(eq(userProfiles.userId, session.user.id))
        .limit(1);

    const profile = profileRow[0] ?? null;

    // Simplify check: if hostStatus is approved, allow access. 
    // This handles manually approved users who might miss some flags.
    const canHost = profile?.hostStatus === 'approved';

    if (!canHost) {
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
                    <h1 className="text-2xl font-bold text-gray-900">上架新物品</h1>
                    <p className="text-gray-500 mt-1">填寫詳細資訊，讓您的物品能在 Rentaloop 上被搜尋。</p>
                </div>

                <ItemCreateForm categories={allCategories} />
            </div>
        </div>
    );
}
