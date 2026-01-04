'use server'

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userProfiles, users } from "@/lib/schema";
import { desc, eq, inArray } from "drizzle-orm";
import type { Session } from "next-auth";

type HostStatus = "pending" | "approved" | "rejected" | "none";

function assertAdmin(session: Session | null) {
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  if (session.user.role !== "admin") throw new Error("FORBIDDEN");
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

  return { success: true as const, data: rows };
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

  return { success: true as const, data: rows[0] ?? null };
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
