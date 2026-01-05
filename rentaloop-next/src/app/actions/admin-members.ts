'use server'

import { db } from "@/lib/db";
import { users, userProfiles } from "@/lib/schema";
import { count, eq, or, ilike, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getSignedKycUrl } from "@/lib/supabase-s3";

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
    const rawData = await db
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
            kycFrontKey: userProfiles.kycIdFrontUrl, // This is now an S3 key
            kycBackKey: userProfiles.kycIdBackUrl,   // This is now an S3 key
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

    // Generate signed URLs for KYC images
    const data = await Promise.all(rawData.map(async (member) => {
        let kycFront: string | null = null;
        let kycBack: string | null = null;

        // Handle kycFrontKey with individual error handling
        if (member.kycFrontKey) {
            if (member.kycFrontKey.startsWith('kyc/')) {
                try {
                    kycFront = await getSignedKycUrl(member.kycFrontKey);
                } catch (e) {
                    console.warn(`Failed to sign front KYC URL for user ${member.id}:`, e);
                    kycFront = null; // Fallback to null instead of crashing
                }
            } else {
                // Legacy URL (Cloudinary or old format)
                kycFront = member.kycFrontKey;
            }
        }

        // Handle kycBackKey with individual error handling
        if (member.kycBackKey) {
            if (member.kycBackKey.startsWith('kyc/')) {
                try {
                    kycBack = await getSignedKycUrl(member.kycBackKey);
                } catch (e) {
                    console.warn(`Failed to sign back KYC URL for user ${member.id}:`, e);
                    kycBack = null; // Fallback to null instead of crashing
                }
            } else {
                kycBack = member.kycBackKey;
            }
        }

        return {
            ...member,
            kycFront,
            kycBack,
        };
    }));

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

import { sendEmail } from "@/lib/email";

export async function updateKycStatus(userId: string, status: 'approved' | 'rejected' | 'pending') {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    await db.update(userProfiles).set({ hostStatus: status }).where(eq(userProfiles.userId, userId));

    // Send Email
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { email: true, name: true }
    });

    if (user && user.email) {
        if (status === 'approved') {
            await sendEmail({
                to: user.email,
                templateKey: "kyc_approved",
                data: { name: user.name || "Member" }
            });

            // Also update role to verified/custom if needed? 
            // The request didn't specify changing 'role' column, but typically 'approved' host means they are verification passed.
        } else if (status === 'rejected') {
            await sendEmail({
                to: user.email,
                templateKey: "kyc_rejected",
                data: { name: user.name || "Member" }
            });
        }
    }

    revalidatePath("/admin/members");
    return { success: true };
}
