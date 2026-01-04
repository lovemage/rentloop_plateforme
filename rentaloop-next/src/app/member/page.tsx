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
import { MemberDashboard } from "@/components/member/member-dashboard";

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
    <MemberDashboard
      user={user}
      profile={profileForClient}
      stats={stats}
      myItems={myItems}
      viewed={viewed}
      favorites={favorites}
      redisConfigured={redisConfigured}
    />
  );
}
