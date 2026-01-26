import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { items, userProfiles } from "@/lib/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getMyFavoriteProductIds, getMyViewedProductIds } from "@/app/actions/tracking";
import { getUserRentals, getOwnerRentals } from "@/app/actions/rentals";
import { getPendingQuestions } from "@/app/actions/qa";
import { MemberDashboard } from "@/components/member/member-dashboard";

// Keep some mocks for unimplemented features
const getStats = (itemCount: number) => [
  {
    title: "已上架物品",
    value: itemCount.toString(),
    delta: "+0 本月",
    icon: "inventory_2",
    accent: "text-emerald-600 bg-primary/20",
  },
  {
    title: "租借中",
    value: "0",
    subtitle: "筆進行中",
    icon: "shopping_bag",
    accent: "text-emerald-600 bg-primary/20",
  },
  {
    title: "CO₂ 節省量",
    value: "0kg",
    delta: "+0%",
    icon: "cloud_off",
    accent: "text-emerald-600 bg-primary/20",
  },
  {
    title: "環保影響",
    value: "高",
    subtitle: "等級",
    icon: "forest",
    accent: "text-emerald-600 bg-primary/20",
  },
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
      .where(inArray(items.id, trackingIds as string[]))
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



  // Fetch rentals
  const userRentalsRes = await getUserRentals();
  const userRentals = userRentalsRes.success && userRentalsRes.data ? userRentalsRes.data : [];

  const ownerRentalsRes = await getOwnerRentals();
  const incomingRentals = ownerRentalsRes.success && ownerRentalsRes.data ? ownerRentalsRes.data : [];

  // Fetch pending questions
  const qaRes = await getPendingQuestions();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingQuestions = qaRes.success && qaRes.data ? qaRes.data as any[] : [];

  // Generate stats with actual item count
  const stats = getStats(myItems.length);

  return (
    <MemberDashboard
      user={user}
      profile={profileForClient}
      stats={stats}
      myItems={myItems}
      viewed={viewed}
      favorites={favorites}
      redisConfigured={redisConfigured}
      userRentals={userRentals}
      incomingRentals={incomingRentals}
      pendingQuestions={pendingQuestions}
    />
  );
}
