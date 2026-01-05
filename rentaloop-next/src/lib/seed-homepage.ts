
import { db } from "./db";
import { articles, siteSettings } from "./schema";
import { eq } from "drizzle-orm";

const DEFAULT_STATS = [
    {
        title: "廢棄物減量",
        value: "15,000 kg",
        delta: "+12% 同比增長",
        icon: "delete_outline",
    },
    {
        title: "物品流通次數",
        value: "50,000+",
        delta: "+25% 活躍度",
        icon: "sync_alt",
    },
    {
        title: "碳排放減少",
        value: "8,500 kg",
        delta: "+10% 貢獻值",
        icon: "co2",
    },
];

const DEFAULT_FEATURES = [
    {
        icon: "home",
        title: "釋放居家空間",
        description: "只在需要時使用物品，讓家裡不再堆滿一年只用一次的裝備。享受極簡生活。",
    },
    {
        icon: "eco",
        title: "永續環保選擇",
        description: "每次租賃都能減少製造新產品的碳排放與資源消耗，直接為地球減負。",
    },
    {
        icon: "payments",
        title: "經濟實惠聰明",
        description: "以零售價的一小部分體驗頂級產品，把省下的錢花在更美好的體驗上。",
    },
];

const DEFAULT_SDGS = [
    {
        slug: "goal-12-consumption",
        title: "目標 12：負責任的消費與生產",
        excerpt: "透過延長產品生命週期與共享模式，確保永續的消費模式，減少過度生產。",
        content: "<p>透過延長產品生命週期與共享模式，確保永續的消費模式，減少過度生產。我們致力於減少一次性使用，鼓勵循環利用。</p>",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkoJVaNkuUJpqSqpsjfefIJfPKNnBcvGY-1tSPH0cpO1VtdBxx4I9ezwD1siRvGpPyNKufpdGwlLoCtgTUMZLb4_o96brXoCWYYMlBumm8ohN9r33RfEdnC76aJysIEHq4OjhVx9ff6bdvpSn3Vy4UzVKGPe5BQkUkDMIuVo4SM2s5sBDuLG5VRGO4LusFO6g2EXxZxMqbFjz_G9OqCnZ48tbUDTC61krnwNKiiGyYEYADIuKo9qW28OyGOlpRe6QRHrqRH3o6",
        seoSchema: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "目標 12：負責任的消費與生產",
            "description": "透過延長產品生命週期與共享模式，確保永續的消費模式，減少過度生產。",
            "image": [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDkoJVaNkuUJpqSqpsjfefIJfPKNnBcvGY-1tSPH0cpO1VtdBxx4I9ezwD1siRvGpPyNKufpdGwlLoCtgTUMZLb4_o96brXoCWYYMlBumm8ohN9r33RfEdnC76aJysIEHq4OjhVx9ff6bdvpSn3Vy4UzVKGPe5BQkUkDMIuVo4SM2s5sBDuLG5VRGO4LusFO6g2EXxZxMqbFjz_G9OqCnZ48tbUDTC61krnwNKiiGyYEYADIuKo9qW28OyGOlpRe6QRHrqRH3o6"
            ],
            "author": {
                "@type": "Organization",
                "name": "Rentaloop"
            }
        }
    },
    {
        slug: "goal-13-climate-action",
        title: "目標 13：氣候行動",
        excerpt: "採取緊急行動應對氣候變遷，透過資源效率化減少碳足跡。",
        content: "<p>採取緊急行動應對氣候變遷，透過資源效率化減少碳足跡。每一次的租賃都是對地球的一次減負行動。</p>",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2zRYJ8leExYoogwCA29kg1mOOoeTKI4qoN0toTA4FCysnUumVC0G5VozCWKuXsZ_E-04wZJXY3kmy0oWzHhdvsNcRdn2-SMZyk7hXMF0nnrhXlp4zLOL1SneH7-lYN7i_jaQl0wZRPx0DJwcR5ZA6qdwx5PTgYRiDL5EF3M0tjiEcTSFHIqFaoNeu_V1F8mw7S4Bx8v1myFZXpX0xZk_2-YhxdXPDIDiAsPARi2_Qv8o4mRF1D24g6xLsTEQlKwpONs9NQdrm",
        seoSchema: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "目標 13：氣候行動",
            "description": "採取緊急行動應對氣候變遷，透過資源效率化減少碳足跡。",
            "image": [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuD2zRYJ8leExYoogwCA29kg1mOOoeTKI4qoN0toTA4FCysnUumVC0G5VozCWKuXsZ_E-04wZJXY3kmy0oWzHhdvsNcRdn2-SMZyk7hXMF0nnrhXlp4zLOL1SneH7-lYN7i_jaQl0wZRPx0DJwcR5ZA6qdwx5PTgYRiDL5EF3M0tjiEcTSFHIqFaoNeu_V1F8mw7S4Bx8v1myFZXpX0xZk_2-YhxdXPDIDiAsPARi2_Qv8o4mRF1D24g6xLsTEQlKwpONs9NQdrm"
            ],
            "author": {
                "@type": "Organization",
                "name": "Rentaloop"
            }
        }
    },
    {
        slug: "goal-11-sustainable-cities",
        title: "目標 11：永續城市",
        excerpt: "減少城市廢棄物，讓我們的社區更加包容、安全、有韌性且永續。",
        content: "<p>減少城市廢棄物，讓我們的社區更加包容、安全、有韌性且永續。共享經濟是建設智慧城市的重要一環。</p>",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBvDmMunigSJTmTJ2EhqqA1FAowiMsFqsTjT-xOR86qkJc81rjeeaXxPN7X5EvASiFkqOsXnje1R_a161XiG3ng24-VtX1PpoMY8lVHUmM_umj0ChCdDgzembXlR7M5bV_DRj4UOf3ZDPPDkkpOFlAEavFFKDxXlwe-l-MCZUYunTPhPO2HRWlYHigs_w2EccdPOuSHLDyDG-AUEBBBiRAwZtuESKk61zXa1hRRLP9hN3NfCdIDnQHfINHdC0iVcas_6HTP8Gx",
        seoSchema: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "目標 11：永續城市",
            "description": "減少城市廢棄物，讓我們的社區更加包容、安全、有韌性且永續。",
            "image": [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBBvDmMunigSJTmTJ2EhqqA1FAowiMsFqsTjT-xOR86qkJc81rjeeaXxPN7X5EvASiFkqOsXnje1R_a161XiG3ng24-VtX1PpoMY8lVHUmM_umj0ChCdDgzembXlR7M5bV_DRj4UOf3ZDPPDkkpOFlAEavFFKDxXlwe-l-MCZUYunTPhPO2HRWlYHigs_w2EccdPOuSHLDyDG-AUEBBBiRAwZtuESKk61zXa1hRRLP9hN3NfCdIDnQHfINHdC0iVcas_6HTP8Gx"
            ],
            "author": {
                "@type": "Organization",
                "name": "Rentaloop"
            }
        }
    },
];

