import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e7f3eb] dark:border-border-dark bg-surface-light dark:bg-surface-dark py-12 px-4 md:px-10">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-text-main dark:text-white">
            <Image src="/rentloop-logo2.png" alt="Rentaloop" width={140} height={32} />
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
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-text-main dark:text-white font-bold">支援</h4>
            <Link className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="/qa">
              常見問題
            </Link>
            <Link className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="/contact">
              聯絡我們
            </Link>
            <Link className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors" href="/delivery-rules">
              交付規則說明
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
            <a
              className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors flex items-center gap-1.5"
              href="https://www.instagram.com/rentaloop.net.ig?igsh=emFhdWJ1MjhkOHR6&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              Instagram
            </a>
            <a
              className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors flex items-center gap-1.5"
              href="https://www.facebook.com/share/1BwySRnA5i/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </a>
            <a
              className="text-text-sub dark:text-gray-400 text-sm hover:text-primary transition-colors flex items-center gap-1.5"
              href="https://www.threads.com/@rentaloop.net.ig?igshid=NTc4MTIwNjQ2YQ%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.34-.779-.964-1.405-1.803-1.817a13.7 13.7 0 01-.235 2.49c-.36 1.7-1.048 2.994-2.047 3.843-1.108.94-2.533 1.42-4.235 1.42h-.004c-1.43-.007-2.648-.424-3.623-1.237-1.03-.858-1.574-2.012-1.574-3.338 0-1.276.534-2.39 1.503-3.133.878-.675 2.043-1.048 3.375-1.08 1.065-.024 2.043.108 2.919.393-.028-.793-.171-1.442-.433-1.935-.349-.659-.958-1.004-1.81-1.025h-.065c-.663 0-1.593.18-2.278.858l-1.382-1.514C8.69 6.468 10.026 5.826 11.5 5.81h.097c1.579.03 2.768.66 3.436 1.824.582 1.014.87 2.352.857 3.975v.06c.003.125.003.25 0 .375 1.16.508 2.078 1.32 2.66 2.37.832 1.497.94 4.074-1.088 6.101C15.65 22.268 13.47 22.98 12.186 24zm-.09-8.73c-.839.02-1.505.207-1.928.544-.383.304-.572.7-.572 1.21 0 .621.237 1.093.703 1.404.52.347 1.178.521 1.958.526 1.13-.007 2.003-.32 2.665-.957.542-.522.914-1.35 1.161-2.465a11.6 11.6 0 00-3.987-.262z" /></svg>
              Threads
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
