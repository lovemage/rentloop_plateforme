import Redis, { type RedisOptions } from "ioredis";

declare global {
  var __rentaloopRedis: Redis | undefined;
}

const redisUrl = process.env.REDIS_URL || process.env.RAILWAY_REDIS_URL;

function parseRedisUrl(urlString: string): RedisOptions {
  const url = new URL(urlString);
  const db = Number.parseInt(url.pathname.replace("/", ""), 10);

  return {
    host: url.hostname,
    port: url.port ? Number.parseInt(url.port, 10) : 6379,
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number.isNaN(db) ? undefined : db,
    tls: url.protocol === "rediss:" ? {} : undefined,
  };
}

export function getRedis(): Redis | null {
  if (!redisUrl) return null;

  if (!global.__rentaloopRedis) {
    global.__rentaloopRedis = new Redis({
      ...parseRedisUrl(redisUrl),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }

  return global.__rentaloopRedis;
}
