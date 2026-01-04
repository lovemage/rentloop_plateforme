import {
    MoreHorizontal,
    Search,
    Filter
} from "lucide-react";

// Mock Data
const members = [
    { id: "u_001", name: "Alice Wu", email: "alice@example.com", role: "verified", kyc: "approved", joinDate: "2024-01-15" },
    { id: "u_002", name: "Bob Chen", email: "bob@test.com", role: "basic", kyc: "pending", joinDate: "2024-02-01" },
    { id: "u_003", name: "Charlie Lin", email: "charlie@gmail.com", role: "basic", kyc: "none", joinDate: "2024-02-10" },
    { id: "u_004", name: "David Wang", email: "david@yahoo.com", role: "basic", kyc: "rejected", joinDate: "2024-01-20" },
];

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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.none}`}>
            {label[status] || status}
        </span>
    );
}

export default function MembersPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">會員管理</h2>
                    <p className="text-sm text-gray-500 mt-1">檢視所有註冊會員與審核 KYC 資料</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        篩選
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm">
                        匯出資料
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="搜尋姓名、Email..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
            </div>

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">會員資訊</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">角色權限</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">KYC 狀態</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">註冊日期</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{member.name}</div>
                                                <div className="text-xs text-gray-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600 capitalize">{member.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={member.kyc} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {member.joinDate}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                        {member.kyc === 'pending' && (
                                            <button className="ml-2 text-orange-600 font-medium text-xs hover:underline">
                                                審核
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">顯示 1-4 筆，共 4 筆</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50" disabled>上一頁</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50" disabled>下一頁</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
