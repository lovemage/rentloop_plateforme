'use server'

import { db } from "@/lib/db";
import { rentals, items, users, userProfiles, reviews, hostRentalRateLogs } from "@/lib/schema";
import { eq, desc, and, or, inArray, sql, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// 預約狀態類型
export type RentalStatus = 'pending' | 'approved' | 'rejected' | 'ongoing' | 'completed' | 'cancelled' | 'blocked';

const OCCUPIED_RENTAL_STATUSES = ['pending', 'approved', 'ongoing', 'blocked', 'completed'] as const;

type BlockedRange = {
    startDate: string;
    endDate: string;
    type: 'booked' | 'cleaning';
};

function dateToUTC(dateString: string) {
    return new Date(`${dateString}T00:00:00.000Z`);
}

function addDaysUTC(date: Date, days: number) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
}

function toDateStringUTC(date: Date) {
    return date.toISOString().slice(0, 10);
}

function hasOverlap(startA: string, endA: string, startB: string, endB: string) {
    return !(endA < startB || startA > endB);
}

async function getItemBlockedRanges(itemId: string): Promise<BlockedRange[]> {
    const rows = await db
        .select({
            startDate: rentals.startDate,
            endDate: rentals.endDate,
            status: rentals.status,
            cleaningBufferDays: items.cleaningBufferDays,
        })
        .from(rentals)
        .innerJoin(items, eq(rentals.itemId, items.id))
        .where(and(eq(rentals.itemId, itemId), inArray(rentals.status, OCCUPIED_RENTAL_STATUSES)));

    const ranges: BlockedRange[] = [];
    for (const row of rows) {
        if (!row.startDate || !row.endDate) continue;
        ranges.push({ startDate: row.startDate, endDate: row.endDate, type: 'booked' });

        const bufferDays = Number(row.cleaningBufferDays || 0);
        if (bufferDays <= 0 || row.status === 'blocked') continue;

        const cleaningStart = addDaysUTC(dateToUTC(row.endDate), 1);
        const cleaningEnd = addDaysUTC(cleaningStart, bufferDays - 1);
        ranges.push({
            startDate: toDateStringUTC(cleaningStart),
            endDate: toDateStringUTC(cleaningEnd),
            type: 'cleaning',
        });
    }

    return ranges;
}

async function adjustHostRentalRate(hostId: string, delta: number, rentalId: string, eventType: 'host_rejected' | 'rental_completed') {
    const currentHost = await db
        .select({
            rentalRate: users.rentalRate,
        })
        .from(users)
        .where(eq(users.id, hostId))
        .limit(1);

    if (currentHost.length === 0) return;

    const beforeRate = Number(currentHost[0].rentalRate ?? 85);
    const afterRate = Math.max(0, Math.min(100, beforeRate + delta));
    const rentalBadge = afterRate === 100 ? 'elite' : afterRate > 95 ? 'recommended' : 'none';

    await db.update(users).set({
        rentalRate: afterRate,
        rentalBadge,
        rentalRateUpdatedAt: new Date(),
    }).where(eq(users.id, hostId));

    await db.insert(hostRentalRateLogs).values({
        hostId,
        rentalId,
        eventType,
        delta,
        beforeRate,
        afterRate,
    });
}

// 自動取消逾期預約 (3天未回覆)
export async function checkAndCancelOverdueRentals() {
    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const overdueRentals = await db.select({
            id: rentals.id,
            renterId: rentals.renterId,
            itemId: rentals.itemId,
            itemTitle: items.title,
        })
            .from(rentals)
            .leftJoin(items, eq(rentals.itemId, items.id))
            .where(
                and(
                    eq(rentals.status, 'pending'),
                    lt(rentals.createdAt, threeDaysAgo)
                )
            );

        if (overdueRentals.length > 0) {
            const rentalIds = overdueRentals.map(r => r.id);

            // Update status
            await db.update(rentals)
                .set({ status: 'cancelled' })
                .where(inArray(rentals.id, rentalIds));

            // Send emails
            try {
                const { sendEmail } = await import("@/lib/email");

                // Get renter emails
                const renters = await db.select({
                    id: users.id,
                    email: users.email,
                    name: users.name
                }).from(users).where(inArray(users.id, overdueRentals.map(r => r.renterId)));

                const renterMap = new Map(renters.map(r => [r.id, r]));

                await Promise.all(overdueRentals.map(async (rental) => {
                    const renter = renterMap.get(rental.renterId);
                    if (renter?.email) {
                        await sendEmail({
                            to: renter.email,
                            templateKey: "rental_rejected", // Re-use rejected or create specific template
                            data: {
                                name: renter.name || "Member",
                                item: rental.itemTitle || "Item",
                                reason: "超過3日店家未回覆，系統自動取消"
                            }
                        });
                    }
                }));
            } catch (e) {
                console.error("Failed to send auto-cancel emails:", e);
            }
        }

        return { success: true, count: overdueRentals.length };
    } catch (e) {
        console.error("Auto cancel failed:", e);
        return { success: false, error: "Auto cancel failed" };
    }
}

