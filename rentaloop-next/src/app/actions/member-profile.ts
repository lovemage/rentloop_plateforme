'use server'

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const profileSchema = z.object({
  realName: z.string().trim().min(1).max(100).optional().or(z.literal("")),
  lineId: z.string().trim().min(1).max(50).optional().or(z.literal("")),
  phone: z.string().trim().min(1).max(30).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(50).optional().or(z.literal("")),
  district: z.string().trim().min(1).max(50).optional().or(z.literal("")),
  address: z.string().trim().min(1).max(200).optional().or(z.literal("")),

  hostStatus: z.string().trim().min(1).max(50).optional().or(z.literal("")),
  hostCity: z.string().trim().min(1).max(50).optional().or(z.literal("")),
  hostDistrict: z.string().trim().min(1).max(50).optional().or(z.literal("")),

  kycIdFrontUrl: z.string().trim().url().optional().or(z.literal("")),
  kycIdBackUrl: z.string().trim().url().optional().or(z.literal("")),

  hostRulesAccepted: z.coerce.boolean().optional(),
});

function normalizeNullable(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function getMyProfile() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return { success: true as const, profile: profile[0] ?? null };
}

export async function upsertMyProfile(input: unknown) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "INVALID_INPUT" };
  }

  const data = parsed.data;

  await db
    .insert(userProfiles)
    .values({
      userId,
      realName: normalizeNullable(data.realName),
      lineId: normalizeNullable(data.lineId),
      phone: normalizeNullable(data.phone),
      city: normalizeNullable(data.city),
      district: normalizeNullable(data.district),
      address: normalizeNullable(data.address),

      hostStatus: normalizeNullable(data.hostStatus),
      hostCity: normalizeNullable(data.hostCity),
      hostDistrict: normalizeNullable(data.hostDistrict),

      kycIdFrontUrl: normalizeNullable(data.kycIdFrontUrl),
      kycIdBackUrl: normalizeNullable(data.kycIdBackUrl),

      hostRulesAccepted: typeof data.hostRulesAccepted === "boolean" ? data.hostRulesAccepted : undefined,
      hostRulesAcceptedAt:
        typeof data.hostRulesAccepted === "boolean" && data.hostRulesAccepted
          ? new Date()
          : undefined,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        realName: normalizeNullable(data.realName),
        lineId: normalizeNullable(data.lineId),
        phone: normalizeNullable(data.phone),
        city: normalizeNullable(data.city),
        district: normalizeNullable(data.district),
        address: normalizeNullable(data.address),

        hostStatus: normalizeNullable(data.hostStatus),
        hostCity: normalizeNullable(data.hostCity),
        hostDistrict: normalizeNullable(data.hostDistrict),

        kycIdFrontUrl: normalizeNullable(data.kycIdFrontUrl),
        kycIdBackUrl: normalizeNullable(data.kycIdBackUrl),

        hostRulesAccepted: typeof data.hostRulesAccepted === "boolean" ? data.hostRulesAccepted : undefined,
        hostRulesAcceptedAt:
          typeof data.hostRulesAccepted === "boolean" && data.hostRulesAccepted
            ? new Date()
            : undefined,
        updatedAt: new Date(),
      },
    });

  if (data.hostStatus === 'pending' && session.user.email) {
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: session.user.email,
      templateKey: "kyc_submitted",
      data: { name: session.user.name || "Member" }
    });
  }

  const updated = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return { success: true as const, profile: updated[0] ?? null };
}

export async function ensureUserHasProfileRow(userId: string) {
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (existing.length) return;

  await db.insert(userProfiles).values({ userId }).onConflictDoNothing();
}
