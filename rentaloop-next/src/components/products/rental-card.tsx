"use client"

import { useState } from 'react';
import { RentalCalendar } from '@/components/ui/rental-calendar';
import { Calendar, X } from 'lucide-react';

interface RentalCardProps {
    pricePerDay: number;
    deposit: number;
    blockedDates?: Date[];
    availableRange?: { from: Date | null; to: Date | null };
}

export function RentalCard({ pricePerDay, deposit, blockedDates = [], availableRange }: RentalCardProps) {
    const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
    const [bookingData, setBookingData] = useState<{ start: Date | null, end: Date | null, days: number, total: number }>({
        start: null, end: null, days: 0, total: 0
    });

    const handleDateChange = (start: Date | null, end: Date | null, days: number, total: number) => {
        setBookingData({ start, end, days, total });
    };

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
                        availableRange={availableRange}
                        onDateChange={handleDateChange}
                    />
                </div>
            </div>

            <button
                disabled={bookingData.days === 0}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
            >
                {bookingData.days > 0 ? `預約 ${bookingData.days} 天 · $${bookingData.total.toLocaleString()}` : '選擇日期'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">您暫時不會被扣款</p>
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
                        {bookingData.days > 0 ? `${bookingData.days} 天旅遊` : '尚未選擇日期'}
                    </div>
                </div>

                <button
                    onClick={() => setIsMobileCalendarOpen(true)}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                >
                    {bookingData.days > 0 ? '去結帳' : '預約'}
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
                                availableRange={availableRange}
                                onDateChange={handleDateChange}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <>
            {DesktopView}
            {MobileBottomBar}
        </>
    );
}
