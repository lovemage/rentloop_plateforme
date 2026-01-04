import Redis from "ioredis";

declare global {
  var __rentaloopRedis: Redis | undefined;
}

const redisUrl = process.env.REDIS_URL || process.env.RAILWAY_REDIS_URL;

export function getRedis(): Redis | null {
  if (!redisUrl) return null;

  if (!global.__rentaloopRedis) {
    global.__rentaloopRedis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }

  return global.__rentaloopRedis;
}
