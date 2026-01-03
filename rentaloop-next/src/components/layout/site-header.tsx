"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home", subLabel: "首頁" },
  { href: "/products", label: "Products", subLabel: "商品總覽" },
  { href: "/contact", label: "Contact", subLabel: "聯絡我們" },
  { href: "/member", label: "Member", subLabel: "會員中心" },
  { href: "/upload", label: "Upload", subLabel: "上架物品" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
                className={`flex flex-col leading-tight transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-text-main dark:text-white hover:text-primary"
                }`}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <span
                  className={`text-[11px] ${
                    isActive(item.href)
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
            <button
              type="button"
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-text-main text-sm font-bold"
            >
              <span className="truncate">開始租賃</span>
            </button>
            <Link
              href="/auth"
              className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7f3eb] dark:bg-surface-dark hover:bg-[#d5eadd] dark:hover:bg-surface-dark/80 transition-colors text-text-main dark:text-white text-sm font-bold"
            >
              <span className="truncate">登入</span>
            </Link>
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

            <Link
              href="/auth"
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[#e7f3eb] dark:bg-surface-dark text-text-main dark:text-white font-bold hover:bg-[#d5eadd] dark:hover:bg-surface-dark/80 transition-colors"
            >
              <span className="material-symbols-outlined">login</span>
              登入
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
