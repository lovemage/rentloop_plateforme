import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { items, userProfiles } from "@/lib/schema";
import { eq, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions/auth";
import { MemberProfileForm } from "@/components/member/member-profile-form";
import { MemberTrackingLists } from "@/components/member/member-tracking-lists";
import { MemberHostOnboarding } from "@/components/member/member-host-onboarding";
import { getMyFavoriteProductIds, getMyViewedProductIds } from "@/app/actions/tracking";

// Keep some mocks for unimplemented features
const stats = [
  {
    title: "Items Shared",
    value: "0", // Will update dynamically
    delta: "+0 this month",
    icon: "inventory_2",
    accent: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Borrowing",
    value: "0",
    subtitle: "active rentals",
    icon: "shopping_bag",
    accent: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    title: "CO₂ Saved",
    value: "0kg",
    delta: "+0%",
    icon: "cloud_off",
    accent: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Eco Impact",
    value: "High",
    subtitle: "level",
    icon: "forest",
    accent: "text-emerald-600 bg-primary/20",
  },
];

const reviewsMock = [
  {
    name: "System",
    subtitle: "Welcome",
    badge: "Official",
    badgeColor: "bg-primary/10 text-primary",
    quote: "歡迎加入 Rentaloop！開始上架您的第一件閒置物品吧。",
    date: "Just now",
    avatar: null,
  }
];

export default async function MemberPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth');
  }
  const user = session.user;

  const profileRow = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  const profile = profileRow[0] ?? null;

  const profileForClient = profile
    ? {
        ...profile,
        createdAt: profile.createdAt ? profile.createdAt.toISOString() : null,
        updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : null,
        hostRulesAcceptedAt: profile.hostRulesAcceptedAt ? profile.hostRulesAcceptedAt.toISOString() : null,
      }
    : null;

  const viewedResult = await getMyViewedProductIds();
  const favoritesResult = await getMyFavoriteProductIds();

  const viewedIds = viewedResult.success ? viewedResult.itemIds : [];
  const favoriteIds = favoritesResult.success ? favoritesResult.itemIds : [];

  const redisConfigured = Boolean(
    viewedResult.success && favoritesResult.success && viewedResult.redisConfigured && favoritesResult.redisConfigured
  );

  const trackingIds = Array.from(new Set([...viewedIds, ...favoriteIds]));

  const trackedItems = trackingIds.length
    ? await db
        .select({
          id: items.id,
          title: items.title,
          images: items.images,
          pickupLocation: items.pickupLocation,
          pricePerDay: items.pricePerDay,
          deposit: items.deposit,
        })
        .from(items)
        .where(inArray(items.id, trackingIds as any))
    : [];

  const trackedById = new Map(trackedItems.map((i) => [i.id, i] as const));

  const viewed = viewedIds
    .map((id) => trackedById.get(id))
    .filter(Boolean) as typeof trackedItems;

  const favorites = favoriteIds
    .map((id) => trackedById.get(id))
    .filter(Boolean) as typeof trackedItems;

  // Fetch real inventory
  const myItems = await db.select().from(items)
    .where(eq(items.ownerId, user.id))
    .orderBy(desc(items.createdAt));

  // Update stats slightly
  stats[0].value = myItems.length.toString();

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm ring-1 ring-border-light dark:ring-border-dark">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="relative">
                <div className="size-32 rounded-full overflow-hidden ring-4 ring-primary/20 bg-gray-200">
                  {user.image ? (
                    <Image src={user.image} alt={user.name || 'User'} width={128} height={128} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full bg-primary text-text-main ring-2 ring-white dark:ring-background-dark">
                  <span className="material-symbols-outlined text-lg font-bold">verified</span>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                  <div className="flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:text-yellow-400">
                    <span className="material-symbols-outlined text-sm icon-filled text-yellow-500">star</span>
                    New Member
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-text-sub sm:flex-row sm:items-center sm:gap-4">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">email</span>
                    {user.email}
                  </span>
                </div>
                <p className="max-w-xl text-base leading-relaxed mt-2 text-text-main/80 dark:text-white/80">
                  Welcome to your Rentaloop profile. Start sharing your item to reduce waste!
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:flex-col lg:flex-row">
              <Link href="/items/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-text-main shadow-sm hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined">add</span>
                上架新物品
              </Link>
              <form action={logout}>
                <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                  <span className="material-symbols-outlined">logout</span>
                  登出
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="flex flex-col gap-1 rounded-xl bg-surface-light dark:bg-surface-dark p-5 ring-1 ring-border-light dark:ring-border-dark shadow-sm"
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
                {stat.subtitle && <span className="text-xs text-text-sub">{stat.subtitle}</span>}
              </div>
            </div>
          ))}
        </section>

        <div className="space-y-8">
          <MemberProfileForm email={user.email} initialProfile={profileForClient as any} />
          <MemberTrackingLists viewed={viewed as any} favorites={favorites as any} redisConfigured={redisConfigured} />
          <MemberHostOnboarding initialProfile={profileForClient as any} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <nav aria-label="Tabs" className="sticky top-24 flex flex-row overflow-x-auto lg:flex-col gap-2 pb-4 lg:pb-0">
              {[
                { label: "Items for Rent", icon: "storefront", count: myItems.length.toString(), active: true },
                { label: "Currently Borrowing", icon: "shopping_basket", count: "0" },
                { label: "History", icon: "history" },
                { label: "Reviews", icon: "star_rate", count: "0" },
              ].map((tab) => (
                <a
                  key={tab.label}
                  className={`group flex min-w-fit items-center gap-3 rounded-lg px-4 py-3 text-sm ${tab.active
                      ? "bg-primary/10 dark:bg-primary/20 text-text-main font-bold ring-1 ring-primary/50"
                      : "text-text-sub hover:bg-surface-light dark:hover:bg-surface-dark hover:text-text-main transition-colors"
                    }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  {tab.label}
                  {tab.count && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs ${tab.active ? "bg-primary text-black" : "opacity-60"
                        }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Inventory</h2>
              <Link href="/items/new" className="text-sm font-bold text-primary hover:underline">Add New</Link>
            </div>

            {/* INVENTORY GRID */}
            {myItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {myItems.map((item) => (
                  <Link
                    href={`/products/${item.id}`}
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-border-light dark:ring-border-dark hover:shadow-md transition-shadow block"
                  >
                    <div className="aspect-[4/3] w-full bg-gray-100 relative">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]!}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                      )}
                      <div className="absolute right-3 top-3 rounded-full bg-background-light/90 dark:bg-background-dark/90 px-2 py-1 text-xs font-bold shadow-sm">
                        <span className="text-primary">{item.status}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-text-sub mb-3 truncate">{item.description}</p>
                      <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-3 text-sm">
                        <span className="font-bold text-text-main">${item.pricePerDay}/day</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-xl border border-dashed border-border-light">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inventory_2</span>
                <p className="text-gray-500">You haven't listed any items yet.</p>
                <Link href="/items/new" className="mt-4 inline-block font-bold text-primary hover:underline">List your first item</Link>
              </div>
            )}

            <div className="mt-12 opacity-50 pointer-events-none filter blur-[2px] select-none relative">
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="bg-white/80 dark:bg-black/80 px-4 py-2 rounded-lg font-bold">Coming Soon: History & Reviews</div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent History</h2>
              </div>
              {/* History Table Placeholder */}
              <div className="overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark ring-1 ring-border-light dark:ring-border-dark h-32"></div>
            </div>

            <div className="mt-12">
              {/* Reviews */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Latest Reviews (Demo)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewsMock.map((review) => (
                  <div key={review.name} className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark ring-1 ring-border-light dark:ring-border-dark">
                    <p className="italic">"{review.quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
