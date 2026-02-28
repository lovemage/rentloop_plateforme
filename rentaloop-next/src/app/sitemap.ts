import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { items } from "@/lib/schema";

const BASE_URL = "https://rentaloop.net";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/delivery-rules", changeFrequency: "monthly", priority: 0.7 },
  { path: "/qa", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.5 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.5 },
];

function toDate(value: unknown, fallback: Date): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const productRows = await db
      .select({
        id: items.id,
        createdAt: items.createdAt,
      })
      .from(items)
      .where(eq(items.status, "active"));

    const productEntries: MetadataRoute.Sitemap = productRows.map((product) => ({
      url: `${BASE_URL}/products/${product.id}`,
      lastModified: toDate(product.createdAt, now),
      changeFrequency: "daily",
      priority: 0.7,
    }));

    return [...staticEntries, ...productEntries];
  } catch (error) {
    console.error("sitemap: failed to load product URLs", error);
    return staticEntries;
  }
}
