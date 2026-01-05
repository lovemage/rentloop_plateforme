
import Link from "next/link";
import { getArticles } from "@/app/actions/articles";
import { ArticleList } from "@/components/admin/article-list";

export default async function ArticlesPage() {
    const res = await getArticles();
    const articles = res.success ? res.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">SEO 文章管理 (SDGs)</h1>
                    <p className="text-sm text-gray-500 mt-1">管理首頁 SDGs 區塊的文章與 SEO 設定</p>
                </div>
                <Link
                    href="/admin/articles/new"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                    新增文章
                </Link>
            </div>

            <ArticleList initialArticles={articles || []} />
        </div>
    );
}
