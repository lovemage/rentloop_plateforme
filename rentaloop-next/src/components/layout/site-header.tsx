"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", subLabel: "首頁" },
  { href: "/products", label: "Products", subLabel: "商品總覽" },
];

interface Category {
  id: string;
  name: string;
  slug: string | null;
  parentId: string | null;
  level: number | null;
  itemCount?: number;
}

export function SiteHeader() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => pathname === href;

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Fetch categories
  useEffect(() => {
    import("@/app/actions/categories").then(({ getCategories }) => {
      getCategories().then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      });
    });
  }, []);

  const roots = categories.filter(c => !c.parentId);
  const getChildren = (pid: string) => categories.filter(c => c.parentId === pid);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7f3eb] dark:border-b-border-dark px-4 lg:px-10 py-3 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md">
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-text-main dark:text-white cursor-pointer"
          >
            <Image
              src="/rentlooplogo.png"
              alt="Rentaloop"
              width={0}
              height={0}
              sizes="100vw"
              className="w-auto h-8"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-9">
            <Link
              href="/"
              className={`flex flex-col leading-tight transition-colors ${isActive("/") ? "text-primary" : "text-text-main dark:text-white hover:text-primary"}`}
            >
              <span className="text-sm font-semibold">Home</span>
              <span className={`text-[11px] ${isActive("/") ? "text-primary/70" : "text-text-sub dark:text-green-300"}`}>首頁</span>
            </Link>

            {/* Dynamic Categories Dropdown */}
            <div
              className="relative group h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/products"
                className={`flex flex-col leading-tight transition-colors ${isActive("/products") ? "text-primary" : "text-text-main dark:text-white group-hover:text-primary"}`}
              >
                <span className="text-sm font-semibold flex items-center gap-1">
                  Products
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </span>
                <span className={`text-[11px] ${isActive("/products") ? "text-primary/70" : "text-text-sub dark:text-green-300"}`}>商品總覽</span>
              </Link>

              {/* Dropdown Content */}
              <div className={`absolute top-full left-0 mt-2 w-[500px] bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 grid grid-cols-2 gap-6 transition-all duration-200 origin-top-left ${activeDropdown === 'products' ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                <Link href="/products" className="col-span-2 text-primary hover:underline text-sm font-bold flex items-center gap-1 mb-2">
                  查看所有商品 <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                {roots.map(root => (
                  <div key={root.id}>
                    <Link href={`/products?category=${root.slug || root.id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary mb-2 block">
                      {root.name}
                    </Link>
                    <div className="flex flex-col gap-1.5 ml-0">
                      {getChildren(root.id).map(child => (
                        <Link key={child.id} href={`/products?category=${child.slug || child.id}`} className="text-sm text-gray-500 hover:text-primary dark:text-gray-400">
                          {child.name}
                          <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({child.itemCount ?? 0})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="hidden md:flex gap-2">
            <Link
              href="/products"
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-text-main text-sm font-bold"
            >
              <span className="truncate">開始租賃</span>
            </Link>
            <Link
              href="/contact"
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7f3eb] dark:bg-surface-dark hover:bg-[#d5eadd] dark:hover:bg-surface-dark/80 transition-colors text-text-main dark:text-white text-sm font-bold border border-[#cfe7d7] dark:border-surface-dark/60"
            >
              <span className="truncate">聯絡我們</span>
            </Link>
            {session?.user ? (
              <div className="flex items-center">
                {session.user.role === 'admin' && (
                  <Link href="/admin" className="hidden lg:flex items-center justify-center rounded-lg h-10 px-3 bg-gray-900 hover:bg-black transition-colors text-white text-xs font-bold mr-2 gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => setMemberModalOpen(true)}
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
                </button>
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
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.09c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
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
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center text-text-main dark:text-white"
            aria-label="開啟選單"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </header>

      <div className={`fixed inset-0 z-[100] flex bg-black/60 backdrop-blur-sm transition-all duration-300 ease-in-out ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setMobileOpen(false)}>
        <div className={`w-[85%] max-w-sm h-full bg-surface-light dark:bg-surface-dark shadow-2xl flex flex-col overflow-y-auto transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e7f3eb] dark:border-border-dark sticky top-0 bg-inherit z-10">
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
              <Image
                src="/rentlooplogo.png"
                alt="Rentaloop"
                width={0}
                height={0}
                sizes="100vw"
                className="w-auto h-8"
                priority
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 -mr-2 text-text-main dark:text-white hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="關閉選單"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* User Profile Section (Top) */}
          <div className="px-6 py-6 border-b border-[#e7f3eb] dark:border-border-dark bg-gray-50/50 dark:bg-surface-dark/50">
            {session?.user ? (
              <Link href="/member" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 group">
                {session.user.image ? (
                  <Image src={session.user.image} alt={session.user.name || "User"} width={48} height={48} className="rounded-full border-2 border-white dark:border-gray-700 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-white dark:border-gray-700 shadow-sm">
                    {session.user.name?.[0] || "U"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{session.user.name || "Rentaloop 會員"}</span>
                  <span className="text-xs text-text-sub flex items-center gap-1 mt-0.5">查看會員面板 <span className="material-symbols-outlined text-[14px]">chevron_right</span></span>
                </div>
              </Link>
            ) : (
              <Link href="/auth" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-text-main dark:text-white hover:text-primary transition-colors font-bold group">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="flex flex-col">
                  <span>登入 / 註冊</span>
                  <span className="text-xs text-text-sub font-normal mt-0.5">管理您的租賃與裝備</span>
                </div>
              </Link>
            )}
          </div>

          <nav className="flex flex-col flex-1 px-4 py-4 gap-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${isActive("/") ? "bg-primary/10 text-primary font-bold" : "text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"}`}>
              <span className="material-symbols-outlined text-[22px]">home</span>
              <span>首頁</span>
            </Link>
            
            {/* Products Accordion */}
            <div className="flex flex-col">
              <button onClick={() => toggleCategory('mobile-products')} className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors w-full ${isActive("/products") || expandedCategories.has('mobile-products') ? "text-primary font-bold" : "text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"}`}>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                  <span>商品總覽</span>
                </div>
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${expandedCategories.has('mobile-products') ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.has('mobile-products') ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pl-12 pr-4 py-2 flex flex-col gap-1">
                  <Link href="/products" onClick={() => setMobileOpen(false)} className={`block py-2.5 text-sm transition-colors ${isActive("/products") && !pathname.includes('category') ? "text-primary font-bold" : "text-text-sub dark:text-gray-400 hover:text-primary"}`}>
                    全部商品
                  </Link>
                  {roots.map(root => (
                    <div key={root.id} className="flex flex-col">
                      <Link href={`/products?category=${root.slug || root.id}`} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-text-sub dark:text-gray-300 font-bold hover:text-primary transition-colors">
                        {root.name}
                      </Link>
                      <div className="pl-3 border-l-2 border-gray-100 dark:border-gray-800 ml-1 flex flex-col gap-1 my-1">
                        {getChildren(root.id).map(child => (
                          <Link key={child.id} href={`/products?category=${child.slug || child.id}`} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                            {child.name}
                            <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({child.itemCount ?? 0})</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Other Main Links */}
            <Link href="/contact" onClick={() => setMobileOpen(false)} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${isActive("/contact") ? "bg-primary/10 text-primary font-bold" : "text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"}`}>
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
              <span>聯絡我們</span>
            </Link>

            {session?.user?.role === 'admin' && (
              <>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-4" />
                <Link href="/admin" onClick={() => setMobileOpen(false)} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${isActive("/admin") ? "bg-primary/10 text-primary font-bold" : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"}`}>
                  <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
                  <span>管理後台</span>
                </Link>
              </>
            )}

          </nav>
          
          <div className="px-6 py-6 mt-auto border-t border-gray-100 dark:border-gray-800">
            <Link href="/products" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full gap-2 bg-primary hover:bg-primary-dark text-text-main font-bold py-3.5 rounded-xl transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              開始租賃
            </Link>
          </div>
        </div>
      </div>

      {/* Member Modal */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-main dark:text-white">會員資訊</h2>
              <button
                onClick={() => setMemberModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-surface-dark/70 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-text-main dark:text-white">close</span>
              </button>
            </div>

            {session?.user && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name || "User"} width={64} height={64} className="rounded-full border-2 border-primary" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                      {session.user.name?.[0] || "U"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-text-sub dark:text-gray-400 uppercase tracking-wide font-semibold">會員名稱</p>
                    <p className="text-lg font-bold text-text-main dark:text-white">{session.user.name || "Rentaloop 會員"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-surface-dark/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">star</span>
                    <p className="text-sm text-text-sub dark:text-gray-400 font-semibold">會員評分</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">4.8</p>
                  <p className="text-xs text-text-sub dark:text-gray-400 mt-1">基於 24 則評價</p>
                </div>

                <button
                  onClick={() => {
                    setMemberModalOpen(false);
                    router.push("/member");
                  }}
                  className="w-full bg-primary hover:bg-primary-dark transition-colors text-text-main font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  前往會員面板
                </button>

                <button
                  onClick={() => setMemberModalOpen(false)}
                  className="w-full bg-gray-100 dark:bg-surface-dark/50 hover:bg-gray-200 dark:hover:bg-surface-dark/70 transition-colors text-text-main dark:text-white font-bold py-3 px-4 rounded-lg"
                >
                  關閉
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
