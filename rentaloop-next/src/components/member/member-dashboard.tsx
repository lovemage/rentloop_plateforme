'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logout } from '@/app/actions/auth';
import { MemberProfileForm } from '@/components/member/member-profile-form';
import { MemberTrackingLists } from '@/components/member/member-tracking-lists';
import { MemberHostOnboarding } from '@/components/member/member-host-onboarding';
import { AvatarUploader } from '@/components/member/avatar-uploader';
import { MemberRentalList } from '@/components/member/member-rental-list';
import { MemberQAList } from '@/components/member/member-qa-list';
import { ItemActionMenu } from '@/components/member/item-action-menu';

type Tab = 'renter' | 'host';

interface MemberProfile {
    userId: string;
    realName: string | null;
    lineId: string | null;
    phone: string | null;
    city: string | null;
    district: string | null;
    address: string | null;
    hostStatus: string | null;
    hostCity: string | null;
    hostDistrict: string | null;
    kycIdFrontUrl: string | null;
    kycIdBackUrl: string | null;
    hostRulesAccepted: boolean | null;
    hostRulesAcceptedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

interface Stat {
    title: string;
    value: string;
    delta?: string;
    subtitle?: string;
    icon: string;
    accent: string;
}

interface TrackedItem {
    id: string;
    title: string;
    images: string[] | null;
    pickupLocation: string | null;
    pricePerDay: number | null;
    deposit: number | null;
}

interface MyItem {
    id: string;
    title: string;
    images: string[] | null;
    status: string | null;
    pricePerDay: number | null;
    createdAt: Date | null;
}

interface DashboardProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
    };
    profile: MemberProfile | null;
    stats: Stat[];
    myItems: MyItem[];
    viewed: TrackedItem[];
    favorites: TrackedItem[];
    redisConfigured: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userRentals?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    incomingRentals?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingQuestions?: any[];
}

