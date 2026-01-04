"use client";

import { useMemo, useState, useTransition } from "react";
import { taiwanCities } from "@/lib/taiwan-cities";
import { upsertMyProfile } from "@/app/actions/member-profile";

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
      }
    });
  };

  return (
    <section className="rounded-2xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm ring-1 ring-border-light dark:ring-border-dark">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">個人資料</h2>
          <p className="mt-1 text-sm text-text-sub">請填寫真實資料以利租賃流程與身份認證。</p>
        </div>
        {savedAt ? (
          <div className="text-xs font-bold text-primary">已儲存於 {savedAt}</div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <span className="text-sm font-semibold">電話</span>
          <input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm"
            placeholder="例如: 0912xxxxxx"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">所在地縣市</span>
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
          <span className="text-sm font-semibold">地址</span>
          <input
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm"
            placeholder="例如: 台北市大安區xx路xx號"
          />
        </label>

        <div className="md:col-span-2 pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-text-main hover:bg-primary-dark disabled:opacity-50"
          >
            儲存個人資料
          </button>
        </div>
      </form>
    </section>
  );
}
