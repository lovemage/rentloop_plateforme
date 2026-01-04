import { Users, Package, FileText, CheckCircle, Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, items, rentals } from "@/lib/schema";
import { count, eq, inArray, and, gte, desc } from "drizzle-orm";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

// Simple Card Component
function StatCard({ title, value, subtext, icon: Icon, colorClass, href }: any) {
    const content = (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md hover:border-gray-200 transition-all group">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${colorClass} relative`}>
                <Icon className="w-5 h-5" />
                {href && (
                    <ArrowRight className="w-4 h-4 absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </div>
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }
    return content;
}

// Fetch dashboard statistics
async function getDashboardStats() {
    try {
        // Total users
        const [{ value: totalUsers }] = await db.select({ value: count() }).from(users);

        // Total items
        const [{ value: totalItems }] = await db.select({ value: count() }).from(items);

        // Active items
        const [{ value: activeItems }] = await db.select({ value: count() })
            .from(items)
            .where(eq(items.status, 'active'));

        // Pending rentals
        const [{ value: pendingRentals }] = await db.select({ value: count() })
            .from(rentals)
            .where(eq(rentals.status, 'pending'));

        // Approved/Ongoing rentals
        const [{ value: activeRentals }] = await db.select({ value: count() })
            .from(rentals)
            .where(inArray(rentals.status, ['approved', 'ongoing']));

        // Total rentals
        const [{ value: totalRentals }] = await db.select({ value: count() }).from(rentals);

        // Recent rentals for the activity feed
        const recentRentals = await db.select({
            id: rentals.id,
            status: rentals.status,
            createdAt: rentals.createdAt,
            totalAmount: rentals.totalAmount,
            itemTitle: items.title,
            renterName: users.name,
        })
            .from(rentals)
            .leftJoin(items, eq(rentals.itemId, items.id))
            .leftJoin(users, eq(rentals.renterId, users.id))
            .orderBy(desc(rentals.createdAt))
            .limit(5);

        return {
            totalUsers,
            totalItems,
            activeItems,
            pendingRentals,
            activeRentals,
            totalRentals,
            recentRentals,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalUsers: 0,
            totalItems: 0,
            activeItems: 0,
            pendingRentals: 0,
            activeRentals: 0,
            totalRentals: 0,
            recentRentals: [],
        };
    }
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    const statusLabels: Record<string, { label: string; color: string }> = {
        pending: { label: '待審核', color: 'bg-yellow-500' },
        approved: { label: '已確認', color: 'bg-blue-500' },
        ongoing: { label: '租賃中', color: 'bg-purple-500' },
        completed: { label: '已完成', color: 'bg-green-500' },
        rejected: { label: '已拒絕', color: 'bg-red-500' },
        cancelled: { label: '已取消', color: 'bg-gray-500' },
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="總會員數"
                    value={stats.totalUsers.toLocaleString()}
                    subtext="平台註冊會員"
                    icon={Users}
                    colorClass="bg-blue-50 text-blue-600"
                    href="/admin/members"
                />
                <StatCard
                    title="待審核預約"
                    value={stats.pendingRentals.toLocaleString()}
                    subtext="需要立即處理"
                    icon={Clock}
                    colorClass="bg-orange-50 text-orange-600"
                    href="/admin/rentals"
                />
                <StatCard
                    title="上架商品"
                    value={stats.activeItems.toLocaleString()}
                    subtext={`共 ${stats.totalItems} 件商品`}
                    icon={Package}
                    colorClass="bg-green-50 text-green-600"
                    href="/admin/items"
                />
                <StatCard
                    title="進行中訂單"
                    value={stats.activeRentals.toLocaleString()}
                    subtext={`共 ${stats.totalRentals} 筆訂單`}
                    icon={Calendar}
                    colorClass="bg-purple-50 text-purple-600"
                    href="/admin/rentals"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-800">近期預約訂單</h3>
                        <Link href="/admin/rentals" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                            查看全部 <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {stats.recentRentals.length === 0 ? (
                        <div className="h-64 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400">
                            <Calendar className="w-12 h-12 mb-3" />
                            <p>目前沒有預約訂單</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentRentals.map((rental) => {
                                const statusConfig = statusLabels[rental.status || 'pending'] || statusLabels.pending;
                                return (
                                    <Link
                                        key={rental.id}
                                        href="/admin/rentals"
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {rental.itemTitle || 'Unknown Item'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {rental.renterName || 'Unknown'} · ${rental.totalAmount?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    rental.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                        rental.status === 'ongoing' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-gray-100 text-gray-700'
                                                }`}>
                                                {statusConfig.label}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {rental.createdAt ? format(new Date(rental.createdAt), 'M/d HH:mm', { locale: zhTW }) : ''}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">快速操作</h3>
                    <div className="space-y-3">
                        <Link
                            href="/admin/rentals"
                            className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-orange-700"
                        >
                            <Clock className="w-5 h-5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">審核預約訂單</p>
                                <p className="text-xs opacity-75">{stats.pendingRentals} 筆待處理</p>
                            </div>
                        </Link>
                        <Link
                            href="/admin/members"
                            className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-700"
                        >
                            <Users className="w-5 h-5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">會員管理</p>
                                <p className="text-xs opacity-75">{stats.totalUsers} 位會員</p>
                            </div>
                        </Link>
                        <Link
                            href="/admin/items"
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-green-700"
                        >
                            <Package className="w-5 h-5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">商品管理</p>
                                <p className="text-xs opacity-75">{stats.totalItems} 件商品</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
