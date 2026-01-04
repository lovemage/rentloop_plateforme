'use client'

import { useState, useRef } from 'react';
import { uploadImage } from '@/app/actions/upload';
import { createItem } from '@/app/actions/item-create';
import { ImagePlus, X, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getThumbnail } from '@/lib/cloudinary-utils';

// Zod Schema for validation
const itemFormSchema = z.object({
    title: z.string().min(1, '請輸入物品標題').max(100, '標題過長，最多100字'),
    categoryId: z.string().uuid('請選擇分類'),
    description: z.string().min(10, '描述至少10字').max(2000, '描述過長，最多2000字'),
    price: z.number().min(1, '租金必須大於0'),
    deposit: z.number().min(0, '押金不可為負數'),
    location: z.string().min(1, '請輸入面交地點'),
    images: z.array(z.string().url()).min(1, '請至少上傳一張照片'),
    availableFrom: z.string().optional(),
    availableTo: z.string().optional(),
});

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
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Group categories
    const parentCategories = categories.filter(c => !c.parentId);
    const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        const files = Array.from(e.target.files);

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error('僅支援圖片格式 (JPG, PNG, WebP)');
                continue;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('圖片大小不可超過 5MB');
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadImage(formData);
            if (result.success && result.url) {
                setImageUrls(prev => [...prev, result.url]);
                // Clear image error if exists
                setErrors(prev => {
                    const { images, ...rest } = prev;
                    return rest;
                });
            } else {
                toast.error('上傳失敗，請稍後再試');
            }
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = (formData: FormData): boolean => {
        const data = {
            title: formData.get('title') as string,
            categoryId: formData.get('categoryId') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            deposit: Number(formData.get('deposit')),
            location: formData.get('location') as string,
            images: imageUrls,
            availableFrom: formData.get('availableFrom') as string,
            availableTo: formData.get('availableTo') as string,
        };

        const result = itemFormSchema.safeParse(data);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                newErrors[field] = issue.message;
            });
            setErrors(newErrors);

            // Show first error as toast
            const firstError = result.error.issues[0];
            toast.error(firstError.message);
            return false;
        }

        setErrors({});
        return true;
    };

    const handleSubmit = async (formData: FormData) => {
        if (!validateForm(formData)) return;

        setIsSubmitting(true);
        formData.append('images', JSON.stringify(imageUrls));

        try {
            const result = await createItem(formData);
            if (result && 'error' in result) {
                toast.error(result.error as string);
                setIsSubmitting(false);
            } else {
                toast.success('商品上架成功！');
                // Redirect will be handled by server action
            }
        } catch (error) {
            toast.error('發生錯誤，請稍後再試');
            setIsSubmitting(false);
        }
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
                                <Image src={getThumbnail(url, 300)} alt="Upload" fill className="object-cover" />
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
                                className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.images
                                    ? 'border-red-300 text-red-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                                    : 'border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500 hover:bg-green-50'
                                    }`}
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
                    <p className={`text-xs mt-2 ${errors.images ? 'text-red-500' : 'text-gray-500'}`}>
                        {errors.images || '建議至少上傳一張照片。支援 JPG, PNG, WebP (最大 5MB)'}
                    </p>
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
                            className={`w-full rounded-lg shadow-sm sm:text-sm px-4 py-2 border ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                }`}
                            placeholder="例如：Sony A7III 全片幅相機"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                            分類 <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            required
                            className={`w-full rounded-lg shadow-sm sm:text-sm px-4 py-2 border ${errors.categoryId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                }`}
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
                        {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
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
                            className={`w-full rounded-lg shadow-sm sm:text-sm px-4 py-2 border ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                }`}
                            placeholder="請描述物品的新舊狀況、配件包含什麼、以及任何特殊注意事項..."
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
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
                                min="1"
                                className={`block w-full rounded-lg pl-7 sm:text-sm px-4 py-2 border ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                    }`}
                                placeholder="0"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 sm:text-sm">/ 日</span>
                            </div>
                        </div>
                        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
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
                                className={`block w-full rounded-lg pl-7 sm:text-sm px-4 py-2 border ${errors.deposit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                    }`}
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
                            className={`block w-full rounded-lg pl-9 sm:text-sm px-4 py-2 border ${errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                }`}
                            placeholder="例如：台北市信義區市政府站"
                        />
                    </div>
                    {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">可租賃期間 (選填)</label>
                    <div className="flex gap-4">
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
