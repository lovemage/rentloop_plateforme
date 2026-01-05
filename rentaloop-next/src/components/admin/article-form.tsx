'use client'

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/app/actions/upload';
import { createArticle, updateArticle } from '@/app/actions/articles';
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface ArticleFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function ArticleForm({ initialData, isEdit = false }: ArticleFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>(initialData?.image || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadImage(formData);
            if (result.success && result.url) {
                setImageUrl(result.url);
            } else {
                toast.error('圖片上傳失敗');
            }
        } catch (error) {
            console.error(error);
            toast.error('上傳發生錯誤');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setSubmitting(true);
        formData.append('image', imageUrl);

        try {
            let result;
            if (isEdit && initialData?.id) {
                result = await updateArticle(initialData.id, formData);
            } else {
                result = await createArticle(formData);
            }

            if (result.success) {
                toast.success(isEdit ? '更新成功' : '新增成功');
                router.push('/admin/articles');
            } else {
                toast.error(result.error || '操作失敗');
            }
        } catch (e) {
            toast.error('發生未知錯誤');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">文章標題 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            defaultValue={initialData?.title}
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (網址代稱) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="slug"
                            defaultValue={initialData?.slug}
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">簡短摘要 (Excerpt) <span className="text-red-500">*</span></label>
                        <textarea
                            name="excerpt"
                            defaultValue={initialData?.excerpt}
                            required
                            rows={3}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">文章首圖 <span className="text-red-500">*</span></label>

                    <div className="relative aspect-video bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imageUrl ? (
                            <>
                                <Image src={imageUrl} alt="Cover" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                    更換圖片
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImagePlus className="w-8 h-8" />}
                                <span className="text-sm mt-2">{uploading ? '上傳中...' : '點擊上傳圖片'}</span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {!imageUrl && <p className="text-xs text-red-500">請務必上傳一張圖片</p>}
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">文章內容 (HTML 格式) <span className="text-red-500">*</span></label>
                <textarea
                    name="content"
                    defaultValue={initialData?.content}
                    required
                    rows={10}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border font-mono text-sm"
                    placeholder="<p>文章段落...</p>"
                />
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-4">
                <details className="group">
                    <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                        <span>進階設定：SEO Schema (JSON-LD)</span>
                        <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="mt-4">
                        <textarea
                            name="seoSchema"
                            defaultValue={initialData?.seoSchema ? JSON.stringify(initialData.seoSchema, null, 2) : ''}
                            rows={8}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border font-mono text-xs bg-gray-50"
                            placeholder='{ "@context": "https://schema.org", "@type": "Article", ... }'
                        />
                        <p className="text-xs text-gray-500 mt-1">留空將自動根據標題與摘要生成預設 Schema。</p>
                    </div>
                </details>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Link href="/admin/articles" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">取消</Link>
                <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                    {submitting ? '儲存中...' : (isEdit ? '更新文章' : '發布文章')}
                </button>
            </div>
        </form>
    );
}