// 建立預約
export async function createRental(data: {
    itemId: string;
    startDate: string; // YYYY-MM-DD format
    endDate: string;
    totalDays: number;
    totalAmount: number;
    message?: string; // 可選的預約留言
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "請先登入" };
        }

        const renterId = session.user.id;

        // Check Profile Completion
        const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, renterId)).limit(1);

        if (profile.length === 0 || !profile[0].phone || !profile[0].address) {
            return {
                success: false,
                error: "PROFILE_INCOMPLETE", // Frontend should handle this specific code
                message: "為了保障雙方權益，請先完善個人資料（電話與地址）再進行預約。"
            };
        }

        // 取得物品資訊以獲取 ownerId
        const item = await db.select({
            ownerId: items.ownerId,
            status: items.status,
            title: items.title,
        }).from(items).where(eq(items.id, data.itemId)).limit(1);

        if (item.length === 0) {
            return { success: false, error: "找不到此商品" };
        }

        if (item[0].status !== 'active') {
            return { success: false, error: "此商品目前無法預約" };
        }

        if (item[0].ownerId === renterId) {
            return { success: false, error: "您不能預約自己的商品" };
        }

        // 檢查日期是否可用（包含清潔保留時段）
        const blockedRanges = await getItemBlockedRanges(data.itemId);
        const hasConflict = blockedRanges.some((range) =>
            hasOverlap(data.startDate, data.endDate, range.startDate, range.endDate)
        );

        if (hasConflict) {
            return { success: false, error: "所選日期包含已預訂或清潔保留時段，請選擇其他日期" };
        }

        // 建立預約
        const newRental = await db.insert(rentals).values({
            itemId: data.itemId,
            renterId: renterId,
            ownerId: item[0].ownerId,
            startDate: data.startDate,
            endDate: data.endDate,
            totalDays: data.totalDays,
            totalAmount: data.totalAmount,
            status: 'pending',
        }).returning();

        // 寄送通知信
        try {
            const { sendEmail } = await import("@/lib/email");

            // Safer fetch using db.select
            const ownerResult = await db.select({
                email: users.email,
                name: users.name
            }).from(users).where(eq(users.id, item[0].ownerId)).limit(1);
            const owner = ownerResult[0];

            // Email to Renter
            if (session.user.email) {
                await sendEmail({
                    to: session.user.email,
                    templateKey: "rental_booking_renter",
                    data: {
                        name: session.user.name || "Member",
                        item: item[0].title,
                        dates: `${data.startDate} ~ ${data.endDate}`,
                        owner: owner?.name || "未知"
                    }
                });
            }

            // Email to Owner
            if (owner?.email) {
                await sendEmail({
                    to: owner.email,
                    templateKey: "rental_booking_owner",
                    data: {
                        name: owner.name || "Member",
                        item: item[0].title,
                        renter: session.user.name || "Guest",
                        dates: `${data.startDate} ~ ${data.endDate}`
                    }
                });
            }
        } catch (mailError) {
            console.error("Failed to send booking emails:", mailError);
            // Don't fail the whole request
        }

        revalidatePath(`/products/${data.itemId}`);
        revalidatePath('/member');
        revalidatePath('/admin/rentals');

        return {
            success: true,
            data: newRental[0],
            message: `成功預約「${item[0].title}」！店家將會審核您的預約。`
        };
    } catch (error) {
        console.error("Failed to create rental:", error);
        return { success: false, error: "預約失敗，請稍後再試" };
    }
}

