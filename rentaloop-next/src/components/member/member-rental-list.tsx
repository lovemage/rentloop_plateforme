'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { approveRental, rejectRental, completeRental, submitReview } from '@/app/actions/rentals';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

interface Rental {
    id: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalAmount: number;
    status: string | null;
    rejectionReason?: string | null;
    createdAt: Date | null;
    itemId: string;
    itemTitle: string | null;
    itemImages: string[] | null;
    owner?: { name: string | null; image: string | null; lineId?: string | null };
    renter?: { name: string | null; image: string | null; lineId?: string | null };
}

export function MemberRentalList({ rentals, type }: { rentals: Rental[], type: 'renter' | 'owner' }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Modal States
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    if (rentals.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">尚無預約紀錄</p>
            </div>
        );
    }

    const handleApprove = (rentalId: string) => {
        if (!confirm('確定要接受此預約嗎？接受後將進入「已確認」狀態。')) return;
        startTransition(async () => {
            const res = await approveRental(rentalId);
            if (res.success) {
                toast.success('已接受預約');
                router.refresh();
            } else {
                toast.error(res.error || '操作失敗');
            }
        });
    };

    const handleComplete = (rentalId: string) => {
        if (!confirm('確認租賃已完成歸還？')) return;
        startTransition(async () => {
            const res = await completeRental(rentalId);
            if (res.success) {
                toast.success('訂單已完成');
                router.refresh();
            } else {
                toast.error(res.error || '操作失敗');
            }
        });
    };

    const openRejectModal = (rentalId: string) => {
        setSelectedRentalId(rentalId);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const submitRejection = () => {
        if (!selectedRentalId || !rejectionReason.trim()) {
            toast.error('請填寫拒絕原因');
            return;
        }
        startTransition(async () => {
            const res = await rejectRental(selectedRentalId, rejectionReason);
            if (res.success) {
                toast.success('已拒絕預約');
                setRejectModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error || '操作失敗');
            }
        });
    };

    const openReviewModal = (rentalId: string) => {
        setSelectedRentalId(rentalId);
        setRating(5);
        setComment('');
        setReviewModalOpen(true);
    };

    const submitReviewHandler = () => {
        if (!selectedRentalId) return;
        startTransition(async () => {
            const res = await submitReview({
                rentalId: selectedRentalId,
                rating,
                comment,
            });
            if (res.success) {
                toast.success('評價已送出');
                setReviewModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error || '評價失敗');
            }
        });
    };

    const getStatusInfo = (status: string | null) => {
        // Updated colors for better readability
        switch (status) {
            case 'pending': return { text: '待確認', class: 'bg-amber-100 text-amber-800 border-amber-200', desc: '等待出租方確認' };
            case 'approved': return { text: '已確認', class: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: '預約成立，等待取貨' };
            case 'ongoing': return { text: '租賃中', class: 'bg-blue-100 text-blue-800 border-blue-200', desc: '商品租用中' };
            case 'completed': return { text: '已完成', class: 'bg-gray-100 text-gray-800 border-gray-200', desc: '訂單已結束' };
            case 'cancelled': return { text: '已取消', class: 'bg-red-50 text-red-600 border-red-200', desc: '預約已取消' };
            case 'rejected': return { text: '已拒絕', class: 'bg-rose-50 text-rose-700 border-rose-200', desc: '出租方已拒絕' };
            case 'blocked': return { text: '已封鎖', class: 'bg-gray-200 text-gray-600 border-gray-300', desc: '日期保留' };
            default: return { text: status || '未知', class: 'bg-gray-100 text-gray-600', desc: '' };
        }
    };

    return (
        <>
            <div className="grid gap-4">
                {rentals.map((rental) => {
                    const statusInfo = getStatusInfo(rental.status);
                    const otherParty = type === 'renter' ? rental.owner : rental.renter;
                    const otherPartyLabel = type === 'renter' ? '出租者' : '租客';

                    // Determine if Line ID should be shown
                    // Show Line ID if status is approved or ongoing
                    const showLineId = ['approved', 'ongoing'].includes(rental.status || '');

                    return (
                        <div key={rental.id} className="group flex flex-col sm:flex-row gap-5 p-5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-2xl shadow-sm hover:shadow-md transition-all">
                            {/* Item Image */}
                            <div className="relative w-full sm:w-36 h-36 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                                {rental.itemImages && rental.itemImages.length > 0 ? (
                                    <Image
                                        src={rental.itemImages[0]}
                                        alt={rental.itemTitle || 'Item'}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                                            <Link href={`/products/${rental.itemId}`} className="hover:text-primary transition-colors">
                                                {rental.itemTitle}
                                            </Link>
                                        </h4>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.class}`}>
                                            {statusInfo.text}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-primary">
                                            ${rental.totalAmount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-text-sub font-medium">
                                            共 {rental.totalDays} 天
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-2">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                        <span className="font-medium">{rental.startDate} ~ {rental.endDate}</span>
                                    </div>

                                    {/* User Info & Line ID */}
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                            {otherParty?.image ? (
                                                <Image src={otherParty.image} alt={otherParty.name || ''} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">?</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-500">{otherPartyLabel}</div>
                                            <div className="font-medium text-gray-900 truncate">{otherParty?.name}</div>
                                            {showLineId && otherParty?.lineId && (
                                                <div className="text-xs font-bold text-green-600 flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-sm">chat</span>
                                                    ID: {otherParty.lineId}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Area */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 items-center justify-end">
                                    {/* Reject Reason Display */}
                                    {rental.status === 'rejected' && rental.rejectionReason && (
                                        <div className="mr-auto text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                            <span className="font-bold">拒絕原因：</span> {rental.rejectionReason}
                                        </div>
                                    )}

                                    {/* Owner Actions */}
                                    {type === 'owner' && rental.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => openRejectModal(rental.id)}
                                                disabled={isPending}
                                                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                拒絕預約
                                            </button>
                                            <button
                                                onClick={() => handleApprove(rental.id)}
                                                disabled={isPending}
                                                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all disabled:opacity-50"
                                            >
                                                開始出租
                                            </button>
                                        </>
                                    )}

                                    {type === 'owner' && (rental.status === 'approved' || rental.status === 'ongoing') && (
                                        <button
                                            onClick={() => handleComplete(rental.id)}
                                            disabled={isPending}
                                            className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                            完成出租
                                        </button>
                                    )}


                                    {/* Renter Actions */}
                                    {type === 'renter' && rental.status === 'completed' && (
                                        <button
                                            onClick={() => openReviewModal(rental.id)}
                                            className="px-4 py-2 text-sm font-bold text-primary border-2 border-primary/20 hover:bg-primary/5 rounded-xl transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-lg">star</span>
                                            評價 Host
                                        </button>
                                    )}

                                    {type === 'owner' && rental.status === 'completed' && (
                                        <button
                                            onClick={() => openReviewModal(rental.id)}
                                            className="px-4 py-2 text-sm font-bold text-primary border-2 border-primary/20 hover:bg-primary/5 rounded-xl transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-lg">star</span>
                                            評價租客
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-xl ring-1 ring-gray-900/5 scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-4">拒絕預約</h3>
                        <p className="text-sm text-gray-500 mb-4">請填寫拒絕原因，這將透過 Email 通知租客。</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="例如：該時段已租出、商品暫時損壞..."
                            className="w-full h-32 p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none mb-4 text-sm"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={isPending || !rejectionReason.trim()}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isPending ? '處理中...' : '確認拒絕'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-xl ring-1 ring-gray-900/5 scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-4 text-center">給予評價</h3>
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                >
                                    <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>

                        <p className="text-sm font-bold text-gray-700 mb-2">評論 (選填)</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="說說您的體驗..."
                            className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none mb-6 text-sm"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={submitReviewHandler}
                                disabled={isPending}
                                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all disabled:opacity-50"
                            >
                                {isPending ? '送出中...' : '送出評價'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
