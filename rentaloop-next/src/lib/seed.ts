import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';

// Load .env.local explicitly BEFORE importing db
config({ path: '.env.local' });

// Users Seed (Now using 'users' table structure)
const seedUsers = [
    { id: randomUUID(), email: 'alex@example.com', name: 'Alex Chen', role: 'verified', rating: 4.8, reviewCount: 12, emailVerified: new Date() },
    { id: randomUUID(), email: 'sarah@example.com', name: 'Sarah Lin', role: 'verified', rating: 5.0, reviewCount: 5, emailVerified: new Date() },
    { id: randomUUID(), email: 'mike@example.com', name: 'Mike Wang', role: 'verified', rating: 4.5, reviewCount: 28, emailVerified: new Date() },
];

const seedItemsRaw = [
    {
        title: "Sony Alpha a7 III Mirrorless Camera",
        categorySlug: "3c-camera",
        categoryName: "相機",
        price: 800,
        deposit: 2000,
        location: "台北市大安區",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
        desc: "全片幅無反光鏡相機，適合專業攝影與錄影。機況良好，包含兩顆電池與充電器。"
    },
    {
        title: "The North Face 4-Person Tent",
        categorySlug: "outdoor-camping",
        categoryName: "帳篷",
        price: 450,
        deposit: 1500,
        location: "台北市信義區",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop",
        desc: "北面四人帳篷，防風防水，適合四季露營。容易搭建，含地布與營釘。"
    },
    {
        title: "Switch 主機 + 瑪利歐賽車",
        categorySlug: "party-games",
        categoryName: "遊戲主機 (Switch/PS5)",
        price: 600,
        deposit: 2000,
        location: "台北市內湖區",
        image: "https://images.unsplash.com/photo-1578303512597-814706282492?q=80&w=1000&auto=format&fit=crop",
        desc: "任天堂 Switch 主機，附 Joy-Con 兩組與瑪利歐賽車遊戲片。派對聚會首選！"
    },
    {
        title: "Rimowa 登機箱 20吋",
        categorySlug: "travel",
        categoryName: "行李箱",
        price: 200,
        deposit: 5000,
        location: "新北市板橋區",
        image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=1000&auto=format&fit=crop",
        desc: "Rimowa 經典鋁鎂合金登機箱，輕便耐用，滾輪滑順。適合 3-5 天短途旅行。"
    }
];

async function main() {
    console.log('🌱 Starting seeding process...');

    // Dynamic import
    const { db } = await import('./db');
    const { categories, users, items } = await import('./schema');

    try {
        // 1. Seed Users
        console.log('Creating users...');
        for (const u of seedUsers) {
            // Check if email exists
            const existing = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
            if (existing.length === 0) {
                await db.insert(users).values(u);
            }
        }
        const allUsers = await db.select().from(users);

        // 2. Check Categories
        console.log('Checking categories...');
        // Assuming categories exist from previous seed or manual setup logic (which was done before)

        // 3. Seed Items
        console.log('Creating items...');
        for (const item of seedItemsRaw) {
            // Find Category ID
            const root = await db.select().from(categories).where(eq(categories.slug, item.categorySlug)).limit(1);
            if (root.length === 0) continue;

            const childCats = await db.select().from(categories).where(eq(categories.parentId, root[0].id));
            const targetCat = childCats.find(c => c.name === item.categoryName);

            if (!targetCat) continue;

            // Random Owner
            const owner = allUsers[Math.floor(Math.random() * allUsers.length)];

            // Insert Item
            await db.insert(items).values({
                ownerId: owner.id,
                categoryId: targetCat.id,
                title: item.title,
                description: item.desc,
                pricePerDay: typeof item.price === 'string' ? parseInt((item.price as string).replace('$', '')) : item.price as number,
                deposit: item.deposit,
                pickupLocation: item.location,
                images: [item.image, item.image, item.image],
                status: 'active',
            });
            console.log(`+ Added item: ${item.title}`);
        }

        console.log('✅ Seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

main();