// 取得所有預約訂單（Admin 用）
export async function getAllRentals() {
    try {
        // 使用別名來區分 renter 和 owner
        const allRentals = await db.select({
            id: rentals.id,
            startDate: rentals.startDate,
            endDate: rentals.endDate,
            totalDays: rentals.totalDays,
            totalAmount: rentals.totalAmount,
            status: rentals.status,
            rejectionReason: rentals.rejectionReason,
            createdAt: rentals.createdAt,
            // Item info
            itemId: rentals.itemId,
            itemTitle: items.title,
            itemImages: items.images,
            itemPricePerDay: items.pricePerDay,
            // Owner info (商家)
            ownerId: rentals.ownerId,
            // Renter info (預約會員)
            renterId: rentals.renterId,
        })
            .from(rentals)
            .leftJoin(items, eq(rentals.itemId, items.id))
            .orderBy(desc(rentals.createdAt));

        // 取得所有相關用戶資訊
        const userIds = [...new Set(allRentals.flatMap(r => [r.ownerId, r.renterId]))];
        const usersData = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
        }).from(users).where(inArray(users.id, userIds));

        const userMap = new Map(usersData.map(u => [u.id, u]));

        // 組合完整資料
        const enrichedRentals = allRentals.map(rental => ({
            ...rental,
            owner: userMap.get(rental.ownerId) || { id: rental.ownerId, name: 'Unknown', email: '', image: null },
            renter: userMap.get(rental.renterId) || { id: rental.renterId, name: 'Unknown', email: '', image: null },
        }));

        return { success: true, data: enrichedRentals };
    } catch (error) {
        console.error("Failed to fetch rentals:", error);
        return { success: false, error: "Failed to fetch rentals" };
    }
}

// 批准預約 (開始出租)
export async function approveRental(rentalId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const rental = await db.select({
            id: rentals.id,
            ownerId: rentals.ownerId,
            status: rentals.status,
        }).from(rentals).where(eq(rentals.id, rentalId)).limit(1);

        if (rental.length === 0) return { success: false, error: "找不到預約資料" };
        if (rental[0].ownerId !== session.user.id) return { success: false, error: "權限不足" };
        if (rental[0].status !== 'pending') return { success: false, error: "目前狀態無法接受預約" };

        await db.update(rentals)
            .set({ status: 'approved' }) // Host approved, waiting for start date to become ongoing? Or directly ongoing? Assuming approved means "Accepted"
            .where(eq(rentals.id, rentalId));

        // TODO: Send email to renter

        revalidatePath('/member');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "操作失敗" };
    }
}

// 拒絕預約
export async function rejectRental(rentalId: string, reason: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const rentalBeforeUpdate = await db.select({
            id: rentals.id,
            ownerId: rentals.ownerId,
            renterId: rentals.renterId,
            itemId: rentals.itemId,
            status: rentals.status,
            itemTitle: items.title,
        })
            .from(rentals)
            .leftJoin(items, eq(rentals.itemId, items.id))
            .where(eq(rentals.id, rentalId))
            .limit(1);

        if (rentalBeforeUpdate.length === 0) return { success: false, error: "找不到預約資料" };
        if (rentalBeforeUpdate[0].ownerId !== session.user.id) return { success: false, error: "權限不足" };
        if (rentalBeforeUpdate[0].status !== 'pending') return { success: false, error: "目前狀態無法拒絕預約" };

        // Update status and reason
        await db.update(rentals)
            .set({ status: 'rejected', rejectionReason: reason })
            .where(eq(rentals.id, rentalId));

        await adjustHostRentalRate(session.user.id, -5, rentalId, 'host_rejected');

        // Get rental details for email
        if (rentalBeforeUpdate.length > 0) {
            const renter = await db.select({ email: users.email, name: users.name })
                .from(users)
                .where(eq(users.id, rentalBeforeUpdate[0].renterId))
                .limit(1);

            if (renter.length > 0 && renter[0].email) {
                const { sendEmail } = await import("@/lib/email");
                await sendEmail({
                    to: renter[0].email,
                    templateKey: "rental_rejected",
                    data: {
                        name: renter[0].name || "Member",
                        item: rentalBeforeUpdate[0].itemTitle || "Item",
                        reason: reason
                    }
                });
            }
        }

        revalidatePath('/member');
        revalidatePath(`/products/${rentalBeforeUpdate[0].itemId}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "操作失敗" };
    }
}

// 完成出租
export async function completeRental(rentalId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const rental = await db.select({
            id: rentals.id,
            ownerId: rentals.ownerId,
            itemId: rentals.itemId,
            status: rentals.status,
        }).from(rentals).where(eq(rentals.id, rentalId)).limit(1);

        if (rental.length === 0) return { success: false, error: "找不到預約資料" };
        if (rental[0].ownerId !== session.user.id) return { success: false, error: "權限不足" };
        if (!['approved', 'ongoing'].includes(rental[0].status || '')) return { success: false, error: "目前狀態無法完成訂單" };

        await db.update(rentals)
            .set({ status: 'completed' })
            .where(eq(rentals.id, rentalId));

        await adjustHostRentalRate(session.user.id, 2, rentalId, 'rental_completed');

        revalidatePath('/member');
        revalidatePath(`/products/${rental[0].itemId}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "操作失敗" };
    }
}

