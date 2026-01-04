/**
 * 日期工具函數 - UTC+8 (台北時區)
 * 確保所有日期計算都使用統一的時區
 */

// 台北時區偏移量 (UTC+8 = +8 hours = +480 minutes)
const TAIPEI_OFFSET_MINUTES = 480;

/**
 * 取得目前的台北時間
 */
export function getNowInTaipei(): Date {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (TAIPEI_OFFSET_MINUTES * 60000));
}

/**
 * 取得今天的日期字串 (YYYY-MM-DD) - 台北時區
 */
export function getTodayDateString(): string {
    return formatDateToTaipei(getNowInTaipei());
}

/**
 * 將 Date 轉換為 YYYY-MM-DD 格式 (台北時區)
 */
export function formatDateToTaipei(date: Date): string {
    const taipeiDate = toTaipeiTime(date);
    const year = taipeiDate.getFullYear();
    const month = String(taipeiDate.getMonth() + 1).padStart(2, '0');
    const day = String(taipeiDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 將任意時區的 Date 轉換為台北時間 Date
 */
export function toTaipeiTime(date: Date): Date {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (TAIPEI_OFFSET_MINUTES * 60000));
}

/**
 * 解析 YYYY-MM-DD 字串為 Date (視為台北時區的日期)
 * 返回的 Date 物件表示該日期在台北時區的午夜 (00:00:00)
 */
export function parseDateStringTaipei(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    // 建立一個 UTC 時間，然後調整為台北時區的午夜
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    // 減去台北時區偏移，使其代表台北時區的午夜
    return new Date(utcDate.getTime() - (TAIPEI_OFFSET_MINUTES * 60000));
}

/**
 * 比較兩個日期字串 (YYYY-MM-DD)
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareDateStrings(a: string, b: string): number {
    const dateA = new Date(a);
    const dateB = new Date(b);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
}

/**
 * 檢查日期字串是否在今天之後 (含今天)
 */
export function isDateInFuture(dateStr: string): boolean {
    const today = getTodayDateString();
    return compareDateStrings(dateStr, today) >= 0;
}

/**
 * 計算兩個日期字串之間的天數差 (含起始日)
 */
export function daysBetween(startStr: string, endStr: string): number {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * 格式化日期顯示 - 台北時區
 * @param date Date 物件或 ISO 字串
 * @param format 格式類型: 'short' (1/15), 'medium' (1月15日), 'long' (2026年1月15日)
 */
export function formatDisplayDate(
    date: Date | string,
    format: 'short' | 'medium' | 'long' = 'medium'
): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const taipeiDate = toTaipeiTime(d);

    const year = taipeiDate.getFullYear();
    const month = taipeiDate.getMonth() + 1;
    const day = taipeiDate.getDate();

    switch (format) {
        case 'short':
            return `${month}/${day}`;
        case 'medium':
            return `${month}月${day}日`;
        case 'long':
            return `${year}年${month}月${day}日`;
        default:
            return `${month}月${day}日`;
    }
}
