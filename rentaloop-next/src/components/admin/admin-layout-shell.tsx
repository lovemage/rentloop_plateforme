"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    Package,
    LayoutDashboard,
    FolderTree,
    LogOut,
    Calendar,
    BadgeCheck,
} from "lucide-react";

const sidebarItems = [
    {
        title: "總覽 (Dashboard)",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "預約訂單管理",
        href: "/admin/rentals",
        icon: Calendar,
    },
    {
        title: "會員管理",
        href: "/admin/members",
        icon: Users,
    },
    {
        title: "租貸會員審核",
        href: "/admin/hosts",
        icon: BadgeCheck,
    },
    {
        title: "商品管理",
        href: "/admin/items",
        icon: Package,
    },
    {
        title: "分類管理",
        href: "/admin/categories",
        icon: FolderTree,
    },
];

export function AdminLayoutShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen w-full bg-gray-50 flex">
            {/* Sidebar - Fixed Width */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-50">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-800">
                        <span className="text-green-600">Rentaloop</span> Admin
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-green-50 text-green-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-green-600" : "text-gray-400"}`} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Footer Area */}
                <div className="p-4 border-t border-gray-100">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        退出後台
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <h1 className="text-lg font-semibold text-gray-800">
                        {sidebarItems.find(i => i.href === pathname)?.title || '後台管理'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                            AD
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
