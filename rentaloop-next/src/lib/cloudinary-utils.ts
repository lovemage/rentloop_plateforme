/**
 * Cloudinary 圖片 URL 工具函數
 * 確保所有圖片都以 WebP 格式提供
 */

/**
 * 將任何 Cloudinary URL 轉換為 WebP 格式
 * @param url - 原始 Cloudinary URL
 * @param options - 可選的轉換參數
 * @returns WebP 格式的 URL
 */
export function toWebP(
    url: string,
    options?: {
        width?: number;
        height?: number;
        quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low' | number;
        crop?: 'limit' | 'fill' | 'scale' | 'fit' | 'pad' | 'crop';
    }
): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    // 解析 Cloudinary URL
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const baseUrl = url.substring(0, uploadIndex + 8); // 包含 '/upload/'
    const imagePath = url.substring(uploadIndex + 8);

    // 構建轉換參數
    const transformations: string[] = [];

    // 強制 WebP 格式
    transformations.push('f_webp');

    // 添加尺寸限制
    if (options?.width) {
        transformations.push(`w_${options.width}`);
    }
    if (options?.height) {
        transformations.push(`h_${options.height}`);
    }

    // 添加裁剪模式
    if (options?.crop) {
        transformations.push(`c_${options.crop}`);
    }

    // 添加質量設置
    const quality = options?.quality || 'auto:good';
    transformations.push(`q_${quality}`);

    // 添加漸進式加載
    transformations.push('fl_progressive');

    // 組合 URL
    const transformationString = transformations.join(',');
    return `${baseUrl}${transformationString}/${imagePath}`;
}

/**
 * 生成響應式圖片的 srcset
 * @param url - 原始 Cloudinary URL
 * @param widths - 寬度數組，默認為 [640, 750, 828, 1080, 1200, 1920]
 * @returns srcset 字符串
 */
export function generateSrcSet(
    url: string,
    widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
    return widths
        .map((width) => `${toWebP(url, { width, crop: 'limit' })} ${width}w`)
        .join(', ');
}

/**
 * 生成縮圖 URL
 * @param url - 原始 Cloudinary URL
 * @param size - 縮圖尺寸（正方形）
 * @returns 縮圖 URL
 */
export function getThumbnail(url: string, size: number = 200): string {
    return toWebP(url, {
        width: size,
        height: size,
        crop: 'fill',
        quality: 'auto:good',
    });
}

/**
 * 獲取優化的產品圖片 URL
 * @param url - 原始 Cloudinary URL
 * @param variant - 圖片變體類型
 * @returns 優化後的 URL
 */
export function getProductImage(
    url: string,
    variant: 'thumbnail' | 'card' | 'detail' | 'hero' = 'card'
): string {
    const configs = {
        thumbnail: { width: 200, height: 200, crop: 'fill' as const, quality: 'auto:eco' as const },
        card: { width: 600, crop: 'limit' as const, quality: 'auto:good' as const },
        detail: { width: 1200, crop: 'limit' as const, quality: 'auto:good' as const },
        hero: { width: 1920, crop: 'limit' as const, quality: 'auto:best' as const },
    };

    return toWebP(url, configs[variant]);
}
