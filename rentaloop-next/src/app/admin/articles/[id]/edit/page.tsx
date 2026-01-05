
import { ArticleForm } from "@/components/admin/article-form";
import { getArticle } from "@/app/actions/articles";
import { notFound } from "next/navigation";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await getArticle(id);
    if (!res.success || !res.data) notFound();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">編輯文章</h1>
            <ArticleForm initialData={res.data} isEdit />
        </div>
    );
}