export async function seedHomepage() {
    console.log("Seeding Homepage Data...");

    // 1. Seed Stats
    const existingStats = await db.select().from(siteSettings).where(eq(siteSettings.key, 'home_stats'));
    if (existingStats.length === 0) {
        await db.insert(siteSettings).values({
            key: 'home_stats',
            title: 'Impact Stats',
            value: DEFAULT_STATS,
        });
        console.log("Seeded Home Stats");
    }

    // 2. Seed Features
    const existingFeatures = await db.select().from(siteSettings).where(eq(siteSettings.key, 'home_features'));
    if (existingFeatures.length === 0) {
        await db.insert(siteSettings).values({
            key: 'home_features',
            title: 'Why Choose Rental',
            value: DEFAULT_FEATURES,
        });
        console.log("Seeded Home Features");
    }

    // 3. Seed Articles
    for (const article of DEFAULT_SDGS) {
        const existing = await db.select().from(articles).where(eq(articles.slug, article.slug));
        if (existing.length === 0) {
            await db.insert(articles).values({
                slug: article.slug,
                title: article.title,
                excerpt: article.excerpt,
                content: article.content,
                image: article.image,
                seoSchema: article.seoSchema,
                author: "Rentaloop Team",
            });
            console.log(`Seeded Article: ${article.title}`);
        }
    }
}

// Execute if run directly
if (require.main === module) {
    seedHomepage().then(() => {
        console.log("Done");
        process.exit(0);
    }).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
