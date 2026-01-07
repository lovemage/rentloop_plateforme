import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e7f3eb] dark:border-border-dark bg-surface-light dark:bg-surface-dark py-12 px-4 md:px-10">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-text-main dark:text-white">
            <Image src="/rentaloop_logo.png" alt="Rentaloop" width={140} height={32} />
          </div>
          <p className="text-text-sub dark:text-gray-400 text-sm max-w-[300px]">
            我們致力於打造一個共享、永續的未來。透過租賃，讓每個人都能享受高品質生活，同時守護地球。
          </p>
        </div>
        <div className="flex gap-12 flex-wrap">
          <div className="flex flex-col gap-3">
            <h4 className="text-text-main dark:text-white font-bold">平台</h4>
            <a className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="#">
              關於我們
            </a>
            <a className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="#">
              運作流程
            </a>
            <a className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="#">
              定價方案
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-text-main dark:text-white font-bold">支援</h4>
            <Link className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="/qa">
              常見問題
            </Link>
            <Link className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="/contact">
              聯絡我們
            </Link>
            <Link className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="/legal/privacy">
              隱私政策
            </Link>
            <Link className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="/legal/terms">
              服務條款
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-text-main dark:text-white font-bold">社群</h4>
            <a className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="#">
              Instagram
            </a>
            <a className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="#">
              Facebook
            </a>
            <a className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="#">
              Blog
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-[#e7f3eb] dark:border-border-dark text-center md:text-left">
        <p className="text-text-sub dark:text-gray-500 text-xs">© 2026 Rentaloop. All rights reserved.</p>
      </div>
    </footer>
  );
}
