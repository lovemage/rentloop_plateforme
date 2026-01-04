import { Users, Package, FileText, CheckCircle } from "lucide-react";

// Simple Card Component
function StatCard({ title, value, subtext, icon: Icon, colorClass }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="總會員數"
                    value="1,280"
                    subtext="+12 本週新增"
                    icon={Users}
                    colorClass="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="待審核 KYC"
                    value="24"
                    subtext="需要立即處理"
                    icon={CheckCircle}
                    colorClass="bg-orange-50 text-orange-600"
                />
                <StatCard
                    title="上架商品"
                    value="432"
                    subtext="+8 本週新增"
                    icon={Package}
                    colorClass="bg-green-50 text-green-600"
                />
                <StatCard
                    title="進行中訂單"
                    value="18"
                    subtext="包含預約與租賃中"
                    icon={FileText}
                    colorClass="bg-purple-50 text-purple-600"
                />
            </div>

            {/* Recent Activity Section (Placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">近期租賃動態</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        Chart Placeholder
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">待辦事項</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">審核會員資料 #{100 + i}</p>
                                    <p className="text-xs text-gray-500">2 小時前</p>
                                </div>
                                <button className="text-xs font-medium text-blue-600 hover:text-blue-700">查看</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
