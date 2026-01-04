'use server'

import { db } from "@/lib/db";
import { rentals, items, users } from "@/lib/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getTodayDateString } from "@/lib/date-utils";

// 預約狀態類型
export type RentalStatus = 'pending' | 'approved' | 'rejected' | 'ongoing' | 'completed' | 'cancelled';

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

        // 檢查日期是否可用（沒有衝突的預約）
        const conflictingRentals = await db.select({ id: rentals.id })
            .from(rentals)
            .where(and(
                eq(rentals.itemId, data.itemId),
                inArray(rentals.status, ['pending', 'approved', 'ongoing']),
                // 日期重疊檢查: NOT (end < start OR start > end)
                sql`NOT (${rentals.endDate} < ${data.startDate} OR ${rentals.startDate} > ${data.endDate})`
            ));

        if (conflictingRentals.length > 0) {
            return { success: false, error: "所選日期已被預約，請選擇其他日期" };
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

// 更新預約狀態
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

// 取得用戶的預約訂單
export async function getUserRentals() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "請先登入" };
        }

        const userId = session.user.id;

        // 取得作為租客的預約
        const myRentals = await db.select({
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
            ownerId: rentals.ownerId,
        })
            .from(rentals)
            .leftJoin(items, eq(rentals.itemId, items.id))
            .where(eq(rentals.renterId, userId))
            .orderBy(desc(rentals.createdAt));

        // 取得所有 Owner 資訊
        const ownerIds = [...new Set(myRentals.map(r => r.ownerId))];
        const ownersData = ownerIds.length > 0
            ? await db.select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
            }).from(users).where(inArray(users.id, ownerIds))
            : [];

        const ownerMap = new Map(ownersData.map(u => [u.id, u]));

        const enrichedRentals = myRentals.map(rental => ({
            ...rental,
            owner: ownerMap.get(rental.ownerId) || { id: rental.ownerId, name: 'Unknown', email: '', image: null },
        }));

        return { success: true, data: enrichedRentals };
    } catch (error) {
        console.error("Failed to fetch user rentals:", error);
        return { success: false, error: "Failed to fetch rentals" };
    }
}

// 取得商家收到的預約訂單
export async function getOwnerRentals() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "請先登入" };
        }

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

        // 取得所有 Renter 資訊
        const renterIds = [...new Set(receivedRentals.map(r => r.renterId))];
        const rentersData = renterIds.length > 0
            ? await db.select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
            }).from(users).where(inArray(users.id, renterIds))
            : [];

        const renterMap = new Map(rentersData.map(u => [u.id, u]));

        const enrichedRentals = receivedRentals.map(rental => ({
            ...rental,
            renter: renterMap.get(rental.renterId) || { id: rental.renterId, name: 'Unknown', email: '', image: null },
        }));

        return { success: true, data: enrichedRentals };
    } catch (error) {
        console.error("Failed to fetch owner rentals:", error);
        return { success: false, error: "Failed to fetch rentals" };
    }
}
