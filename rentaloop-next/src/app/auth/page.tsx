"use client";

import { useMemo, useState } from "react";

type AuthTab = "login" | "register" | "reset";

const tabs: { id: AuthTab; label: string; description: string }[] = [
  { id: "login", label: "登入", description: "使用 Google 或電子郵件登入帳戶" },
  { id: "register", label: "註冊", description: "建立新帳戶以開始出租 / 租借" },
  { id: "reset", label: "忘記密碼", description: "寄送重設密碼連結至電子郵件" },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  const tabCopy = useMemo(() => {
    switch (activeTab) {
      case "login":
        return {
          heading: "歡迎回來",
          subheading: "以最熟悉的方式登入 Rentaloop",
          ctaLabel: "登入帳戶",
        };
      case "register":
        return {
          heading: "加入 Rentaloop",
          subheading: "建立帳戶即可開始上架、出租裝備",
          ctaLabel: "建立帳戶",
        };
      case "reset":
        return {
          heading: "重設密碼",
          subheading: "輸入電子郵件，我們將寄送重設連結",
          ctaLabel: "寄送重設連結",
        };
    }
  }, [activeTab]);

  const handleGoogleAuth = () => {
    console.info(`[AUTH] Google flow triggered, tab=${activeTab}`);
    // TODO: Replace with Supabase Auth (signInWithOAuth({ provider: "google" }))
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    console.info(`[AUTH] Email submit (${activeTab})`, payload);
    // TODO: Wire up Supabase Auth email/password handlers
  };

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-10 lg:py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-lg shadow-primary/10">
          <div className="border-b border-border-light dark:border-border-dark px-6 py-4 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col rounded-xl px-4 py-2 text-left transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary shadow-inner"
                    : "text-text-main dark:text-white hover:bg-background-light dark:hover:bg-background-dark/40"
                }`}
              >
                <span className="text-sm font-bold">{tab.label}</span>
                <span className="text-xs text-text-sub dark:text-green-400">{tab.description}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6 px-6 py-8">
            <header className="space-y-2">
              <p className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Rentaloop</p>
              <h1 className="text-2xl font-black text-text-main dark:text-white">{tabCopy.heading}</h1>
              <p className="text-text-sub text-sm md:text-base">{tabCopy.subheading}</p>
            </header>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-background-dark py-3 text-sm font-bold text-text-main dark:text-white hover:border-primary hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-xl text-[#EA4335]">g_translate</span>
                使用 Google 繼續
              </button>

              <div className="flex items-center gap-4 text-xs text-text-sub">
                <span className="flex-1 border-t border-dashed border-border-light dark:border-border-dark" />
                或使用電子郵件
                <span className="flex-1 border-t border-dashed border-border-light dark:border-border-dark" />
              </div>

              <form className="space-y-4" onSubmit={handleEmailSubmit}>
                {activeTab === "register" && (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-text-main dark:text-white">顯示名稱</span>
                    <input
                      required
                      name="displayName"
                      className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm text-text-main dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/50"
                      placeholder="例如：陳小綠"
                    />
                  </label>
                )}

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-text-main dark:text-white">電子郵件</span>
                  <input
                    required
                    name="email"
                    type="email"
                    className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm text-text-main dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/50"
                    placeholder="you@example.com"
                  />
                </label>

                {activeTab !== "reset" && (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-text-main dark:text-white">密碼</span>
                    <input
                      required
                      name="password"
                      type="password"
                      className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm text-text-main dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/50"
                      placeholder="至少 8 碼，含英數字"
                    />
                  </label>
                )}

                {activeTab === "register" && (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-text-main dark:text-white">確認密碼</span>
                    <input
                      required
                      name="confirmPassword"
                      type="password"
                      className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-sm text-text-main dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/50"
                      placeholder="再次輸入密碼"
                    />
                  </label>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-text-main shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dark"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  {tabCopy.ctaLabel}
                </button>

                {activeTab === "login" && (
                  <div className="flex justify-between text-xs text-text-sub">
                    <label className="inline-flex items-center gap-2">
                      <input
                        name="remember"
                        type="checkbox"
                        className="rounded border-border-light text-primary focus:ring-primary/40"
                      />
                      記住我
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab("reset")}
                      className="font-bold text-primary hover:text-primary-dark"
                    >
                      忘記密碼？
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border-light/60 dark:border-border-light/60 bg-gradient-to-br from-[#f0fff4] via-white to-[#e7f3eb] dark:from-[#f0fff4] dark:via-white dark:to-[#e7f3eb] p-8 lg:p-10">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/70 dark:bg-white/90 p-6 shadow-lg backdrop-blur">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.3em]">永續承諾</p>
              <h2 className="mt-2 text-3xl font-black text-text-main dark:text-white">共享、循環、再利用</h2>
              <p className="mt-3 text-sm text-text-sub leading-relaxed">
                每一次成功的出租，都能減少閒置物品的碳足跡。Rentaloop 幫助你用更少的資源創造更多價值，讓生活更輕盈、地球更美好。
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-white/80 dark:bg-white/70 p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-text-main dark:text-white">下一步可以這樣做</h3>
              <ul className="mt-4 space-y-3 text-sm text-text-main dark:text-white">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <div>
                    <p className="font-semibold">完成身分驗證</p>
                    <p className="text-text-sub text-xs">開放押金保障與平台保險</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">photo_camera</span>
                  <div>
                    <p className="font-semibold">上傳專業照片</p>
                    <p className="text-text-sub text-xs">曝光度提升 3 倍，租借更快速</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">lightbulb</span>
                  <div>
                    <p className="font-semibold">設定智能提醒</p>
                    <p className="text-text-sub text-xs">掌握租借請求與維護提醒</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/80 dark:bg-white/80 p-6 shadow-lg backdrop-blur">
              <p className="text-sm text-text-sub">「我把露營裝備放在 Rentaloop，一個月就回收成本。平台也一直提醒我維護和保養，超貼心！」</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-lg font-bold text-text-main flex items-center justify-center">
                  ZH
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main dark:text-white">鄭小姐・台中</p>
                  <p className="text-xs text-text-sub">戶外露營店主理人</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
