'use client'

import { useState } from 'react';
import { updateHomepageStats, updateHomepageFeatures } from '@/app/actions/admin-settings';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Save } from 'lucide-react';

interface Stat {
    title: string;
    value: string;
    delta: string;
    icon: string;
}

interface Feature {
    title: string;
    description: string;
    icon: string;
}

export function HomepageSettingsForm({
    initialStats,
    initialFeatures
}: {
    initialStats: Stat[],
    initialFeatures: Feature[]
}) {
    const [stats, setStats] = useState<Stat[]>(initialStats);
    const [features, setFeatures] = useState<Feature[]>(initialFeatures);
    const [saving, setSaving] = useState(false);

    // Stats Handlers
    const addStat = () => setStats([...stats, { title: '', value: '', delta: '', icon: '' }]);
    const removeStat = (idx: number) => setStats(stats.filter((_, i) => i !== idx));
    const updateStat = (idx: number, field: keyof Stat, value: string) => {
        const newStats = [...stats];
        newStats[idx] = { ...newStats[idx], [field]: value };
        setStats(newStats);
    };

    // Features Handlers
    const addFeature = () => setFeatures([...features, { title: '', description: '', icon: '' }]);
    const removeFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));
    const updateFeature = (idx: number, field: keyof Feature, value: string) => {
        const newFeatures = [...features];
        newFeatures[idx] = { ...newFeatures[idx], [field]: value };
        setFeatures(newFeatures);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const [statsRes, featuresRes] = await Promise.all([
                updateHomepageStats(stats),
                updateHomepageFeatures(features)
            ]);

            if (statsRes.success && featuresRes.success) {
                toast.success('首頁設定已更新');
            } else {
                toast.error('部分更新失敗');
            }
        } catch (e) {
            toast.error('發生錯誤');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">1. 影響力數據 (Impact Stats)</h2>
                    <button onClick={addStat} className="flex items-center gap-1 text-sm text-green-600 font-bold hover:text-green-700">
                        <Plus className="w-4 h-4" /> 新增數據
                    </button>
                </div>
                <div className="space-y-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg relative group">
                            <button
                                onClick={() => removeStat(idx)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex-1 space-y-2">
                                <input
                                    placeholder="標題 (例如：廢棄物減量)"
                                    value={stat.title}
                                    onChange={e => updateStat(idx, 'title', e.target.value)}
                                    className="w-full text-sm rounded-lg border-gray-300"
                                />
                                <input
                                    placeholder="數值 (例如：15,000 kg)"
                                    value={stat.value}
                                    onChange={e => updateStat(idx, 'value', e.target.value)}
                                    className="w-full text-sm rounded-lg border-gray-300 font-bold"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <input
                                    placeholder="變化/描述 (例如：+12% 同比增長)"
                                    value={stat.delta}
                                    onChange={e => updateStat(idx, 'delta', e.target.value)}
                                    className="w-full text-sm rounded-lg border-gray-300"
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        placeholder="Icon Name (Material Symbols)"
                                        value={stat.icon}
                                        onChange={e => updateStat(idx, 'icon', e.target.value)}
                                        className="flex-1 text-sm rounded-lg border-gray-300"
                                    />
                                    <span className="material-symbols-outlined text-gray-500">{stat.icon || 'help'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {stats.length === 0 && <p className="text-center text-gray-500 py-4">目前沒有數據</p>}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">2. 為什麼選擇租賃 (Why Choose Us)</h2>
                    <button onClick={addFeature} className="flex items-center gap-1 text-sm text-green-600 font-bold hover:text-green-700">
                        <Plus className="w-4 h-4" /> 新增特色
                    </button>
                </div>
                <div className="space-y-4">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg relative group">
                            <button
                                onClick={() => removeFeature(idx)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 w-1/3">
                                    <span className="material-symbols-outlined text-gray-500">{feature.icon || 'help'}</span>
                                    <input
                                        placeholder="Icon"
                                        value={feature.icon}
                                        onChange={e => updateFeature(idx, 'icon', e.target.value)}
                                        className="w-full text-sm rounded-lg border-gray-300"
                                    />
                                </div>
                                <input
                                    placeholder="標題"
                                    value={feature.title}
                                    onChange={e => updateFeature(idx, 'title', e.target.value)}
                                    className="flex-1 text-sm rounded-lg border-gray-300 font-bold"
                                />
                            </div>
                            <textarea
                                placeholder="描述"
                                value={feature.description}
                                onChange={e => updateFeature(idx, 'description', e.target.value)}
                                rows={2}
                                className="w-full text-sm rounded-lg border-gray-300"
                            />
                        </div>
                    ))}
                    {features.length === 0 && <p className="text-center text-gray-500 py-4">目前沒有特色項目</p>}
                </div>
            </div>

            <div className="flex justify-end sticky bottom-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 hover:scale-105 transition-all disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? '儲存中...' : '儲存所有設定'}
                </button>
            </div>
        </div>
    );
}
