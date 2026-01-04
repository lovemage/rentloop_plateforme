"use client";

import { useMemo, useState } from "react";
import { loginWithGoogle } from "@/app/actions/auth";

type AuthTab = "login" | "register";

const tabs: { id: AuthTab; label: string; description: string }[] = [
  { id: "login", label: "登入", description: "使用 Google 登入帳戶" },
  { id: "register", label: "註冊", description: "使用 Google 建立新帳戶" },
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
    }
  }, [activeTab]);

  const handleGoogleAuth = async () => {
    await loginWithGoogle();
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
                className={`flex flex-col rounded-xl px-4 py-2 text-left transition-all ${activeTab === tab.id
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
                className="gsi-material-button w-full"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {activeTab === "login" ? "登入" : "註冊"} Rentaloop.net
                  </span>
                  <span style={{ display: 'none' }}>Continue with Google</span>
                </div>
              </button>
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
