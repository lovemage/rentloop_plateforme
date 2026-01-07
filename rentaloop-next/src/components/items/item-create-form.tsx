'use client'

import { useState, useRef } from 'react';
import { uploadImage } from '@/app/actions/upload';
import { createItem } from '@/app/actions/item-create';
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getThumbnail } from '@/lib/cloudinary-utils';
import { GooglePlacesAutocomplete, type PickupLocation } from './google-places-autocomplete';

// Preset rental rules for quick selection
const PRESET_RULES = [
    "請勿在雨天使用",
    "請勿在沙灘或水邊使用",
    "歸還前請簡單清潔",
    "請小心輕放避免碰撞",
    "請勿拆解或改裝",
    "禁止轉租給第三方",
    "請準時歸還",
    "如需延長租期請提前告知",
    "遺失配件需照價賠償",
    "損壞需負擔維修費用",
    "使用後請充電/充滿電歸還",
    "請保持原廠包裝完整",
    "禁止用於商業拍攝",
    "限本人使用",
    "請妥善保管",
    "禁止攜帶出國",
    "室內使用限定",
    "請先試用確認功能正常",
    "歸還時請附上所有配件",
    "請依說明書正確操作",
];

// Zod Schema for validation
const itemFormSchema = z.object({
    title: z.string().min(1, '請輸入物品標題').max(100, '標題過長，最多100字'),
    categoryId: z.string().uuid('請選擇分類'),
    description: z.string().min(10, '描述至少10字').max(2000, '描述過長，最多2000字'),
    price: z.number().min(1, '租金必須大於0'),
    deposit: z.number().min(0, '押金不可為負數'),
    location: z.string().min(1, '請選擇至少一個面交地點'),
    images: z.array(z.string().url()).min(4, '為保障權益，請至少上傳 4 張照片'),
    availableFrom: z.string().optional(),
    availableTo: z.string().optional(),
    condition: z.string().optional(),
    notes: z.string().optional(),
    discountRate3Days: z.number().min(0).max(100).optional(),
    discountRate7Days: z.number().min(0).max(100).optional(),
    deliveryOptions: z.array(z.string()).min(1, '請選擇至少一種交付方式'),
    liabilityAccepted: z.boolean().refine(val => val === true, { message: '請閱讀並同意免責聲明' }),
    videoUrl: z.string().url('請輸入有效的網址').optional().or(z.literal('')),
});

const DELIVERY_OPTIONS = [
    { id: 'face_to_face', label: '面交 (建議)' },
    { id: 'delivery', label: '宅配 / 郵寄' },
    { id: 'store_pickup', label: '超商取貨' },
    { id: 'other', label: '其他' },
];

interface Category {
    id: string;
    name: string;
    slug: string | null;
    parentId: string | null;
}

