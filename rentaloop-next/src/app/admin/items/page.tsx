'use client'

import { useState, useEffect, useCallback } from 'react';
import { getItems, updateItemStatus } from '@/app/actions/items';
import { Search, Filter, Ban, CheckCircle, Eye } from 'lucide-react';

interface ItemData {
    id: string;
    title: string;
    images: string[] | null;
    status: string | null;
    categoryName: string | null;
    ownerName: string | null;
    ownerEmail: string | null;
    price: number | null;
}

export default function ItemsPage() {
    const [items, setItems] = useState<ItemData[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        const result = await getItems();
        if (result.success && result.data) {
            setItems(result.data as ItemData[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (confirm(`確定要將此商品狀態變更為 ${newStatus} 嗎？`)) {
            await updateItemStatus(id, newStatus);
            loadData();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">上架中</span>;
            case 'banned':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">已下架</span>;
            case 'deleted':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200">已刪除</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">未知</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">商品管理</h2>
                    <p className="text-sm text-gray-500 mt-1">管理平台所有租賃商品，處理違規與檢舉</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        篩選狀態
                    </button>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="搜尋商品標題、擁有者..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            📦
                        </div>
                        <h3 className="text-gray-900 font-medium text-lg">暫無商品</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                            當會員在前台新增商品後，資料將會自動顯示於此。
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700 w-[40%]">商品資訊</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">分類</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">擁有者</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">日租金</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">狀態</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">管理</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                {/* Image Placeholder or Actual Image */}
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 relative">
                                                    {item.images && item.images[0] ? (
                                                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        ID: {item.id.slice(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.categoryName || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 font-medium">{item.ownerName || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{item.ownerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${item.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status || 'unknown')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Action Buttons */}
                                                {item.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(item.id, 'banned')}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                        title="下架違規商品"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {item.status === 'banned' && (
                                                    <button
                                                        onClick={() => handleStatusChange(item.id, 'active')}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                                                        title="重新上架"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="查看詳情">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