// 更新預約狀態 (Admin 或通用更新)
export async function updateRentalStatus(id: string, status: RentalStatus) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "請先登入" };
        }

        // 取得預約資訊
        const rental = await db.select({
            ownerId: rentals.ownerId,
            status: rentals.status,
        }).from(rentals).where(eq(rentals.id, id)).limit(1);

        if (rental.length === 0) {
            return { success: false, error: "找不到此預約" };
        }

        await db.update(rentals).set({ status }).where(eq(rentals.id, id));

        revalidatePath('/admin/rentals');
        revalidatePath('/member');

        return { success: true };
    } catch (error) {
        console.error("Failed to update rental status:", error);
        return { success: false, error: "更新狀態失敗" };
    }
}

// 取得用戶的預約訂單 (包含 Line ID)
export async function getUserRentals() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "請先登入" };
        }

        // Trigger auto-cancel check
        checkAndCancelOverdueRentals().catch(console.error);

        const userId = session.user.id;

        // 取得作為租客的預約
        const myRentals = await db.select({
            id: rentals.id,
            startDate: rentals.startDate,
            endDate: rentals.endDate,
            totalDays: rentals.totalDays,
            totalAmount: rentals.totalAmount,
            status: rentals.status,
            rejectionReason: rentals.rejectionReason,
            createdAt: rentals.createdAt,
            itemId: rentals.itemId,
            itemTitle: items.title,
            itemImages: items.images,
            ownerId: rentals.ownerId,
        })
            .from(rentals)
            .leftJoin(items, eq(rentals.itemId, items.id))
            .where(eq(rentals.renterId, userId))
            .orderBy(desc(rentals.createdAt));

        // 取得所有 Owner 資訊 (包含 Line ID from profile)
        const ownerIds = [...new Set(myRentals.map(r => r.ownerId))];
        const ownersData = ownerIds.length > 0
            ? await db.select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
                lineId: userProfiles.lineId
            })
                .from(users)
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .where(inArray(users.id, ownerIds))
            : [];

        const ownerMap = new Map(ownersData.map(u => [u.id, u]));

        const enrichedRentals = myRentals.map(rental => ({
            ...rental,
            owner: ownerMap.get(rental.ownerId) || { id: rental.ownerId, name: 'Unknown', email: '', image: null, lineId: null },
        }));

        return { success: true, data: enrichedRentals };
    } catch (error) {
        console.error("Failed to fetch user rentals:", error);
        return { success: false, error: "Failed to fetch rentals" };
    }
}

// 取得商家收到的預約訂單 (包含 Line ID)
export async function getOwnerRentals() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "請先登入" };
        }

        // Trigger auto-cancel check
        checkAndCancelOverdueRentals().catch(console.error);

        const userId = session.user.id;

        const receivedRentals = await db.select({
            id: rentals.id,
            startDate: rentals.startDate,
            endDate: rentals.endDate,
            totalDays: rentals.totalDays,
            totalAmount: rentals.totalAmount,
            status: rentals.status,
            createdAt: rentals.createdAt,
            itemId: rentals.itemId,
            itemTitle: items.title,
            itemImages: items.images,
            renterId: rentals.renterId,
        })
            .from(rentals)
            .leftJoin(items, eq(rentals.itemId, items.id))
            .where(eq(rentals.ownerId, userId))
            .orderBy(desc(rentals.createdAt));

        // 取得所有 Renter 資訊 (包含 Line ID)
        const renterIds = [...new Set(receivedRentals.map(r => r.renterId))];
        const rentersData = renterIds.length > 0
            ? await db.select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
                lineId: userProfiles.lineId
            })
                .from(users)
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .where(inArray(users.id, renterIds))
            : [];

        const renterMap = new Map(rentersData.map(u => [u.id, u]));

        const enrichedRentals = receivedRentals.map(rental => ({
            ...rental,
            renter: renterMap.get(rental.renterId) || { id: rental.renterId, name: 'Unknown', email: '', image: null, lineId: null },
        }));

        return { success: true, data: enrichedRentals };
    } catch (error) {
        console.error("Failed to fetch owner rentals:", error);
        return { success: false, error: "Failed to fetch rentals" };
    }
}

