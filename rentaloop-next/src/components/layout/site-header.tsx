"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Home", subLabel: "首頁" },
  { href: "/products", label: "Products", subLabel: "商品總覽" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7f3eb] dark:border-b-border-dark px-4 lg:px-10 py-3 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center text-text-main dark:text-white"
            aria-label="開啟選單"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-3 text-text-main dark:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-3xl">
              recycling
            </span>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              Rentaloop DEMO
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-9">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col leading-tight transition-colors ${isActive(item.href)
                  ? "text-primary"
                  : "text-text-main dark:text-white hover:text-primary"
                  }`}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <span
                  className={`text-[11px] ${isActive(item.href)
                    ? "text-primary/70"
                    : "text-text-sub dark:text-green-300"
                    }`}
                >
                  {item.subLabel}
                </span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-4 md:gap-8">
          <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#e7f3eb] dark:bg-surface-dark focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <div className="text-text-sub dark:text-green-400 flex items-center justify-center pl-4 rounded-l-lg">
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-none bg-transparent text-text-main dark:text-white focus:outline-0 focus:ring-0 placeholder:text-text-sub dark:placeholder:text-green-400 px-4 pl-2 text-sm font-normal"
                placeholder="搜尋裝備..."
                aria-label="搜尋裝備"
              />
            </div>
          </label>
          <div className="flex gap-2">
            <Link
              href="/products"
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-text-main text-sm font-bold"
            >
              <span className="truncate">開始租賃</span>
            </Link>
            {session?.user ? (
              <div className="flex items-center">
                {session.user.role === 'admin' && (
                  <Link href="/admin" className="hidden lg:flex items-center justify-center rounded-lg h-10 px-3 bg-gray-900 hover:bg-black transition-colors text-white text-xs font-bold mr-2 gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    Admin
                  </Link>
                )}
                <Link
                  href="/member"
                  className="ml-2 flex items-center gap-3 rounded-xl h-10 px-4 bg-[#e7f3eb] dark:bg-surface-dark text-text-main dark:text-white font-bold hover:bg-[#d5eadd] dark:hover:bg-surface-dark/80 transition-colors border border-[#cfe7d7] dark:border-surface-dark/60"
                >
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name || "User"} width={32} height={32} className="rounded-full border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {session.user.name?.[0] || "U"}
                    </div>
                  )}
                  <div className="flex flex-col leading-tight text-left">
                    <span className="text-xs text-text-sub dark:text-green-300 font-medium uppercase tracking-wide">會員面板</span>
                    <span className="text-sm font-bold text-text-main dark:text-white">{session.user.name || "Rentaloop 會員"}</span>
                  </div>
                </Link>
              </div>
            ) : (
              <button
                className="gsi-material-button"
                onClick={() => signIn("google")}
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
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                  <span style={{ display: 'none' }}>Sign in with Google</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background-light dark:bg-background-dark animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e7f3eb] dark:border-border-dark">
            <Link href="/" className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">
                recycling
              </span>
              <h2 className="text-lg font-bold text-text-main dark:text-white">
                Rentaloop DEMO
              </h2>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 text-text-main dark:text-white hover:text-primary transition-colors"
              aria-label="關閉選單"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
          <nav className="flex flex-col p-6 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-[#e7f3eb] dark:hover:bg-surface-dark text-text-main dark:text-white transition-all group"
              >
                <span className="flex flex-col leading-tight">
                  <span className="text-lg font-bold">{item.label}</span>
                  <span className="text-sm text-text-sub group-hover:text-primary">
                    {item.subLabel}
                  </span>
                </span>
                <span className="material-symbols-outlined text-text-sub group-hover:text-primary">
                  arrow_forward_ios
                </span>
              </Link>
            ))}

            <div className="h-px bg-[#e7f3eb] dark:bg-border-dark my-2" />

            {session?.user ? (
              <Link
                href="/member"
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#e7f3eb] dark:bg-surface-dark text-text-main dark:text-white font-bold hover:bg-[#d5eadd] dark:hover:bg-surface-dark/80 transition-colors border border-[#cfe7d7]/80 dark:border-surface-dark"
              >
                {session.user.image ? (
                  <Image src={session.user.image} alt={session.user.name || "User"} width={32} height={32} className="rounded-full border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {session.user.name?.[0] || "U"}
                  </div>
                )}
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">會員面板</span>
                  <span className="text-sm font-bold">{session.user.name || "Rentaloop 會員"}</span>
                  <span className="text-xs text-text-sub">歡迎回到 Rentaloop.net</span>
                </div>
                <span className="material-symbols-outlined text-primary ml-auto">arrow_forward</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[#e7f3eb] dark:bg-surface-dark text-text-main dark:text-white font-bold hover:bg-[#d5eadd] dark:hover:bg-surface-dark/80 transition-colors"
              >
                <span className="material-symbols-outlined">login</span>
                登入
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </>
  );
}
