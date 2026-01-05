import type { Metadata } from "next";
import { Manrope, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { auth } from "@/auth";
import { Toaster } from "react-hot-toast";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSans = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rentaloop-next.local"),
  title: "Rentaloop - 擁抱體驗，何必佔有",
  description:
    "Rentaloop 透過 Next.js 體驗永續租賃旅程。瀏覽商品、上架物品、管理會員資料，一站完成。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="zh-Hant" className={`${manrope.variable} ${notoSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display">
        <SessionProvider session={session}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {isAdminRoute ? (
            // Admin routes - no header/footer, handled by AdminLayoutShell
            <>{children}</>
          ) : (
            // Regular routes - with header/footer
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
              <SiteHeader />
              <main className="flex-1 flex flex-col">{children}</main>
              <SiteFooter />
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}

