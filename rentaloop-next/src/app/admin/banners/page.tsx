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
    AlignLeft,
    AlignCenter,
    AlignRight,
    ArrowUp,
    LogIn, // Using LogIn as a proxy for "Center Vertical" icon metaphor or just simple dash
    ArrowDown,
    Layout,
} from "lucide-react";
import { getAllBannerSettings, upsertBannerSetting, type BannerSetting } from "@/app/actions/admin-banners";
import toast from "react-hot-toast";

const BANNER_KEYS = [
    { key: "home_banner", label: "首頁橫幅", icon: Home, description: "首頁頂部的大型橫幅圖片" },
    { key: "products_banner", label: "商品頁橫幅", icon: ShoppingBag, description: "商品列表頁面的橫幅圖片" },
];

type BannerStyles = {
    titleColor: string;
    titleSize: number; // px
    subtitleColor: string;
    subtitleSize: number; // px
    tagColor: string;
    tagBgColor: string;
    textAlign: 'left' | 'center' | 'right';
    verticalAlign: 'start' | 'center' | 'end'; // flex justify values
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

// Default styles
const DEFAULT_STYLES: BannerStyles = {
    titleColor: "#ffffff",
    titleSize: 48,
    subtitleColor: "#e5e7eb",
    subtitleSize: 18,
    tagColor: "#86efac", // green-300
    tagBgColor: "rgba(34, 197, 94, 0.2)",
    textAlign: 'center',
    verticalAlign: 'center',
};

// Helper to convert DB style (which might be old format) to new format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeStyles(dbStyles: any): BannerStyles {
    if (!dbStyles) return { ...DEFAULT_STYLES };

    // Check if size is string (old 'text-4xl') or number. If string, convert to approx px or default
    const titleSize = typeof dbStyles.titleSize === 'number' ? dbStyles.titleSize : 48;
    const subtitleSize = typeof dbStyles.subtitleSize === 'number' ? dbStyles.subtitleSize : 18;

    return {
        titleColor: dbStyles.titleColor || DEFAULT_STYLES.titleColor,
        titleSize,
        subtitleColor: dbStyles.subtitleColor || DEFAULT_STYLES.subtitleColor,
        subtitleSize,
        tagColor: dbStyles.tagColor || DEFAULT_STYLES.tagColor,
        tagBgColor: dbStyles.tagBgColor || DEFAULT_STYLES.tagBgColor,
        textAlign: dbStyles.textAlign || DEFAULT_STYLES.textAlign,
        verticalAlign: dbStyles.verticalAlign || DEFAULT_STYLES.verticalAlign,
    };
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Record<string, BannerForm>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    async function uploadBannerImage(file: File): Promise<string> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30_000);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'banners');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                const msg = json?.error ? String(json.error) : `Upload failed (${res.status})`;
                throw new Error(msg);
            }

            if (!json?.success || !json?.url) {
                throw new Error('Upload failed');
            }

            return String(json.url);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    useEffect(() => {
        loadBanners();
    }, []);

    async function loadBanners() {
        setIsLoading(true);
        try {
            const result = await getAllBannerSettings();
            if (result.success) {
                const bannerMap: Record<string, BannerForm> = {};

                // Initialize defaults
                BANNER_KEYS.forEach(({ key }) => {
                    bannerMap[key] = {
                        imageUrl: "",
                        title: "",
                        subtitle: "",
                        tagText: "",
                        styles: { ...DEFAULT_STYLES },
                        imageFile: null,
                        imagePreview: null,
                    };
                });

                // Override with DB data
                result.data.forEach((setting: BannerSetting) => {
                    bannerMap[setting.key] = {
                        imageUrl: setting.imageUrl || "",
                        title: setting.title || "",
                        subtitle: setting.subtitle || "",
                        tagText: setting.tagText || "",
                        styles: normalizeStyles(setting.styles),
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

    function handleStyleChange(key: string, styleField: keyof BannerStyles, value: string | number) {
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
                try {
                    imageUrl = await uploadBannerImage(banner.imageFile);
                } catch (e) {
                    console.error('Banner image upload failed:', e);
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
                // Update local state and clear preview
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

    // Helper functions for alignment class/style logic (for preview)
    // Tailwind simplify: justify-start, justify-center, justify-end for vertical (flex-col)
    // items-start, items-center, items-end for horizontal (flex-col)
    const getFlexClasses = (v: string, h: string) => {
        let classes = "flex flex-col ";
        // Vertical Alignment (Main axis in flex-col is vertical? No, main is vertical)
        // flex-col: justify controls vertical, items controls horizontal

        switch (v) {
            case 'start': classes += 'justify-start '; break;
            case 'end': classes += 'justify-end '; break;
            default: classes += 'justify-center '; break;
        }

        switch (h) {
            case 'left': classes += 'items-start text-left '; break;
            case 'right': classes += 'items-end text-right '; break;
            default: classes += 'items-center text-center '; break;
        }

        return classes;
    };


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
                    管理首頁和商品頁的橫幅圖片、文案、標籤與排版位置
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

                            {/* Card Content using Grid */}
                            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Left Column: Preview & Tag & Layout */}
                                <div className="space-y-6">

                                    {/* Preview Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Layout className="w-4 h-4" /> 即時預覽
                                        </label>
                                        <div
                                            className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-200 group"
                                        >
                                            {displayImage ? (
                                                <Image
                                                    src={displayImage}
                                                    alt="Banner preview"
                                                    fill
                                                    className="object-cover opacity-60"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-500">
                                                    無圖片
                                                </div>
                                            )}

                                            {/* Preview Overlay */}
                                            <div className={`absolute inset-0 p-8 ${getFlexClasses(banner.styles.verticalAlign, banner.styles.textAlign)}`}>
                                                {/* Tag Preview */}
                                                {banner.tagText && (
                                                    <span
                                                        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-sm border"
                                                        style={{
                                                            color: banner.styles.tagColor,
                                                            backgroundColor: banner.styles.tagBgColor,
                                                            borderColor: `${banner.styles.tagColor}40`
                                                        }}
                                                    >
                                                        {banner.tagText}
                                                    </span>
                                                )}

                                                {/* Title Preview */}
                                                <h3
                                                    style={{
                                                        color: banner.styles.titleColor,
                                                        fontSize: `${banner.styles.titleSize}px`,
                                                    }}
                                                    className="font-black leading-tight mb-3 drop-shadow-md"
                                                >
                                                    {banner.title || "標題文字預覽"}
                                                </h3>

                                                {/* Subtitle Preview */}
                                                <p
                                                    style={{
                                                        color: banner.styles.subtitleColor,
                                                        fontSize: `${banner.styles.subtitleSize}px`
                                                    }}
                                                    className="font-medium drop-shadow-sm max-w-lg"
                                                >
                                                    {banner.subtitle || "描述文字預覽..."}
                                                </p>
                                            </div>

                                            {/* Image Clear Button */}
                                            {banner.imagePreview && (
                                                <button
                                                    onClick={() => clearImagePreview(key)}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-20"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="flex gap-2">
                                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-colors">
                                            <Upload className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">選擇圖片</span>
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
                                            className="flex-[2] px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    {/* Layout Settings using Grid/Flex */}
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Layout className="w-4 h-4" /> 版面配置
                                        </label>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-2">水平對齊</span>
                                                <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                                    {(['left', 'center', 'right'] as const).map((align) => (
                                                        <button
                                                            key={align}
                                                            onClick={() => handleStyleChange(key, 'textAlign', align)}
                                                            className={`flex-1 flex justify-center py-1.5 rounded ${banner.styles.textAlign === align
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'text-gray-400 hover:text-gray-600'
                                                                }`}
                                                        >
                                                            {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                                            {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                                            {align === 'right' && <AlignRight className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-2">垂直對齊</span>
                                                <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                                    {(['start', 'center', 'end'] as const).map((align) => (
                                                        <button
                                                            key={align}
                                                            onClick={() => handleStyleChange(key, 'verticalAlign', align)}
                                                            className={`flex-1 flex justify-center py-1.5 rounded ${banner.styles.verticalAlign === align
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'text-gray-400 hover:text-gray-600'
                                                                }`}
                                                        >
                                                            {align === 'start' && <ArrowUp className="w-4 h-4" />}
                                                            {align === 'center' && <div className="w-4 h-1 bg-current rounded-full my-1.5" />}
                                                            {align === 'end' && <ArrowDown className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tag Info */}
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Tag className="w-4 h-4" /> 標籤 (Tag)
                                        </label>
                                        <input
                                            type="text"
                                            value={banner.tagText}
                                            onChange={(e) => handleFieldChange(key, "tagText", e.target.value)}
                                            placeholder="標籤文字 (例如: New Arrival)"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                                                <span className="text-xs text-gray-500">文字色</span>
                                                <input
                                                    type="color"
                                                    value={banner.styles.tagColor}
                                                    onChange={(e) => handleStyleChange(key, "tagColor", e.target.value)}
                                                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex-1 flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                                                <span className="text-xs text-gray-500 whitespace-nowrap">背景 (支援 rgba)</span>
                                                <input
                                                    type="text"
                                                    value={banner.styles.tagBgColor}
                                                    onChange={(e) => handleStyleChange(key, "tagBgColor", e.target.value)}
                                                    className="w-full text-xs outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Title & Subtitle Settings */}
                                <div className="space-y-6">
                                    {/* Title Controls */}
                                    <div className="space-y-4">
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
                                                <label className="text-xs text-gray-500 mb-1 block">文字大小 (px)</label>
                                                <input
                                                    type="number"
                                                    value={banner.styles.titleSize}
                                                    onChange={(e) => handleStyleChange(key, "titleSize", Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">文字顏色</label>
                                                <div className="flex items-center gap-2 h-[38px] px-3 border border-gray-200 rounded-lg bg-white">
                                                    <input
                                                        type="color"
                                                        value={banner.styles.titleColor}
                                                        onChange={(e) => handleStyleChange(key, "titleColor", e.target.value)}
                                                        className="w-6 h-6 p-0 border-0 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-mono text-gray-500 flex-1 text-right">{banner.styles.titleColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* Subtitle Controls */}
                                    <div className="space-y-4">
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
                                                <label className="text-xs text-gray-500 mb-1 block">文字大小 (px)</label>
                                                <input
                                                    type="number"
                                                    value={banner.styles.subtitleSize}
                                                    onChange={(e) => handleStyleChange(key, "subtitleSize", Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">文字顏色</label>
                                                <div className="flex items-center gap-2 h-[38px] px-3 border border-gray-200 rounded-lg bg-white">
                                                    <input
                                                        type="color"
                                                        value={banner.styles.subtitleColor}
                                                        onChange={(e) => handleStyleChange(key, "subtitleColor", e.target.value)}
                                                        className="w-6 h-6 p-0 border-0 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-mono text-gray-500 flex-1 text-right">{banner.styles.subtitleColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
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
                                        <p className="text-xs text-center text-gray-400 mt-2">
                                            儲存後前台將立即更新
                                        </p>
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
