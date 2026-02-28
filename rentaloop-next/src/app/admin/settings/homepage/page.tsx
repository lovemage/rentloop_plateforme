
import { HomepageSettingsForm } from "@/components/admin/homepage-settings-form";
import { getHomepageStats, getHomepageFeatures, getHomepageNotice } from "@/app/actions/homepage";

type Stat = {
    title: string;
    value: string;
    delta: string;
    icon: string;
};

type Feature = {
    title: string;
    description: string;
    icon: string;
};

type Notice = {
    isVisible: boolean;
    date: string;
    title: string;
    content: string;
};

function normalizeStats(data: Array<Record<string, unknown>>): Stat[] {
    return data.map((item) => ({
        title: typeof item.title === "string" ? item.title : "",
        value: typeof item.value === "string" ? item.value : "",
        delta: typeof item.delta === "string" ? item.delta : "",
        icon: typeof item.icon === "string" ? item.icon : "",
    }));
}

function normalizeFeatures(data: Array<Record<string, unknown>>): Feature[] {
    return data.map((item) => ({
        title: typeof item.title === "string" ? item.title : "",
        description: typeof item.description === "string" ? item.description : "",
        icon: typeof item.icon === "string" ? item.icon : "",
    }));
}

function normalizeNotice(data: Record<string, unknown> | null): Notice {
    return {
        isVisible: typeof data?.isVisible === "boolean" ? data.isVisible : false,
        date: typeof data?.date === "string" ? data.date : "",
        title: typeof data?.title === "string" ? data.title : "",
        content: typeof data?.content === "string" ? data.content : "",
    };
}

export default async function HomepageSettingsPage() {
    const statsRes = await getHomepageStats();
    const featuresRes = await getHomepageFeatures();
    const noticeRes = await getHomepageNotice();

    const stats = statsRes.success ? normalizeStats(statsRes.data ?? []) : [];
    const features = featuresRes.success ? normalizeFeatures(featuresRes.data ?? []) : [];
    const notice = normalizeNotice(noticeRes.success ? (noticeRes.data ?? null) : null);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">首頁設定</h1>
                <p className="text-sm text-gray-500 mt-1">管理首頁的影響力數據與特色區塊內容</p>
            </div>

            <HomepageSettingsForm
                initialStats={stats ?? []}
                initialFeatures={features ?? []}
                initialNotice={notice}
            />
        </div>
    );
}
