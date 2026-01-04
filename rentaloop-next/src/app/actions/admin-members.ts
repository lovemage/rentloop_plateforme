'use server'

import { db } from "@/lib/db";
import { users, userProfiles } from "@/lib/schema";
import { count, eq, or, ilike, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getAdminMembers(
    page: number = 1,
    limit: number = 10,
    search: string = ""
) {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const offset = (page - 1) * limit;

    const whereClause = search
        ? or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`)
        )
        : undefined;

    // Fetch users with profiles
    const data = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            isBlocked: users.isBlocked,
            adminNotes: users.adminNotes,
            createdAt: users.createdAt,
            // Profile Data
            kycStatus: userProfiles.hostStatus,
            kycFront: userProfiles.kycIdFrontUrl,
            kycBack: userProfiles.kycIdBackUrl,
            realName: userProfiles.realName,
            phone: userProfiles.phone,
            hostCity: userProfiles.hostCity,
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt));

    // Get total count
    const [totalResult] = await db
        .select({ count: count() })
        .from(users)
        .where(whereClause);

    return {
        data,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit)
    };
}

export async function toggleBlockMember(userId: string, isBlocked: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    await db.update(users).set({ isBlocked }).where(eq(users.id, userId));
    revalidatePath("/admin/members");
    return { success: true };
}

export async function updateAdminNote(userId: string, note: string) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    await db.update(users).set({ adminNotes: note }).where(eq(users.id, userId));
    revalidatePath("/admin/members");
    return { success: true };
}

export async function deleteMember(userId: string) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    // Cascading delete should handle related tables if configured in DB, 
    // but Drizzle schema 'onDelete: cascade' is just DDL instruction.
    // Ensure DB has foreign keys set up with cascade.
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/members");
    return { success: true };
}

export async function updateKycStatus(userId: string, status: 'approved' | 'rejected' | 'pending') {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    await db.update(userProfiles).set({ hostStatus: status }).where(eq(userProfiles.userId, userId));

    // If approved, verify the user role too if needed, or just keep 'basic' user with 'approved' host status. 
    // The previous logic implies 'verified' role is for basic KYC, but 'hostStatus' is for Host.

    revalidatePath("/admin/members");
    return { success: true };
}