// 提交評價
export async function submitReview(data: {
    rentalId: string;
    rating: number;
    comment?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const rental = await db.select().from(rentals).where(eq(rentals.id, data.rentalId)).limit(1);
        if (rental.length === 0) return { success: false, error: "Rental not found" };
        if (rental[0].status !== 'completed') return { success: false, error: "訂單尚未完成，無法評價" };

        let revieweeId: string | null = null;
        let reviewType: 'renter_to_host' | 'host_to_renter' | null = null;

        if (rental[0].renterId === session.user.id) {
            revieweeId = rental[0].ownerId;
            reviewType = 'renter_to_host';
        } else if (rental[0].ownerId === session.user.id) {
            revieweeId = rental[0].renterId;
            reviewType = 'host_to_renter';
        } else {
            return { success: false, error: "權限不足，無法評價此訂單" };
        }

        // Check if already reviewed
        const existing = await db
            .select()
            .from(reviews)
            .where(and(eq(reviews.rentalId, data.rentalId), eq(reviews.reviewerId, session.user.id)))
            .limit(1);
        if (existing.length > 0) return { success: false, error: "Already reviewed" };

        await db.insert(reviews).values({
            rentalId: data.rentalId,
            reviewerId: session.user.id,
            revieweeId,
            rating: data.rating,
            comment: data.comment || '', // Optional comment
            reviewType,
            isVisible: true,
        });

        const revieweeRatings = await db
            .select({ rating: reviews.rating })
            .from(reviews)
            .where(and(eq(reviews.revieweeId, revieweeId), eq(reviews.isVisible, true)));

        const totalScore = revieweeRatings.reduce((sum, row) => sum + row.rating, 0);
        const averageRating = revieweeRatings.length > 0 ? totalScore / revieweeRatings.length : 0;
        await db.update(users).set({
            rating: averageRating,
            reviewCount: revieweeRatings.length,
        }).where(eq(users.id, revieweeId));

        revalidatePath(`/products/${rental[0].itemId}`);
        revalidatePath('/member');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "評價失敗" };
    }
}

// 取得商品的評價
export async function getItemReviews(itemId: string) {
    try {
        // reviews -> rentals -> itemId
        const itemReviews = await db.select({
            id: reviews.id,
            rating: reviews.rating,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
            reviewerName: users.name,
            reviewerImage: users.image,
        })
            .from(reviews)
            .innerJoin(rentals, eq(reviews.rentalId, rentals.id))
            .innerJoin(users, eq(reviews.reviewerId, users.id))
            .where(
                and(
                    eq(rentals.itemId, itemId),
                    or(eq(reviews.reviewType, 'renter_to_host'), sql`${reviews.reviewType} is null`),
                    eq(reviews.isVisible, true)
                )
            )
            .orderBy(desc(reviews.createdAt));

        return { success: true, data: itemReviews };
    } catch (e) {
        console.error(e);
        return { success: false, data: [] };
    }
}

// 商家封鎖日期 (不接受預約)
export async function blockDates(data: {
    itemId: string;
    startDate: string;
    endDate: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "請先登入" };
        }

        const userId = session.user.id;

        // 取得物品資訊並確認擁有者
        const item = await db.select({
            ownerId: items.ownerId,
            title: items.title,
        }).from(items).where(eq(items.id, data.itemId)).limit(1);

        if (item.length === 0) return { success: false, error: "找不到此商品" };
        if (item[0].ownerId !== userId) return { success: false, error: "您無權操作此商品" };

        const blockedRanges = await getItemBlockedRanges(data.itemId);
        const hasConflict = blockedRanges.some((range) =>
            hasOverlap(data.startDate, data.endDate, range.startDate, range.endDate)
        );

        if (hasConflict) {
            return { success: false, error: "所選日期區間已經有預約、清潔保留或已被封鎖" };
        }

        // 建立封鎖紀錄 (Pseudo-rental)
        // Set totalAmount = 0, renterId = ownerId
        await db.insert(rentals).values({
            itemId: data.itemId,
            renterId: userId,
            ownerId: userId,
            startDate: data.startDate,
            endDate: data.endDate,
            totalDays: 0,
            totalAmount: 0,
            status: 'blocked',
        });

        revalidatePath(`/products/${data.itemId}`);
        return { success: true, message: "已保留指定日期 (不開放出租)" };

    } catch (error) {
        console.error("Failed to block dates:", error);
        return { success: false, error: "操作失敗" };
    }
}
