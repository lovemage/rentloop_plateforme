"use client";

import { useMemo, useState, useTransition } from "react";
import { taiwanCities } from "@/lib/taiwan-cities";
import { upsertMyProfile } from "@/app/actions/member-profile";
import { ChevronDown, ChevronUp } from "lucide-react";

type ProfileShape = {
  userId: string;
  realName: string | null;
  lineId: string | null;
  phone: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  hostStatus: string | null;
  hostCity: string | null;
  hostDistrict: string | null;
  kycIdFrontUrl: string | null;
  kycIdBackUrl: string | null;
  hostRulesAccepted: boolean | null;
  hostRulesAcceptedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export function MemberProfileForm({
  email,
  initialProfile,
}: {
  email: string | null | undefined;
  initialProfile: ProfileShape | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Auto-open if critical info is missing
  const isProfileIncomplete = !initialProfile?.phone || !initialProfile?.address;
  const [isOpen, setIsOpen] = useState(isProfileIncomplete);

  const initialState = useMemo(
    () => ({
      realName: initialProfile?.realName ?? "",
      lineId: initialProfile?.lineId ?? "",
      phone: initialProfile?.phone ?? "",
      city: initialProfile?.city ?? "",
      district: initialProfile?.district ?? "",
      address: initialProfile?.address ?? "",
    }),
    [initialProfile]
  );

  const [form, setForm] = useState(initialState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAt(null);

    startTransition(async () => {
      const res = await upsertMyProfile(form);
      if (res.success) {
        setSavedAt(new Date().toLocaleString());
        // Auto close on success with small delay
        setTimeout(() => setIsOpen(false), 1500);
      }
    });
  };

  return (
    <section className="rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-border-light dark:ring-border-dark overflow-hidden">
      <div
        className="p-6 flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            個人資料
            {!isProfileIncomplete && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">已完善</span>}
            {isProfileIncomplete && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">未完成</span>}
          </h2>
          <p className="mt-1 text-sm text-text-sub">請填寫真實資料以利租賃流程與身份認證。</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt ? (
            <div className="text-xs font-bold text-primary">已儲存於 {savedAt}</div>
          ) : null}
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 animate-fade-in border-t border-gray-100 dark:border-gray-800 pt-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">真實姓名</span>
              <input
                value={form.realName}
                onChange={(e) => setForm((p) => ({ ...p, realName: e.target.value }))}
                className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm"
                placeholder="請輸入真實姓名"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">LINE ID</span>
              <input
                value={form.lineId}
                onChange={(e) => setForm((p) => ({ ...p, lineId: e.target.value }))}
                className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm"
                placeholder="例如: rentaloop123"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Email</span>
              <input
                value={email ?? ""}
                disabled
                className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light/60 dark:bg-background-dark/60 px-4 text-sm opacity-80"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">電話 <span className="text-red-500">*</span></span>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm"
                placeholder="例如: 0912xxxxxx"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">所在地縣市 <span className="text-red-500">*</span></span>
              <div className="relative">
                <select
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  className="h-12 w-full appearance-none rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 pr-10 text-sm"
                  required
                >
                  <option value="" disabled>
                    請選擇縣市
                  </option>
                  {taiwanCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none">
                  expand_more
                </span>
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">所在地區域</span>
              <input
                value={form.district}
                onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm"
                placeholder="例如: 大安區"
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-semibold">地址 <span className="text-red-500">*</span></span>
              <input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm"
                placeholder="例如: 台北市大安區xx路xx號"
                required
              />
            </label>

            <div className="md:col-span-2 pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-text-main hover:bg-primary-dark disabled:opacity-50"
              >
                {isPending ? '儲存中...' : '儲存個人資料'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