export function MemberDashboard({
    user,
    profile,
    stats,
    myItems,
    viewed,
    favorites,
    redisConfigured,
    userRentals = [],
    incomingRentals = [],
    pendingQuestions = [],
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('renter');

    const isHost = profile?.hostStatus === 'approved';

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white min-h-screen pb-20">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header Section */}
                <section className="mb-8 rounded-3xl bg-surface-light dark:bg-surface-dark p-8 shadow-sm ring-1 ring-border-light dark:ring-border-dark relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <AvatarUploader initialImage={user.image} userName={user.name} />

                            <div className="flex flex-col items-center sm:items-start pt-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                    {isHost && (
                                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary border border-primary/20">
                                            <span className="material-symbols-outlined text-sm icon-filled">verified</span>
                                            已通過審核 (租賃會員)
                                        </div>
                                    )}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-text-sub text-sm">
                                    <span className="material-symbols-outlined text-lg">email</span>
                                    {user.email}
                                </div>
                                <p className="mt-4 max-w-md text-center sm:text-left text-text-main/80 dark:text-white/80 leading-relaxed">
                                    歡迎回來！在此管理您的租賃與商品。
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <form action={logout}>
                                <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-6 py-3 text-sm font-bold shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <span className="material-symbols-outlined">logout</span>
                                    登出
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Tab Navigation */}
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex rounded-xl bg-surface-light dark:bg-surface-dark p-1 ring-1 ring-border-light dark:ring-border-dark shadow-sm">
                        <button
                            onClick={() => setActiveTab('renter')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'renter'
                                ? 'bg-primary text-text-main shadow-sm'
                                : 'text-text-sub hover:bg-gray-100 dark:hover:bg-neutral-800'
                                }`}
                        >
                            <span className="material-symbols-outlined">shopping_bag</span>
                            一般會員
                        </button>
                        <button
                            onClick={() => setActiveTab('host')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'host'
                                ? 'bg-primary text-text-main shadow-sm'
                                : 'text-text-sub hover:bg-gray-100 dark:hover:bg-neutral-800'
                                }`}
                        >
                            <span className="material-symbols-outlined">storefront</span>
                            租賃會員
                            {(incomingRentals.length > 0 || pendingQuestions.length > 0) && (
                                <span className="ml-1 flex h-2 w-2 rounded-full bg-red-500"></span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="animate-fade-in space-y-8">

                    {activeTab === 'renter' && (
                        <div className="space-y-8">
                            {/* Stats for Renter */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl ring-1 ring-border-light dark:ring-border-dark shadow-sm">
                                    <div className="text-text-sub text-sm font-medium mb-1">租借中</div>
                                    <div className="text-3xl font-bold flex items-baseline gap-2">{userRentals.filter(r => r.status === 'ongoing').length} <span className="text-sm font-normal text-text-sub">件商品</span></div>
                                </div>
                                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl ring-1 ring-border-light dark:ring-border-dark shadow-sm">
                                    <div className="text-text-sub text-sm font-medium mb-1">評價</div>
                                    <div className="text-3xl font-bold flex items-baseline gap-2">0 <span className="text-sm font-normal text-text-sub">則收到</span></div>
                                </div>
                                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl ring-1 ring-border-light dark:ring-border-dark shadow-sm">
                                    <div className="text-text-sub text-sm font-medium mb-1">收藏</div>
                                    <div className="text-3xl font-bold flex items-baseline gap-2">{favorites.length} <span className="text-sm font-normal text-text-sub">件商品</span></div>
                                </div>
                            </div>

                            {/* Rentals List */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">我的租賃預約</h3>
                                <MemberRentalList rentals={userRentals} type="renter" />
                            </div>

                            <MemberTrackingLists viewed={viewed} favorites={favorites} redisConfigured={redisConfigured} />

                            {/* Self-contained profile form with accordion */}
                            <MemberProfileForm email={user.email} initialProfile={profile} />
                        </div>
                    )}

                    {activeTab === 'host' && (
                        <div className="space-y-8">
                            {!isHost ? (
                                <div className="max-w-3xl mx-auto">
                                    <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl mb-8 border border-primary/20">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-primary rounded-xl text-text-main shadow-sm">
                                                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">成為租賃會員</h3>
                                                <p className="text-text-main/80 mt-1">解鎖上架功能，開始您的租賃事業。我們會驗證所有出租者的身分，確保社群安全。</p>
                                            </div>
                                        </div>
                                    </div>
                                    <MemberHostOnboarding initialProfile={profile} />
                                </div>
                            ) : (
                                <>
                                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">verified_user</span>
                                        已通過審核，可以開始租賃業務
                                    </div>

                                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {stats.map((stat) => (
                                            <div
                                                key={stat.title}
                                                className="flex flex-col gap-1 rounded-2xl bg-surface-light dark:bg-surface-dark p-5 ring-1 ring-border-light dark:ring-border-dark shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-text-sub">{stat.title}</span>
                                                    <span className={`flex items-center justify-center rounded-full p-1.5 ${stat.accent}`}>
                                                        <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-2 mt-2">
                                                    <span className="text-3xl font-bold">{stat.value}</span>
                                                    {stat.delta && (
                                                        <span className="text-xs font-medium text-primary flex items-center">
                                                            <span className="material-symbols-outlined text-sm">trending_up</span> {stat.delta}
                                                        </span>
                                                    )}
                                                </div>
                                                {stat.subtitle && <span className="text-xs text-text-sub mt-1">{stat.subtitle}</span>}
                                            </div>
                                        ))}
                                    </section>

                                    {/* Incoming Rentals */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold">收到的預約</h3>
                                            <span className="text-sm text-text-sub">共 {incomingRentals.length} 筆</span>
                                        </div>
                                        <MemberRentalList rentals={incomingRentals} type="owner" />
                                    </div>

                                    {/* Pending QA */}
                                    {pendingQuestions.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-orange-600">待回覆問答</h3>
                                                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">{pendingQuestions.length} 則未讀</span>
                                            </div>
                                            <MemberQAList questions={pendingQuestions} />
                                        </div>
                                    )}

                                    <section className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold">您的庫存</h2>
                                            <Link href="/items/new" className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-text-main shadow-sm hover:bg-primary-dark transition-colors">
                                                <span className="material-symbols-outlined">add</span>
                                                上架新商品
                                            </Link>
                                        </div>

                                        {myItems.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                {myItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="group relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-border-light dark:ring-border-dark hover:shadow-md transition-all"
                                                    >
                                                        <Link href={`/products/${item.id}`} className="block relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                                                            {item.images && item.images.length > 0 ? (
                                                                <Image
                                                                    src={item.images[0]!}
                                                                    alt={item.title}
                                                                    fill
                                                                    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${item.status !== 'active' ? 'grayscale opacity-70' : ''}`}
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-gray-400">無圖片</div>
                                                            )}
                                                            <div className="absolute top-3 left-3">
                                                                <span className={`px-2 py-1 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm ${item.status === 'active'
                                                                        ? 'bg-green-500/90 text-white'
                                                                        : 'bg-gray-500/90 text-white'
                                                                    }`}>
                                                                    {item.status === 'active' ? '上架中' : '已下架'}
                                                                </span>
                                                            </div>
                                                        </Link>

                                                        {/* Action Menu - separated from Link */}
                                                        <div className="absolute top-3 right-3 z-10">
                                                            <ItemActionMenu itemId={item.id} currentStatus={item.status || 'active'} />
                                                        </div>

                                                        <div className="p-4">
                                                            <Link href={`/products/${item.id}`}>
                                                                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors truncate">
                                                                    {item.title}
                                                                </h3>
                                                            </Link>
                                                            <div className="flex items-center justify-between mt-3">
                                                                <span className="font-bold text-text-main">${item.pricePerDay}<span className="text-xs font-normal text-text-sub">/天</span></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-16 bg-surface-light dark:bg-surface-dark rounded-3xl border border-dashed border-border-light">
                                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                                    <span className="material-symbols-outlined text-3xl">inventory_2</span>
                                                </div>
                                                <h3 className="text-lg font-bold mb-2">尚未上架商品</h3>
                                                <p className="text-text-sub mb-6">將閒置物品出租給需要的人，開始賺取額外收入。</p>
                                                <Link href="/items/new" className="inline-flex items-center gap-2 font-bold text-primary hover:underline">
                                                    上架第一件商品 <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </Link>
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
