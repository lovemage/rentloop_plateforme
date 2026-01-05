'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface Rental {
    id: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    status: string | null;
    createdAt: Date | null;
    itemId: string;
    itemTitle: string | null;
    itemImages: string[] | null;
    owner?: { name: string | null; image: string | null; };
    renter?: { name: string | null; image: string | null; };
}

export function MemberRentalList({ rentals, type }: { rentals: any[], type: 'renter' | 'owner' }) {
    if (rentals.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">尚無預約紀錄</p>
            </div>
        );
    }

    const getStatusLabel = (status: string | null) => {
        switch (status) {
            case 'pending': return { text: '待確認', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
            case 'approved': return { text: '已確認', class: 'bg-green-100 text-green-700 border-green-200' };
            case 'ongoing': return { text: '租賃中', class: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'completed': return { text: '已完成', class: 'bg-gray-100 text-gray-700 border-gray-200' };
            case 'cancelled': return { text: '已取消', class: 'bg-red-100 text-red-700 border-red-200' };
            case 'rejected': return { text: '已拒絕', class: 'bg-red-100 text-red-700 border-red-200' };
            default: return { text: status, class: 'bg-gray-100 text-gray-500' };
        }
    };

    return (
        <div className="grid gap-4">
            {rentals.map((rental) => {
                const status = getStatusLabel(rental.status);
                const otherParty = type === 'renter' ? rental.owner : rental.renter;
                const otherPartyLabel = type === 'renter' ? '出租者' : '租客';

                return (
                    <div key={rental.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        {/* Item Image */}
                        <div className="relative w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {rental.itemImages && rental.itemImages.length > 0 ? (
                                <Image
                                    src={rental.itemImages[0]}
                                    alt={rental.itemTitle || 'Item'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-bold text-gray-900 line-clamp-1">
                                        <Link href={`/products/${rental.itemId}`} className="hover:text-primary transition-colors">
                                            {rental.itemTitle}
                                        </Link>
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${status.class}`}>
                                        {status.text}
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                    {rental.startDate} ~ {rental.endDate}
                                </div>
                                <div className="mt-2 text-sm text-gray-700 font-medium">
                                    總金額: ${rental.totalAmount.toLocaleString()}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-gray-50">
                                <span className="text-xs">{otherPartyLabel}:</span>
                                {otherParty?.image ? (
                                    <Image src={otherParty.image} alt={otherParty.name || ''} width={20} height={20} className="rounded-full" />
                                ) : (
                                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                                )}
                                <span className="font-medium text-gray-700">{otherParty?.name || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
