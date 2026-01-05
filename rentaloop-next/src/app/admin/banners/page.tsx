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
    Palette,
    Tag,
} from "lucide-react";
import { getAllBannerSettings, upsertBannerSetting, type BannerSetting } from "@/app/actions/admin-banners";
import { uploadImage } from "@/app/actions/upload";
import toast from "react-hot-toast";

const BANNER_KEYS = [
    { key: "home_banner", label: "首頁橫幅", icon: Home, description: "首頁頂部的大型橫幅圖片" },
    { key: "products_banner", label: "商品頁橫幅", icon: ShoppingBag, description: "商品列表頁面的橫幅圖片" },
];

const TEXT_SIZES = [
    { value: 'text-base', label: '標準 (Base)' },
    { value: 'text-lg', label: '中 (LG)' },
    { value: 'text-xl', label: '大 (XL)' },
    { value: 'text-2xl', label: '加大 (2XL)' },
    { value: 'text-3xl', label: '特大 (3XL)' },
    { value: 'text-4xl', label: '極大 (4XL)' },
    { value: 'text-5xl', label: '超級大 (5XL)' },
    { value: 'text-6xl', label: '巨大 (6XL)' },
];

type BannerStyles = {
    titleColor?: string;
    titleSize?: string;
    subtitleColor?: string;
    subtitleSize?: string;
    tagColor?: string;
    tagBgColor?: string;
};

type BannerForm = {
    imageUrl: string;
    title: string;
    subtitle: string;
    tagText: string;
    styles: BannerStyles;
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
                        tagText: "",
                        styles: {
                            titleColor: "#ffffff",
                            titleSize: "text-4xl",
                            subtitleColor: "#e5e7eb",
                            subtitleSize: "text-xl",
                            tagColor: "#86efac", // green-300
                            tagBgColor: "rgba(34, 197, 94, 0.2)", // green-500/20 approximately
                        },
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
                        tagText: setting.tagText || "",
                        styles: {
                            titleColor: setting.styles?.titleColor || "#ffffff",
                            titleSize: setting.styles?.titleSize || "text-4xl",
                            subtitleColor: setting.styles?.subtitleColor || "#e5e7eb",
                            subtitleSize: setting.styles?.subtitleSize || "text-xl",
                            tagColor: setting.styles?.tagColor || "#86efac",
                            tagBgColor: setting.styles?.tagBgColor || "rgba(34, 197, 94, 0.2)",
                        },
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

    function handleStyleChange(key: string, styleField: keyof BannerStyles, value: string) {
        setBanners((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                styles: {
                    ...prev[key].styles,
                    [styleField]: value
                }
            },
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
                tagText: banner.tagText || null,
                styles: banner.styles,
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
                    管理首頁和商品頁的橫幅圖片、標題、標籤與樣式設定
                </p>
            </div>

            {/* Banner Cards */}
            <div className="grid gap-6">
                {BANNER_KEYS.map(({ key, label, icon: Icon, description }) => {
                    const banner = banners[key];
                    if (!banner) return null;

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
                            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Left Column: Image & Tag */}
                                <div className="space-y-6">
                                    {/* Image Section */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> 橫幅圖片
                                        </label>

                                        {/* Image Preview */}
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 group">
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
                                                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                    )}
                                                    {/* Overlay Preview */}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-4">
                                                        <div className="max-w-md">
                                                            {banner.tagText && (
                                                                <span
                                                                    className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-2"
                                                                    style={{
                                                                        color: banner.styles.tagColor,
                                                                        backgroundColor: banner.styles.tagBgColor,
                                                                        border: `1px solid ${banner.styles.tagColor}40`
                                                                    }}
                                                                >
                                                                    {banner.tagText}
                                                                </span>
                                                            )}
                                                            <h3
                                                                style={{
                                                                    color: banner.styles.titleColor,
                                                                    // Use style for size if custom px, but here we use class so we can't preview exact size easily in inline-style unless we map
                                                                    // For preview, let's just use a relative size
                                                                }}
                                                                className={`font-bold leading-tight mb-2 ${banner.styles.titleSize}`}
                                                            >
                                                                {banner.title || "標題預覽"}
                                                            </h3>
                                                            <p
                                                                style={{ color: banner.styles.subtitleColor }}
                                                                className={`font-medium ${banner.styles.subtitleSize}`}
                                                            >
                                                                {banner.subtitle || "副標題預覽"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-12 h-12 mb-2" />
                                                    <p className="text-sm">尚未設定圖片</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-colors">
                                                <Upload className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">上傳圖片</span>
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
                                            <input
                                                type="url"
                                                value={banner.imageUrl}
                                                onChange={(e) => handleFieldChange(key, "imageUrl", e.target.value)}
                                                placeholder="或輸入圖片網址"
                                                className="flex-[2] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Tag Settings */}
                                    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Tag className="w-4 h-4" /> 標籤設定 (Tag)
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    value={banner.tagText}
                                                    onChange={(e) => handleFieldChange(key, "tagText", e.target.value)}
                                                    placeholder="標籤文字 (例如: Sustainability Impact)"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">文字顏色</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={banner.styles.tagColor}
                                                        onChange={(e) => handleStyleChange(key, "tagColor", e.target.value)}
                                                        className="h-9 w-9 p-1 rounded border border-gray-200 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-mono text-gray-500">{banner.styles.tagColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">背景顏色</label>
                                                <div className="flex items-center gap-2">
                                                    {/* Color input doesn't support alpha well, use text for rgba or simple color */}
                                                    <input
                                                        type="text"
                                                        value={banner.styles.tagBgColor}
                                                        onChange={(e) => handleStyleChange(key, "tagBgColor", e.target.value)}
                                                        placeholder="rgba(0,0,0,0.5)"
                                                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1">支援 hex 或 rgba</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Title & Subtitle */}
                                <div className="space-y-6">
                                    {/* Title Settings */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Palette className="w-4 h-4" /> 標題設定 (Title)
                                        </label>
                                        <input
                                            type="text"
                                            value={banner.title}
                                            onChange={(e) => handleFieldChange(key, "title", e.target.value)}
                                            placeholder="輸入主標題..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-bold focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">文字顏色</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={banner.styles.titleColor}
                                                        onChange={(e) => handleStyleChange(key, "titleColor", e.target.value)}
                                                        className="h-9 w-9 p-1 rounded border border-gray-200 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-mono text-gray-500">{banner.styles.titleColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">文字大小</label>
                                                <select
                                                    value={banner.styles.titleSize}
                                                    onChange={(e) => handleStyleChange(key, "titleSize", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                                                >
                                                    {TEXT_SIZES.map(s => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtitle Settings */}
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <label className="text-sm font-semibold text-gray-700">副標題/描述設定</label>
                                        <textarea
                                            value={banner.subtitle}
                                            onChange={(e) => handleFieldChange(key, "subtitle", e.target.value)}
                                            placeholder="輸入副標題或描述內容..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">文字顏色</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={banner.styles.subtitleColor}
                                                        onChange={(e) => handleStyleChange(key, "subtitleColor", e.target.value)}
                                                        className="h-9 w-9 p-1 rounded border border-gray-200 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-mono text-gray-500">{banner.styles.subtitleColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">文字大小</label>
                                                <select
                                                    value={banner.styles.subtitleSize}
                                                    onChange={(e) => handleStyleChange(key, "subtitleSize", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                                                >
                                                    {TEXT_SIZES.map(s => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => handleSave(key)}
                                            disabled={isSaving}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors shadow-sm"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    儲存中...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    儲存變更
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
