'use client'

import { useState, useRef } from 'react';
import { uploadImage } from '@/app/actions/upload';
import { createItem } from '@/app/actions/item-create';
import { ImagePlus, X, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
    id: string;
    name: string;
    slug: string | null;
    parentId: string | null;
}

export function ItemCreateForm({ categories }: { categories: Category[] }) {
    const [uploading, setUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Group categories
    const parentCategories = categories.filter(c => !c.parentId);
    const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        const files = Array.from(e.target.files);

        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;

            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadImage(formData);
            if (result.success && result.url) {
                setImageUrls(prev => [...prev, result.url]);
            } else {
                alert('上傳失敗');
            }
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        formData.append('images', JSON.stringify(imageUrls));
        await createItem(formData);
    };

    return (
        <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">

                {/* Image Upload Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-4">
                        商品照片 ({imageUrls.length}/5) <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {imageUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                                <Image src={url} alt="Upload" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {imageUrls.length < 5 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <ImagePlus className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">新增照片</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        建議至少上傳一張照片。支援 JPG, PNG, WebP。
                    </p>
                    {/* Hidden input validation for images */}
                    {imageUrls.length === 0 && (
                        <input type="text" required className="sr-only" onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('請至少上傳一張照片')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} />
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Basic Info */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            物品標題 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                            placeholder="例如：Sony A7III 全片幅相機"
                        />
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                            分類 <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                        >
                            <option value="">選擇分類...</option>
                            {parentCategories.map(parent => (
                                <optgroup key={parent.id} label={parent.name}>
                                    {getChildren(parent.id).map(child => (
                                        <option key={child.id} value={child.id}>{child.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                            {/* Fallback for categories without parent/child structure or loose roots */}
                            {categories.filter(c => !c.parentId && getChildren(c.id).length === 0).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            詳細描述 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={5}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                            placeholder="請描述物品的新舊狀況、配件包含什麼、以及任何特殊注意事項..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">日租金 (TWD) <span className="text-red-500">*</span></label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                className="block w-full rounded-lg border-gray-300 pl-7 focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                                placeholder="0"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 sm:text-sm">/ 日</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">押金 (TWD) <span className="text-red-500">*</span></label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                name="deposit"
                                required
                                min="0"
                                className="block w-full rounded-lg border-gray-300 pl-7 focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">租賃結束無損壞將全額退還</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">面交地點 <span className="text-red-500">*</span></label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MapPin className="text-gray-400 w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            name="location"
                            required
                            className="block w-full rounded-lg border-gray-300 pl-9 focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                            placeholder="例如：台北市信義區市政府站"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">可租賃期間 (選填)</label>
                    <div className="flex grid-cols-2 gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">開始日期 (最早)</label>
                            <input
                                type="date"
                                name="availableFrom"
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">結束日期 (最晚)</label>
                            <input
                                type="date"
                                name="availableTo"
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">若不填寫，預設為隨時可租。</p>
                </div>

            </div>

            <div className="bg-gray-50 px-8 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <Link href="/products" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    取消
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? '發布中...' : '確認上架'}
                </button>
            </div>
        </form>
    );
}
