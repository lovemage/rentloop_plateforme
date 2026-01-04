import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { ItemCreateForm } from "@/components/items/item-create-form";
import Link from 'next/link';

// Note: This page is protected by middleware.ts, so we assume user is logged in.

export default async function NewItemPage() {
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
