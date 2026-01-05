'use server'

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userProfiles, users } from "@/lib/schema";
import { getSignedKycUrl } from "@/lib/supabase-s3";
import { desc, eq, inArray } from "drizzle-orm";
import type { Session } from "next-auth";

type HostStatus = "pending" | "approved" | "rejected" | "none";

function assertAdmin(session: Session | null) {
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  if (session.user.role !== "admin") throw new Error("FORBIDDEN");
}

/**
 * Generate signed URLs for KYC images if they are S3 keys
 */
async function getSignedKycUrls(frontKey: string | null, backKey: string | null) {
  // Check if the URL is already a full URL (not an S3 key)
  const isFullUrl = (url: string | null) => url?.startsWith('http://') || url?.startsWith('https://');

  const frontUrl = frontKey
    ? isFullUrl(frontKey)
      ? frontKey
      : await getSignedKycUrl(frontKey, 3600)
    : null;

  const backUrl = backKey
    ? isFullUrl(backKey)
      ? backKey
      : await getSignedKycUrl(backKey, 3600)
    : null;

  return { frontUrl, backUrl };
}

export async function listHostApplications() {
  const session = await auth();
  assertAdmin(session);

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      hostStatus: userProfiles.hostStatus,
      hostCity: userProfiles.hostCity,
      hostDistrict: userProfiles.hostDistrict,
      hostRulesAccepted: userProfiles.hostRulesAccepted,
      hostRulesAcceptedAt: userProfiles.hostRulesAcceptedAt,
      kycIdFrontUrl: userProfiles.kycIdFrontUrl,
      kycIdBackUrl: userProfiles.kycIdBackUrl,
      updatedAt: userProfiles.updatedAt,
    })
    .from(userProfiles)
    .leftJoin(users, eq(userProfiles.userId, users.id))
    .where(inArray(userProfiles.hostStatus, ["pending", "approved", "rejected"]))
    .orderBy(desc(userProfiles.updatedAt));

  // Generate signed URLs for all KYC images
  const rowsWithSignedUrls = await Promise.all(
    rows.map(async (row) => {
      const { frontUrl, backUrl } = await getSignedKycUrls(row.kycIdFrontUrl, row.kycIdBackUrl);
      return {
        ...row,
        kycIdFrontUrl: frontUrl,
        kycIdBackUrl: backUrl,
      };
    })
  );

  return { success: true as const, data: rowsWithSignedUrls };
}

export async function getHostApplication(userId: string) {
  const session = await auth();
  assertAdmin(session);

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      hostStatus: userProfiles.hostStatus,
      hostCity: userProfiles.hostCity,
      hostDistrict: userProfiles.hostDistrict,
      hostRulesAccepted: userProfiles.hostRulesAccepted,
      hostRulesAcceptedAt: userProfiles.hostRulesAcceptedAt,
      kycIdFrontUrl: userProfiles.kycIdFrontUrl,
      kycIdBackUrl: userProfiles.kycIdBackUrl,
      realName: userProfiles.realName,
      phone: userProfiles.phone,
      city: userProfiles.city,
      district: userProfiles.district,
      address: userProfiles.address,
      updatedAt: userProfiles.updatedAt,
    })
    .from(userProfiles)
    .leftJoin(users, eq(userProfiles.userId, users.id))
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (rows.length === 0) {
    return { success: true as const, data: null };
  }

  // Generate signed URLs for KYC images
  const row = rows[0];
  const { frontUrl, backUrl } = await getSignedKycUrls(row.kycIdFrontUrl, row.kycIdBackUrl);

  return {
    success: true as const,
    data: {
      ...row,
      kycIdFrontUrl: frontUrl,
      kycIdBackUrl: backUrl,
    },
  };
}

export async function setHostStatus(userId: string, status: HostStatus) {
  const session = await auth();
  assertAdmin(session);

  if (!(["pending", "approved", "rejected", "none"] as const).includes(status)) {
    return { success: false as const, error: "INVALID_STATUS" };
  }

  await db
    .update(userProfiles)
    .set({
      hostStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId));

  return { success: true as const };
}

