
import { ArticleForm } from "@/components/admin/article-form";

export default function NewArticlePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">新增文章</h1>
            <ArticleForm />
        </div>
    );
}
