"use client"

import { useState, useTransition } from 'react';
import { RentalCalendar } from '@/components/ui/rental-calendar';
import { X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { createRental, blockDates } from '@/app/actions/rentals';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface RentalCardProps {
    itemId: string;
    itemTitle: string;
    pricePerDay: number;
    deposit: number;
    blockedDates?: Date[];
    bookedDates?: Date[];
    cleaningDates?: Date[];
    availableRange?: { from: Date | null; to: Date | null };
    isLoggedIn?: boolean;
    isOwner?: boolean;
    discountRate3Days?: number;
    discountRate7Days?: number;
}

export function RentalCard({
    itemId,
    itemTitle,
    pricePerDay,
    deposit,
    blockedDates = [],
    bookedDates = [],
    cleaningDates = [],
    availableRange,
    isLoggedIn = false,
    isOwner = false,
    discountRate3Days = 0,
    discountRate7Days = 0
}: RentalCardProps) {
    const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [resultMessage, setResultMessage] = useState<{ success: boolean; message: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    const [bookingData, setBookingData] = useState<{ start: Date | null, end: Date | null, days: number, total: number }>({
        start: null, end: null, days: 0, total: 0
    });

    const handleDateChange = (start: Date | null, end: Date | null, days: number, total: number) => {
        setBookingData({ start, end, days, total });
    };

    const handleBookingClick = () => {
        if (!isLoggedIn) {
            // Redirect to login
            window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }
        if (bookingData.days > 0) {
            setIsConfirmModalOpen(true);
            setIsMobileCalendarOpen(false);
        }
    };

    const handleConfirmBooking = () => {
        if (!bookingData.start || !bookingData.end) return;

        startTransition(async () => {
            let result;

            if (isOwner) {
                result = await blockDates({
                    itemId,
                    startDate: format(bookingData.start!, 'yyyy-MM-dd'),
                    endDate: format(bookingData.end!, 'yyyy-MM-dd'),
                });
            } else {
                result = await createRental({
                    itemId,
                    startDate: format(bookingData.start!, 'yyyy-MM-dd'),
                    endDate: format(bookingData.end!, 'yyyy-MM-dd'),
                    totalDays: bookingData.days,
                    totalAmount: bookingData.total,
                });
            }

            setIsConfirmModalOpen(false);
            setResultMessage({
                success: result.success,
                message: result.message || result.error || (result.success ? '成功' : '失敗')
            });
            setIsResultModalOpen(true);

            if (result.success) {
                // Reset booking data after successful submission
                setBookingData({ start: null, end: null, days: 0, total: 0 });
            }
        });
    };

    const formatDateRange = () => {
        if (!bookingData.start || !bookingData.end) return '';
        return `${format(bookingData.start, 'M月d日', { locale: zhTW })} - ${format(bookingData.end, 'M月d日', { locale: zhTW })}`;
    };

    // Confirm Modal
    const ConfirmModal = isConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => !isPending && setIsConfirmModalOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">確認預約</h3>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">商品</span>
                            <span className="font-medium text-gray-900 text-right max-w-[200px] truncate">{itemTitle}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">日期</span>
                            <span className="font-medium text-gray-900">{formatDateRange()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">天數</span>
                            <span className="font-medium text-gray-900">{bookingData.days} 天</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">單日租金</span>
                            <span className="font-medium text-gray-900">${pricePerDay.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-gray-200" />
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-900">總金額</span>
                            <span className="font-bold text-green-600 text-lg">${bookingData.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">押金（待付）</span>
                            <span className="text-gray-500">${deposit.toLocaleString()}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">
                        送出預約後，店家將會審核您的預約申請。確認後您才需要進行付款。
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsConfirmModalOpen(false)}
                        disabled={isPending}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleConfirmBooking}
                        disabled={isPending}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                送出中...
                            </>
                        ) : (
                            '確認預約'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    // Result Modal
    const ResultModal = isResultModalOpen && resultMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsResultModalOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
                {resultMessage.success ? (
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}

                <h3 className={`text-xl font-bold mb-2 ${resultMessage.success ? 'text-green-600' : 'text-red-600'}`}>
                    {resultMessage.success ? '預約成功！' : '預約失敗'}
                </h3>

                <p className="text-gray-600 mb-6">{resultMessage.message}</p>

                <button
                    onClick={() => setIsResultModalOpen(false)}
                    className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                    確定
                </button>
            </div>
        </div>
    );

    // Disabled state for owner removed - now allows blocking logic
    // But we need distinct UI for Owner


    // --- Desktop Sidebar View ---
    const DesktopView = (
        <div className="hidden lg:block sticky top-24 bg-white border border-gray-200 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] p-6 z-10">
            <div className="flex items-baseline justify-between mb-6">
                <div>
                    <span className="text-2xl font-bold text-gray-900">${pricePerDay.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm font-medium"> / 日</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    押金 ${deposit.toLocaleString()}
                </div>
            </div>

            <div className="mb-6">
                <div className="bg-white border rounded-lg overflow-hidden">
                    {/* Integrated Calendar directly for Desktop */}
                    <RentalCalendar
                        pricePerDay={pricePerDay}
                        disabledDates={blockedDates}
                        bookedDates={bookedDates}
                        cleaningDates={cleaningDates}
                        availableRange={availableRange}
                        onDateChange={handleDateChange}
                        discountRate3Days={discountRate3Days}
                        discountRate7Days={discountRate7Days}
                    />
                </div>
            </div>

            <button
                onClick={handleBookingClick}
                disabled={bookingData.days === 0 || isPending}
                className={`w-full py-3.5 font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] ${isOwner
                        ? "bg-gray-800 hover:bg-black text-white"
                        : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                    }`}
            >
                {isOwner
                    ? (bookingData.days > 0 ? "保留此時段 (不開放)" : "選擇保留日期")
                    : (!isLoggedIn ? '登入以預約' : bookingData.days > 0 ? `送出預約 · $${bookingData.total.toLocaleString()}` : '選擇日期')
                }
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
                {isOwner ? "選擇日期以設定不開放出租的時段" : "預約後店家將審核您的申請"}
            </p>
        </div>
    );

    // --- Mobile Bottom Bar ---
    const MobileBottomBar = (
        <>
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 pb-safe flex items-center justify-between lg:hidden z-40">
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">${pricePerDay.toLocaleString()}</span>
                        <span className="text-gray-500 text-xs">/ 日</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {bookingData.days > 0 ? `${bookingData.days} 天 · ${formatDateRange()}` : '尚未選擇日期'}
                    </div>
                </div>

                <button
                    onClick={bookingData.days > 0 ? handleBookingClick : () => setIsMobileCalendarOpen(true)}
                    disabled={isPending}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {!isLoggedIn ? '登入' : bookingData.days > 0 ? '送出預約' : '選擇日期'}
                </button>
            </div>

            {/* Mobile Calendar Modal (Sheet) */}
            {isMobileCalendarOpen && (
                <div className="fixed inset-0 z-50 flex items-end lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
                        onClick={() => setIsMobileCalendarOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full bg-white rounded-t-2xl p-6 pb-24 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">選擇日期</h3>
                            <button
                                onClick={() => setIsMobileCalendarOpen(false)}
                                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <RentalCalendar
                                pricePerDay={pricePerDay}
                                disabledDates={blockedDates}
                                bookedDates={bookedDates}
                                cleaningDates={cleaningDates}
                                availableRange={availableRange}
                                onDateChange={handleDateChange}
                                discountRate3Days={discountRate3Days}
                                discountRate7Days={discountRate7Days}
                            />
                        </div>

                        {/* Confirm Button inside mobile modal */}
                        {bookingData.days > 0 && (
                            <div className="mt-6 px-4">
                                <button
                                    onClick={handleBookingClick}
                                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg shadow-lg"
                                >
                                    送出預約 · ${bookingData.total.toLocaleString()}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <>
            {DesktopView}
            {!isOwner && MobileBottomBar}
            {ConfirmModal}
            {ResultModal}
        </>
    );
}
