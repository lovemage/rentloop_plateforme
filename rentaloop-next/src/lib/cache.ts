import { getRedis } from "./redis";

const CACHE_VERSION_KEY = "products:cache_version";
const DEFAULT_TTL = 300; // 5 minutes

export async function getCacheVersion(): Promise<string> {
    const redis = getRedis();
    if (!redis) return "1";

    let version = await redis.get(CACHE_VERSION_KEY);
    if (!version) {
        version = "1";
        await redis.set(CACHE_VERSION_KEY, version);
    }
    return version;
}

export async function invalidateProductCache(): Promise<void> {
    const redis = getRedis();
    if (!redis) return;

    await redis.incr(CACHE_VERSION_KEY);
}

export async function getCached<T>(
    keyBase: string,
    fetchFn: () => Promise<T>,
    ttl: number = DEFAULT_TTL
): Promise<T> {
    const redis = getRedis();
    if (!redis) {
        return await fetchFn();
    }

    try {
        const version = await getCacheVersion();
        const versionedKey = `products:v${version}:${keyBase}`;

        const cachedData = await redis.get(versionedKey);
        if (cachedData) {
            try {
                return JSON.parse(cachedData) as T;
            } catch (e) {
                console.error("Cache Parse Error:", e);
            }
        }

        // Cache Miss
        const data = await fetchFn();

        if (data) {
            await redis.set(versionedKey, JSON.stringify(data), "EX", ttl);
        }

        return data;
    } catch (error) {
        console.error("Cache Error:", error);
        // Fallback to direct fetch on error
        return await fetchFn();
    }
}
