"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Image as ImageIcon,
    Save,
    Loader2,
    Upload,
    X,
    Home,
    ShoppingBag,
} from "lucide-react";
import { getAllBannerSettings, upsertBannerSetting, type BannerSetting } from "@/app/actions/admin-banners";
import { uploadImage } from "@/app/actions/upload";
import toast from "react-hot-toast";

const BANNER_KEYS = [
    { key: "home_banner", label: "首頁橫幅", icon: Home, description: "首頁頂部的大型橫幅圖片" },
    { key: "products_banner", label: "商品頁橫幅", icon: ShoppingBag, description: "商品列表頁面的橫幅圖片" },
];

type BannerForm = {
    imageUrl: string;
    title: string;
    subtitle: string;
    imageFile: File | null;
    imagePreview: string | null;
};

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Record<string, BannerForm>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    useEffect(() => {
        loadBanners();
    }, []);

    async function loadBanners() {
        setIsLoading(true);
        try {
            const result = await getAllBannerSettings();
            if (result.success) {
                const bannerMap: Record<string, BannerForm> = {};
                // Initialize all banner keys with defaults
                BANNER_KEYS.forEach(({ key }) => {
                    bannerMap[key] = {
                        imageUrl: "",
                        title: "",
                        subtitle: "",
                        imageFile: null,
                        imagePreview: null,
                    };
                });
                // Override with actual data
                result.data.forEach((setting: BannerSetting) => {
                    bannerMap[setting.key] = {
                        imageUrl: setting.imageUrl || "",
                        title: setting.title || "",
                        subtitle: setting.subtitle || "",
                        imageFile: null,
                        imagePreview: null,
                    };
                });
                setBanners(bannerMap);
            }
        } catch (error) {
            console.error("Failed to load banners:", error);
            toast.error("載入橫幅設定失敗");
        }
        setIsLoading(false);
    }

    function handleFieldChange(key: string, field: keyof BannerForm, value: string) {
        setBanners((prev) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    }

    function handleFileSelect(key: string, file: File) {
        const preview = URL.createObjectURL(file);
        setBanners((prev) => ({
            ...prev,
            [key]: { ...prev[key], imageFile: file, imagePreview: preview },
        }));
    }

    function clearImagePreview(key: string) {
        const banner = banners[key];
        if (banner?.imagePreview) {
            URL.revokeObjectURL(banner.imagePreview);
        }
        setBanners((prev) => ({
            ...prev,
            [key]: { ...prev[key], imageFile: null, imagePreview: null },
        }));
    }

    async function handleSave(key: string) {
        setSavingKey(key);
        const banner = banners[key];

        try {
            let imageUrl = banner.imageUrl;

            // Upload new image if selected
            if (banner.imageFile) {
                const formData = new FormData();
                formData.append("file", banner.imageFile);
                formData.append("folder", "banners");

                const uploadResult = await uploadImage(formData);
                if (uploadResult.success && uploadResult.url) {
                    imageUrl = uploadResult.url;
                } else {
                    toast.error("圖片上傳失敗");
                    setSavingKey(null);
                    return;
                }
            }

            const result = await upsertBannerSetting(key, {
                imageUrl,
                title: banner.title || null,
                subtitle: banner.subtitle || null,
            });

            if (result.success) {
                toast.success("橫幅設定已儲存");
                // Update local state
                setBanners((prev) => ({
                    ...prev,
                    [key]: {
                        ...prev[key],
                        imageUrl,
                        imageFile: null,
                        imagePreview: null,
                    },
                }));
            } else {
                toast.error("儲存失敗");
            }
        } catch (error) {
            console.error("Failed to save banner:", error);
            toast.error("儲存橫幅設定失敗");
        }

        setSavingKey(null);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">橫幅圖片管理</h1>
                <p className="text-sm text-gray-500 mt-1">
                    管理首頁和商品頁的橫幅圖片與標題文字
                </p>
            </div>

            {/* Banner Cards */}
            <div className="grid gap-6">
                {BANNER_KEYS.map(({ key, label, icon: Icon, description }) => {
                    const banner = banners[key] || {
                        imageUrl: "",
                        title: "",
                        subtitle: "",
                        imageFile: null,
                        imagePreview: null,
                    };
                    const isSaving = savingKey === key;
                    const displayImage = banner.imagePreview || banner.imageUrl;

                    return (
                        <div
                            key={key}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                        >
                            {/* Card Header */}
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Icon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{label}</h3>
                                    <p className="text-xs text-gray-500">{description}</p>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Image Section */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        橫幅圖片
                                    </label>

                                    {/* Image Preview */}
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200">
                                        {displayImage ? (
                                            <>
                                                <Image
                                                    src={displayImage}
                                                    alt="Banner preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                {banner.imagePreview && (
                                                    <button
                                                        onClick={() => clearImagePreview(key)}
                                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                                <ImageIcon className="w-12 h-12 mb-2" />
                                                <p className="text-sm">尚未設定圖片</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-colors">
                                        <Upload className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                            選擇新圖片
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileSelect(key, file);
                                            }}
                                        />
                                    </label>

                                    {/* Image URL Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            或輸入圖片網址
                                        </label>
                                        <input
                                            type="url"
                                            value={banner.imageUrl}
                                            onChange={(e) => handleFieldChange(key, "imageUrl", e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Text Fields Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            標題文字 <span className="text-gray-400 font-normal">(選填)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={banner.title}
                                            onChange={(e) => handleFieldChange(key, "title", e.target.value)}
                                            placeholder="輸入標題..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            副標題文字 <span className="text-gray-400 font-normal">(選填)</span>
                                        </label>
                                        <textarea
                                            value={banner.subtitle}
                                            onChange={(e) => handleFieldChange(key, "subtitle", e.target.value)}
                                            placeholder="輸入副標題或描述..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                                        />
                                    </div>

                                    {/* Save Button */}
                                    <button
                                        onClick={() => handleSave(key)}
                                        disabled={isSaving}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                儲存中...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                儲存設定
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
