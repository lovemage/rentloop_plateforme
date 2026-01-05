'use client'

import { useState } from "react";
import Link from "next/link";
import { deleteArticle } from "@/app/actions/articles";
import { toast } from "react-hot-toast";
import Image from "next/image";

export function ArticleList({ initialArticles }: { initialArticles: any[] }) {
    const [articles, setArticles] = useState(initialArticles);

    async function handleDelete(id: string) {
        if (!confirm("確定要刪除這篇文章嗎？")) return;

        const res = await deleteArticle(id);
        if (res.success) {
            toast.success("刪除成功");
            setArticles(articles.filter(a => a.id !== id));
        } else {
            toast.error("刪除失敗");
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-medium">圖片</th>
                        <th className="px-6 py-4 font-medium">標題</th>
                        <th className="px-6 py-4 font-medium">Slug</th>
                        <th className="px-6 py-4 font-medium">發布時間</th>
                        <th className="px-6 py-4 font-medium text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {articles.map((article) => (
                        <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="w-16 h-10 relative rounded overflow-hidden bg-gray-100">
                                    {article.image && (
                                        <Image
                                            src={article.image}
                                            alt={article.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                            <td className="px-6 py-4 text-gray-500">{article.slug}</td>
                            <td className="px-6 py-4 text-gray-400">
                                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <Link
                                    href={`/admin/articles/${article.id}/edit`}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    編輯
                                </Link>
                                <button
                                    onClick={() => handleDelete(article.id)}
                                    className="text-red-600 hover:text-red-700 font-medium"
                                >
                                    刪除
                                </button>
                            </td>
                        </tr>
                    ))}
                    {articles.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                目前沒有文章
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
