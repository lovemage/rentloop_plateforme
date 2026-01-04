"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Calendar,
    User,
    Package,
    Store,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    ChevronDown,
    Search,
    Filter,
    Loader2,
    type LucideIcon
} from 'lucide-react';
import { getAllRentals, updateRentalStatus, type RentalStatus } from '@/app/actions/rentals';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

type RentalData = {
    id: string;
    startDate: string | null;
    endDate: string | null;
    totalDays: number;
    totalAmount: number;
    status: string | null;
    createdAt: Date | null;
    itemId: string | null;
    itemTitle: string | null;
    itemImages: string[] | null;
    itemPricePerDay: number | null;
    ownerId: string;
    renterId: string;
    owner: { id: string; name: string | null; email: string; image: string | null };
    renter: { id: string; name: string | null; email: string; image: string | null };
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: LucideIcon }> = {
    pending: { label: '待審核', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: Clock },
    approved: { label: '已確認', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: CheckCircle },
    rejected: { label: '已拒絕', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: XCircle },
    ongoing: { label: '租賃中', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', icon: Package },
    completed: { label: '已完成', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle },
    cancelled: { label: '已取消', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', icon: XCircle },
};

function StatusBadge({ status }: { status: string | null }) {
    const config = statusConfig[status || 'pending'] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bgColor} ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
}

function RentalDetailModal({ rental, onClose, onStatusChange }: {
    rental: RentalData;
    onClose: () => void;
    onStatusChange: (id: string, status: RentalStatus) => Promise<void>;
}) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const handleStatusChange = async (newStatus: RentalStatus) => {
        setIsUpdating(true);
        await onStatusChange(rental.id, newStatus);
        setIsUpdating(false);
        setShowStatusMenu(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">預約訂單詳情</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <XCircle className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">訂單狀態</p>
                            <StatusBadge status={rental.status} />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowStatusMenu(!showStatusMenu)}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : '更改狀態'}
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {showStatusMenu && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleStatusChange(key as RentalStatus)}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${rental.status === key ? 'bg-gray-50 font-medium' : ''}`}
                                        >
                                            <config.icon className={`w-4 h-4 ${config.color}`} />
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Item Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" /> 預約物品
                        </h3>
                        <div className="flex gap-4">
                            {rental.itemImages && rental.itemImages[0] ? (
                                <img
                                    src={rental.itemImages[0]}
                                    alt={rental.itemTitle || ''}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-900">{rental.itemTitle || 'Unknown Item'}</p>
                                <p className="text-sm text-gray-500">單日租金: ${rental.itemPricePerDay?.toLocaleString() || 0}</p>
                                <p className="text-xs text-gray-400 mt-1">ID: {rental.itemId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Date & Amount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> 租賃日期
                            </h3>
                            <p className="font-medium text-gray-900">
                                {rental.startDate && rental.endDate
                                    ? `${format(new Date(rental.startDate), 'yyyy年M月d日', { locale: zhTW })} - ${format(new Date(rental.endDate), 'M月d日', { locale: zhTW })}`
                                    : 'N/A'
                                }
                            </p>
                            <p className="text-sm text-gray-500">共 {rental.totalDays} 天</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-green-700 mb-2">總金額</h3>
                            <p className="text-2xl font-bold text-green-600">${rental.totalAmount?.toLocaleString() || 0}</p>
                        </div>
                    </div>

                    {/* Renter Info */}
                    <div className="bg-blue-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" /> 預約會員
                        </h3>
                        <div className="flex items-center gap-3">
                            {rental.renter.image ? (
                                <img src={rental.renter.image} alt={rental.renter.name || ''} className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900">{rental.renter.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{rental.renter.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-purple-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                            <Store className="w-4 h-4" /> 租賃商家
                        </h3>
                        <div className="flex items-center gap-3">
                            {rental.owner.image ? (
                                <img src={rental.owner.image} alt={rental.owner.name || ''} className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                                    <Store className="w-5 h-5 text-purple-600" />
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900">{rental.owner.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{rental.owner.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs text-gray-400 space-y-1">
                        <p>訂單編號: {rental.id}</p>
                        <p>建立時間: {rental.createdAt ? format(new Date(rental.createdAt), 'yyyy年M月d日 HH:mm', { locale: zhTW }) : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminRentalsPage() {
    const [rentals, setRentals] = useState<RentalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRental, setSelectedRental] = useState<RentalData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const loadRentals = useCallback(async () => {
        setIsLoading(true);
        const result = await getAllRentals();
        if (result.success && result.data) {
            setRentals(result.data as RentalData[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRentals();
    }, [loadRentals]);

    // Use useMemo for derived state instead of useEffect + setState
    const filteredRentals = useMemo(() => {
        let filtered = rentals;

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.itemTitle?.toLowerCase().includes(query) ||
                r.renter.name?.toLowerCase().includes(query) ||
                r.renter.email.toLowerCase().includes(query) ||
                r.owner.name?.toLowerCase().includes(query) ||
                r.owner.email.toLowerCase().includes(query) ||
                r.id.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [rentals, searchQuery, statusFilter]);

    const handleStatusChange = async (id: string, status: RentalStatus) => {
        const result = await updateRentalStatus(id, status);
        if (result.success) {
            setRentals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            if (selectedRental?.id === id) {
                setSelectedRental(prev => prev ? { ...prev, status } : null);
            }
        }
    };

    const stats = {
        total: rentals.length,
        pending: rentals.filter(r => r.status === 'pending').length,
        approved: rentals.filter(r => r.status === 'approved').length,
        ongoing: rentals.filter(r => r.status === 'ongoing').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">預約訂單管理</h1>
                    <p className="text-sm text-gray-500 mt-1">管理所有預約訂單與租賃狀態</p>
                </div>
                <button
                    onClick={loadRentals}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                    重新整理
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">全部訂單</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4">
                    <p className="text-sm text-yellow-700">待審核</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                    <p className="text-sm text-blue-700">已確認</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.approved}</p>
                </div>
                <div className="bg-purple-50 rounded-xl border border-purple-100 p-4">
                    <p className="text-sm text-purple-700">租賃中</p>
                    <p className="text-2xl font-bold text-purple-700">{stats.ongoing}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜尋訂單、會員、商品..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">全部狀態</option>
                        <option value="pending">待審核</option>
                        <option value="approved">已確認</option>
                        <option value="rejected">已拒絕</option>
                        <option value="ongoing">租賃中</option>
                        <option value="completed">已完成</option>
                        <option value="cancelled">已取消</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : filteredRentals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Calendar className="w-12 h-12 mb-4" />
                        <p className="font-medium">目前沒有預約訂單</p>
                        <p className="text-sm">當會員送出預約後，訂單將會顯示在這裡</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">預約物品</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">預約會員</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">租賃商家</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">日期範圍</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">金額</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">狀態</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredRentals.map((rental) => (
                                    <tr key={rental.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {rental.itemImages && rental.itemImages[0] ? (
                                                    <img src={rental.itemImages[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm max-w-[150px] truncate">{rental.itemTitle || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400">{rental.totalDays} 天</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {rental.renter.image ? (
                                                    <img src={rental.renter.image} alt="" className="w-7 h-7 rounded-full" />
                                                ) : (
                                                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-blue-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{rental.renter.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400 max-w-[120px] truncate">{rental.renter.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {rental.owner.image ? (
                                                    <img src={rental.owner.image} alt="" className="w-7 h-7 rounded-full" />
                                                ) : (
                                                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <Store className="w-3.5 h-3.5 text-purple-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{rental.owner.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400 max-w-[120px] truncate">{rental.owner.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                {rental.startDate && rental.endDate ? (
                                                    <>
                                                        <p className="text-gray-900">{format(new Date(rental.startDate), 'M/d', { locale: zhTW })} - {format(new Date(rental.endDate), 'M/d', { locale: zhTW })}</p>
                                                        <p className="text-xs text-gray-400">{format(new Date(rental.startDate), 'yyyy年', { locale: zhTW })}</p>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-green-600">${rental.totalAmount?.toLocaleString() || 0}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={rental.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedRental(rental)}
                                                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="查看詳情"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedRental && (
                <RentalDetailModal
                    rental={selectedRental}
                    onClose={() => setSelectedRental(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    );
}
