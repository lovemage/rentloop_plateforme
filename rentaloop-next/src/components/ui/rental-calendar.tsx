"use client"

import { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isBefore,
    isAfter,
    addDays,
    differenceInDays,
    isWithinInterval
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface RentalCalendarProps {
    pricePerDay: number;
    disabledDates?: Date[];
    availableRange?: { from: Date | null; to: Date | null };
    onDateChange?: (startDate: Date | null, endDate: Date | null, days: number, total: number) => void;
    discountRate3Days?: number;
    discountRate7Days?: number;
}

export function RentalCalendar({
    pricePerDay,
    disabledDates = [],
    availableRange,
    onDateChange,
    discountRate3Days = 0,
    discountRate7Days = 0
}: RentalCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // ... (calendar gen)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDateCalendar = startOfWeek(monthStart);
    const endDateCalendar = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDateCalendar,
        end: endDateCalendar,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const isDateDisabled = (date: Date) => {
        if (isBefore(date, addDays(new Date(), -1))) return true;
        if (availableRange?.from && isBefore(date, availableRange.from)) return true;
        if (availableRange?.to && isAfter(date, availableRange.to)) return true;
        return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
    };

    const calculateTotal = (start: Date, end: Date) => {
        const days = differenceInDays(end, start) + 1;
        let rate = 0;
        if (days >= 7 && discountRate7Days > 0) rate = discountRate7Days;
        else if (days >= 3 && discountRate3Days > 0) rate = discountRate3Days;

        const total = Math.round(days * pricePerDay * (1 - rate / 100));
        return { total, rate };
    };

    const handleDateClick = (date: Date) => {
        if (isDateDisabled(date)) return;

        let newStart = startDate;
        let newEnd = endDate;

        if (!startDate || (startDate && endDate)) {
            newStart = date;
            newEnd = null;
        } else if (startDate && !endDate) {
            if (isBefore(date, startDate)) {
                newStart = date;
                newEnd = null;
            } else {
                const range = eachDayOfInterval({ start: startDate, end: date });
                const hasDisabled = range.some(d => isDateDisabled(d));
                if (hasDisabled) {
                    toast.error('選擇期間包含不可租用的日期，請重新選擇');
                    newStart = date;
                    newEnd = null;
                } else {
                    newEnd = date;
                }
            }
        }

        setStartDate(newStart);
        setEndDate(newEnd);

        if (newStart && newEnd) {
            const days = differenceInDays(newEnd, newStart) + 1;
            const { total } = calculateTotal(newStart, newEnd);
            if (onDateChange) onDateChange(newStart, newEnd, days, total);
        } else if (onDateChange) {
            onDateChange(newStart, null, 0, 0);
        }
    };

    // Helper styles
    const getDayClass = (date: Date) => {
        const disabled = isDateDisabled(date);
        if (disabled) return "text-gray-300 cursor-not-allowed bg-gray-50 bg-[url('/cross-hatch.png')]"; // Example pattern

        const isStart = startDate && isSameDay(date, startDate);
        const isEnd = endDate && isSameDay(date, endDate);
        const inRange = startDate && endDate && isWithinInterval(date, { start: startDate, end: endDate });

        if (isStart || isEnd) return "bg-green-600 text-white font-medium shadow-md scale-105 z-10";
        if (inRange) return "bg-green-100 text-green-700";

        return "text-gray-700 hover:bg-green-50 hover:text-green-600";
    };

    // Summary
    const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
    const { total, rate } = (startDate && endDate) ? calculateTotal(startDate, endDate) : { total: 0, rate: 0 };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-gray-900">
                    {format(currentMonth, 'yyyy年 M月')}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                    <div key={day} className="text-center text-xs text-gray-400 font-medium py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDateClick(date)}
                        disabled={isDateDisabled(date)}
                        className={`
              relative h-9 w-full flex items-center justify-center text-sm rounded-lg transition-all duration-200
              ${!isSameMonth(date, currentMonth) ? 'opacity-0 pointer-events-none' : ''}
              ${getDayClass(date)}
            `}
                    >
                        {format(date, 'd')}
                    </button>
                ))}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                        {startDate ? format(startDate, 'MM/dd') : '-'}
                        {' → '}
                        {endDate ? format(endDate, 'MM/dd') : '-'}
                    </span>
                    <span className="font-medium text-gray-900">
                        {days > 0 ? `${days} 天` : '未選擇日期'}
                    </span>
                </div>

                <div className="mt-2 flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                    {rate > 0 && (
                        <div className="flex justify-between text-xs text-green-600 mb-1">
                            <span>長租優惠 ({rate}% off)</span>
                            <span className="line-through text-gray-400">${(days * pricePerDay).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">總金額</span>
                        <span className="text-lg font-bold text-green-600">
                            ${total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
