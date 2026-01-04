
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';

// Load .env.local explicitly BEFORE importing db
config({ path: '.env.local' });

const CATEGORY_DATA = [
    {
        name: "影音攝影 (3C)",
        slug: "photography-3c",
        children: ["相機", "鏡頭", "空拍機", "GoPro", "投影機", "麥克風"]
    },
    {
        name: "戶外露營",
        slug: "outdoor-camping",
        children: ["帳篷", "天幕", "露營椅", "睡袋", "登山背包", "行動電源站"]
    },
    {
        name: "居家生活",
        slug: "home-living",
        children: ["高壓清洗機", "除塵蟎機", "蒸氣熨斗"]
    },
    {
        name: "娛樂派對",
        slug: "entertainment-party",
        children: ["Switch/PS5 主機", "派對桌遊", "Switch 遊戲片", "拍立得"]
    },
    {
        name: "旅行用品",
        slug: "travel-gear",
        children: ["行李箱 (RIMOWA等)", "萬用轉接頭", "翻譯機"]
    },
    {
        name: "親子育兒",
        slug: "parenting",
        children: ["輕便推車 (出國用)", "安全座椅", "抓周道具"]
    }
];

const SLUG_MAP: Record<string, string> = {
    "相機": "cameras",
    "鏡頭": "lenses",
    "空拍機": "drones",
    "GoPro": "gopro",
    "投影機": "projectors",
    "麥克風": "microphones",
    "帳篷": "tents",
    "天幕": "tarps",
    "露營椅": "camping-chairs",
    "睡袋": "sleeping-bags",
    "登山背包": "hiking-backpacks",
    "行動電源站": "power-stations",
    "高壓清洗機": "pressure-washers",
    "除塵蟎機": "dust-mite-vacuums",
    "蒸氣熨斗": "steam-irons",
    "Switch/PS5 主機": "consoles",
    "派對桌遊": "board-games",
    "Switch 遊戲片": "switch-games",
    "拍立得": "polaroids",
    "行李箱 (RIMOWA等)": "suitcases",
    "萬用轉接頭": "adapters",
    "翻譯機": "translators",
    "輕便推車 (出國用)": "strollers",
    "安全座椅": "car-seats",
    "抓周道具": "zhua-zhou"
};

async function seedCategories() {
    console.log('🌱 Creating categories...');

    // Dynamic import to ensure env vars are loaded
    const { db } = await import('./db');
    const { categories } = await import('./schema');

    for (const cat of CATEGORY_DATA) {
        let parentId: string;

        // Check existing parent
        const existingParent = await db.select().from(categories).where(eq(categories.slug, cat.slug)).limit(1);

        if (existingParent.length > 0) {
            parentId = existingParent[0].id;
            console.log(`Updated parent: ${cat.name}`);
        } else {
            const [inserted] = await db.insert(categories).values({
                name: cat.name,
                slug: cat.slug,
                level: 1
            }).returning({ id: categories.id });
            parentId = inserted.id;
            console.log(`Created parent: ${cat.name}`);
        }

        // Check/Insert Children
        for (const childName of cat.children) {
            const childSlug = SLUG_MAP[childName];
            if (!childSlug) {
                console.warn(`⚠️ No slug mapping for ${childName}, skipping...`);
                continue;
            }

            const existingChild = await db.select().from(categories).where(eq(categories.slug, childSlug)).limit(1);

            if (existingChild.length === 0) {
                await db.insert(categories).values({
                    name: childName,
                    slug: childSlug,
                    parentId: parentId,
                    level: 2
                });
                console.log(`  > Created child: ${childName}`);
            } else {
                console.log(`  > Child exists: ${childName}`);
            }
        }
    }
    console.log('✅ Categories seeded!');
}

seedCategories().catch(console.error).finally(() => process.exit(0));