export function ItemCreateForm({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Notes/rules state
    const [notes, setNotes] = useState('');
    const [showPresetRules, setShowPresetRules] = useState(false);

    // Pickup locations state
    const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);

    // New states
    const [deliveryOptions, setDeliveryOptions] = useState<string[]>(['face_to_face']);
    const [liabilityAccepted, setLiabilityAccepted] = useState(false);

    // Group categories
    const parentCategories = categories.filter(c => !c.parentId);
    const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

    const handleDeliveryChange = (optionId: string) => {
        setDeliveryOptions(prev => {
            if (prev.includes(optionId)) {
                return prev.filter(p => p !== optionId);
            } else {
                return [...prev, optionId];
            }
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        setUploadError(null);
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

            try {
                const result = await uploadImage(formData);
                if (result.success && result.url) {
                    setImageUrls(prev => [...prev, result.url]);
                    // Clear image error if exists
                    setErrors(prev => {
                        const { images: _, ...rest } = prev;
                        void _; // Mark as intentionally unused
                        return rest;
                    });
                    setUploadError(null);
                } else {
                    throw new Error('Upload failed');
                }
            } catch {
                setUploadError('圖片上傳失敗，請重新整理頁面後再試');
                toast.error('上傳失敗，請稍後再試');
            }
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const togglePresetRule = (rule: string) => {
        if (notes.includes(rule)) {
            // Remove rule
            setNotes(prev => prev.replace(rule, '').replace(/\n+/g, '\n').trim());
        } else {
            // Add rule
            setNotes(prev => (prev ? prev + '\n' + rule : rule));
        }
    };

    const validateForm = (formData: FormData): boolean => {
        const locationValue = pickupLocations.length > 0
            ? pickupLocations.map(l => l.name).join(', ')
            : formData.get('location') as string;

        const data = {
            title: formData.get('title') as string,
            categoryId: formData.get('categoryId') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            deposit: Number(formData.get('deposit')),
            location: locationValue,
            images: imageUrls,
            availableFrom: formData.get('availableFrom') as string,
            availableTo: formData.get('availableTo') as string,
            condition: formData.get('condition') as string,
            notes: notes,
            discountRate3Days: Number(formData.get('discountRate3Days') || 0),
            discountRate7Days: Number(formData.get('discountRate7Days') || 0),
            deliveryOptions: deliveryOptions,
            liabilityAccepted: liabilityAccepted,
            videoUrl: formData.get('videoUrl') as string,
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
        formData.set('notes', notes);
        formData.set('pickupLocations', JSON.stringify(pickupLocations));
        formData.set('deliveryOptions', JSON.stringify(deliveryOptions));

        try {
            const result = await createItem(formData);
            if (!result?.success) {
                toast.error('上架失敗，請稍後再試');
                setIsSubmitting(false);
                return;
            }

            toast.success('商品上架成功！');
            router.push('/member');
        } catch {
            toast.error('發生錯誤，請稍後再試');
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">

                {/* Image Upload Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-900">
                            商品照片 (至少 4 張) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs text-gray-500">建議包含正面、背面、細節及配件圖</span>
                    </div>

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

                    {/* Upload error message */}
                    {uploadError && (
                        <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <p className="font-medium">{uploadError}</p>
                                <p className="text-amber-600 mt-1">
                                    如果問題持續發生，請<button type="button" onClick={() => window.location.reload()} className="underline hover:no-underline">重新整理頁面</button>後再試。
                                </p>
                            </div>
                        </div>
                    )}

                    <p className={`text-xs mt-2 ${errors.images ? 'text-red-500' : 'text-gray-500'}`}>
                        {errors.images || '為保障雙方權益，請務必上傳至少 4 張清晰照片 (正面/背面/側面/配件)。支援 JPG, PNG, WebP'}
                    </p>

                    {/* Video URL (Optional) */}
                    <div className="mt-4">
                        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            商品影片連結 (選填)
                        </label>
                        <input
                            type="url"
                            name="videoUrl"
                            id="videoUrl"
                            className="w-full rounded-lg shadow-sm sm:text-sm px-4 py-2 border border-gray-300 focus:border-green-500 focus:ring-green-500"
                            placeholder="例如：YouTube 或 Google Drive 連結 (建議提供以證明功能正常)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            強烈建議提供影片證明商品功能正常，可減少後續爭議。
                        </p>
                    </div>
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

                {/* Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">物品狀況</label>
                        <select
                            name="condition"
                            className="block w-full rounded-lg sm:text-sm px-4 py-2 border border-gray-300 focus:border-green-500 focus:ring-green-500"
                        >
                            <option value="good">良好</option>
                            <option value="mint">近全新</option>
                            <option value="fair">可接受</option>
                            <option value="poor">有明顯使用痕跡</option>
                        </select>
                    </div>
                </div>

                {/* Notes with Preset Rules */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            注意事項 / 租賃補充規則
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPresetRules(!showPresetRules)}
                            className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                        >
                            {showPresetRules ? '隱藏預設規則' : '📋 選擇預設規則'}
                        </button>
                    </div>

                    {/* Preset Rules Tags */}
                    {showPresetRules && (
                        <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-3">點擊標籤快速新增規則：</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_RULES.map((rule) => {
                                    const isSelected = notes.includes(rule);
                                    return (
                                        <button
                                            key={rule}
                                            type="button"
                                            onClick={() => togglePresetRule(rule)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected
                                                ? 'bg-green-600 text-white shadow-sm'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:text-green-700'
                                                }`}
                                        >
                                            {isSelected && <span className="mr-1">✓</span>}
                                            {rule}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <textarea
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg shadow-sm sm:text-sm px-4 py-2 border border-gray-300 focus:border-green-500 focus:ring-green-500"
                        placeholder="例如：請勿在沙灘使用、歸還前請清潔..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        可自行輸入或點擊上方預設規則快速新增
                    </p>
                </div>

                {/* Discounts */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">長租優惠 (折扣百分比 %)</label>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">租滿 3 天 (以上)</label>
                            <div className="relative rounded-md shadow-sm">
                                <input
                                    type="number"
                                    name="discountRate3Days"
                                    min="0"
                                    max="100"
                                    className="block w-full rounded-lg pr-8 sm:text-sm px-4 py-2 border border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    placeholder="0"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-gray-500 sm:text-sm">% off</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">租滿 7 天 (以上)</label>
                            <div className="relative rounded-md shadow-sm">
                                <input
                                    type="number"
                                    name="discountRate7Days"
                                    min="0"
                                    max="100"
                                    className="block w-full rounded-lg pr-8 sm:text-sm px-4 py-2 border border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    placeholder="0"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-gray-500 sm:text-sm">% off</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Options */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        交付方式 (可複選) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {DELIVERY_OPTIONS.map((option) => (
                            <label key={option.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${deliveryOptions.includes(option.id)
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    checked={deliveryOptions.includes(option.id)}
                                    onChange={() => handleDeliveryChange(option.id)}
                                />
                                <span className="ml-2 text-sm font-medium">{option.label}</span>
                            </label>
                        ))}
                    </div>
                    {errors.deliveryOptions && <p className="text-xs text-red-500 mt-1">{errors.deliveryOptions}</p>}
                </div>

                {/* Pickup Location with Google Places */}
                <div className={deliveryOptions.includes('face_to_face') ? 'block' : 'hidden'}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        面交地點 (若選擇面交) <span className="text-red-500">*</span>
                    </label>
                    <GooglePlacesAutocomplete
                        value={pickupLocations}
                        onChange={setPickupLocations}
                        maxLocations={2}
                        error={errors.location}
                    />
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

            <div className="px-8 pb-4">
                <div className={`p-4 rounded-lg border ${errors.liabilityAccepted ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            checked={liabilityAccepted}
                            onChange={(e) => setLiabilityAccepted(e.target.checked)}
                        />
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900 block mb-1">平台免責聲明與上架條款</span>
                            我已閱讀並同意 <a href="/legal/terms" target="_blank" className="text-green-600 underline">服務條款</a>。我保證上述填寫資訊真實，物品狀況良好。我了解平台僅提供資訊媒合，不負責任何運送損壞、物品遺失或租賃糾紛。我承諾在交付前與歸還時，會與租客共同確認物品狀況並拍照存證。
                        </div>
                    </label>
                    {errors.liabilityAccepted && <p className="text-xs text-red-500 mt-2 pl-7">{errors.liabilityAccepted}</p>}
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
