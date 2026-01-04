'use server'

import { auth } from "@/auth";
import { getRedis } from "@/lib/redis";

const VIEWED_LIMIT = 50;

function viewedKey(userId: string) {
  return `user:${userId}:viewed`;
}

function favoritesKey(userId: string) {
  return `user:${userId}:favorites`;
}

export async function recordProductView(itemId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false as const, error: "UNAUTHENTICATED" };

  const redis = getRedis();
  if (!redis) return { success: false as const, error: "REDIS_NOT_CONFIGURED" };

  const key = viewedKey(userId);
  await redis.multi().lrem(key, 0, itemId).lpush(key, itemId).ltrim(key, 0, VIEWED_LIMIT - 1).exec();

  return { success: true as const };
}

export async function getMyViewedProductIds() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false as const, error: "UNAUTHENTICATED" };

  const redis = getRedis();
  if (!redis) return { success: true as const, itemIds: [] as string[], redisConfigured: false as const };

  const itemIds = await redis.lrange(viewedKey(userId), 0, VIEWED_LIMIT - 1);
  return { success: true as const, itemIds, redisConfigured: true as const };
}

export async function toggleFavorite(itemId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false as const, error: "UNAUTHENTICATED" };

  const redis = getRedis();
  if (!redis) return { success: false as const, error: "REDIS_NOT_CONFIGURED" };

  const key = favoritesKey(userId);
  const isMember = await redis.sismember(key, itemId);
  if (isMember) {
    await redis.srem(key, itemId);
    return { success: true as const, favorited: false as const };
  }

  await redis.sadd(key, itemId);
  return { success: true as const, favorited: true as const };
}

export async function getMyFavoriteProductIds() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false as const, error: "UNAUTHENTICATED" };

  const redis = getRedis();
  if (!redis) return { success: true as const, itemIds: [] as string[], redisConfigured: false as const };

  const itemIds = await redis.smembers(favoritesKey(userId));
  return { success: true as const, itemIds, redisConfigured: true as const };
}
