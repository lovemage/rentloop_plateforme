
import { HomepageSettingsForm } from "@/components/admin/homepage-settings-form";
import { getHomepageStats, getHomepageFeatures } from "@/app/actions/homepage";

export default async function HomepageSettingsPage() {
    const statsRes = await getHomepageStats();
    const featuresRes = await getHomepageFeatures();

    const stats = statsRes.success ? statsRes.data : [];
    const features = featuresRes.success ? featuresRes.data : [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">首頁設定</h1>
                <p className="text-sm text-gray-500 mt-1">管理首頁的影響力數據與特色區塊內容</p>
            </div>

            <HomepageSettingsForm
                initialStats={stats ?? []}
                initialFeatures={features ?? []}
            />
        </div>
    );
}
