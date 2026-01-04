'use client';

import { useState, useEffect, useCallback } from "react";
import {
    MoreHorizontal,
    Search,
    Filter,
    RotateCcw
} from "lucide-react";
import { getAdminMembers } from "@/app/actions/admin-members";
import { MemberEditModal } from "@/components/admin/member-edit-modal";
import toast from "react-hot-toast";

// Type matching the return from server action
interface MemberData {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
    isBlocked: boolean | null;
    adminNotes: string | null;
    kycStatus: string | null;
    kycFront: string | null;
    kycBack: string | null;
    realName: string | null;
    phone: string | null;
    hostCity: string | null;
    createdAt: Date | null;
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        approved: "bg-green-100 text-green-700 border-green-200",
        pending: "bg-orange-100 text-orange-700 border-orange-200",
        rejected: "bg-red-100 text-red-700 border-red-200",
        none: "bg-gray-100 text-gray-600 border-gray-200",
    };

    const label: Record<string, string> = {
        approved: "已認證",
        pending: "審核中",
        rejected: "已退回",
        none: "未認證",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles.none}`}>
            {label[status] || status}
        </span>
    );
}

export default function MembersPage() {
    const [members, setMembers] = useState<MemberData[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

    const LIMIT = 10;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminMembers(page, LIMIT, search);
            setMembers(res.data);
            setTotal(res.total);
        } catch (error) {
            console.error(error);
            toast.error("載入失敗");
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1
        fetchData();
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">會員管理</h2>
                    <p className="text-sm text-gray-500 mt-1">管理所有註冊會員、審核 KYC 與查看詳情</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        重新整理
                    </button>
                    {/* <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm">
                        匯出資料
                    </button> */}
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜尋姓名、Email..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </form>

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">會員資訊</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">狀態</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">KYC 狀態</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">註冊日期</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        載入中...
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        沒有找到符合的會員
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr
                                        key={member.id}
                                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${member.isBlocked ? 'bg-red-50/30' : ''}`}
                                        onClick={() => setSelectedMember(member)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                                                    {member.name ? member.name.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{member.name || '無名稱'}</div>
                                                    <div className="text-xs text-gray-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.isBlocked ? (
                                                <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded-full">封鎖中</span>
                                            ) : (
                                                <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full">正常</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={member.kycStatus || 'none'} />
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMember(member);
                                                }}
                                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                            {member.kycStatus === 'pending' && (
                                                <button
                                                    className="ml-2 text-orange-600 font-bold text-xs hover:underline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMember(member);
                                                    }}
                                                >
                                                    待審核
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        顯示 {(page - 1) * LIMIT + 1}-{Math.min(page * LIMIT, total)} 筆，共 {total} 筆
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 font-bold"
                        >
                            上一頁
                        </button>
                        <button
                            disabled={page * LIMIT >= total}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 font-bold"
                        >
                            下一頁
                        </button>
                    </div>
                </div>
            </div>

            {selectedMember && (
                <MemberEditModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                    onRefresh={fetchData}
                />
            )}
        </div>
    );
}
