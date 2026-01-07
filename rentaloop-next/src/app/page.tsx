import Link from "next/link";
import Image from "next/image";
import { getBannerSetting, type BannerSetting } from "@/app/actions/admin-banners";
import { getHomepageStats, getHomepageFeatures, getHomepageArticles, getHomepageNotice } from "@/app/actions/homepage";
import { ArticleSlider } from "@/components/home/article-slider";
import { QaSection } from "@/components/home/qa-section";

export const dynamic = "force-dynamic";

const DEFAULT_BANNER_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTBPvJJQMMJ_r6epTr33NaItdolKC0lJ2vtXkCgBRVHKf5ibNgR9fGm7YvRATfVAiSCXG2R6erxAeH-AIMGNYHyv9PaUBHor69DF3JAKls2QUhOSvk3IzkoXoSHszd_hNrExcM4EkRFzcqryorEGDY8QflTqBSqMzGggmMLDMU_CR_jQXzKgjU-piZmfz75A_ogiMouI9YRGebhSM9S7b6aDAtbCpB-xLNheKgcXUYH-n2NBZpfT5-pxBE6cDHQcTQO8nZHbIR';

export default async function Home() {
  const homeBannerRes = await getBannerSetting('home_banner');
  const homeBanner = homeBannerRes.success ? homeBannerRes.data : null;

  const statsRes = await getHomepageStats();
  const stats = (statsRes.success ? statsRes.data : []) ?? [];

  const featuresRes = await getHomepageFeatures();
  const features = (featuresRes.success ? featuresRes.data : []) ?? [];

  const articlesRes = await getHomepageArticles();
  const articles = (articlesRes.success ? articlesRes.data : []) ?? [];

  const noticeRes = await getHomepageNotice();
  const notice = (noticeRes.success ? noticeRes.data : null);

  const bgImage = homeBanner?.imageUrl || DEFAULT_BANNER_IMAGE;
  const title = homeBanner?.title || "擁抱體驗，\n何必佔有";
  const subtitle = homeBanner?.subtitle || "加入循環經濟的行列。租賃優質裝備，不僅能省下開銷，更能透過減少浪費為地球盡一份心力。";
  const tagText = homeBanner?.tagText;
  const styles = homeBanner?.styles || {};

  // Resolve alignment classes
  let alignClass = "items-center text-center";
  if (styles.textAlign === 'left') alignClass = "items-start text-left";
  if (styles.textAlign === 'right') alignClass = "items-end text-right";

  let justifyClass = "justify-center";
  if (styles.verticalAlign === 'start') justifyClass = "justify-start";
  if (styles.verticalAlign === 'end') justifyClass = "justify-end";

  // Resolve font sizes
  const titleSize = typeof styles.titleSize === 'number' ? `${styles.titleSize}px` : undefined;
  const titleClass = typeof styles.titleSize === 'string' ? styles.titleSize : 'text-4xl md:text-6xl';

  const subtitleSize = typeof styles.subtitleSize === 'number' ? `${styles.subtitleSize}px` : undefined;
  const subtitleClass = typeof styles.subtitleSize === 'string' ? styles.subtitleSize : 'text-base md:text-xl';


  return (
    <div className="flex flex-col items-center">
      <section className="w-full max-w-[1280px] px-4 md:px-10 pt-5">
        {notice && notice.isVisible && (
          <div className="w-full mb-5 border-2 border-black rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-shrink-0 bg-black text-white text-xs font-bold px-3 py-1 rounded">
              {notice.date || new Date().toLocaleDateString()}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{notice.title}</h3>
              {notice.content && <p className="text-sm text-gray-700 mt-1">{notice.content}</p>}
            </div>
          </div>
        )}
        <div
          className={`w-full rounded-2xl overflow-hidden relative min-h-[560px] flex flex-col ${justifyClass} p-6 md:p-12 group`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url("${bgImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          data-alt="Banner Image"
        >
          <div className={`relative z-10 flex flex-col gap-6 max-w-3xl w-full ${alignClass} mx-auto`}>
            {tagText && (
              <span
                style={{
                  color: styles.tagColor,
                  backgroundColor: styles.tagBgColor,
                }}
                className="px-4 py-1.5 rounded-full text-base font-bold backdrop-blur-sm shadow-sm"
              >
                {tagText}
              </span>
            )}
            <h1
              style={{ color: styles.titleColor, fontSize: titleSize }}
              className={`whitespace-pre-line ${titleClass} font-black leading-tight tracking-tight drop-shadow-sm`}
            >
              {title}
            </h1>
            <h2
              style={{ color: styles.subtitleColor, fontSize: subtitleSize }}
              className={`${subtitleClass} font-medium leading-relaxed max-w-2xl drop-shadow-md`}
            >
              {subtitle}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link href="/products" className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-primary-dark text-text-main text-base font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/30">
                立即開始租賃
              </Link>
              <button className="flex items-center justify-center rounded-lg h-12 px-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-base font-bold transition-all">
                了解運作方式
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1280px] px-4 md:px-10 py-8">
        <div className="flex flex-wrap gap-4 justify-center">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#cfe7d7] dark:border-[#1f402a] bg-surface-light dark:bg-surface-dark shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <p className="text-text-main dark:text-gray-200 text-base font-medium">
                  {stat.title}
                </p>
              </div>
              <p className="text-text-main dark:text-white text-3xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="text-[#078829] dark:text-primary text-sm font-bold bg-[#e7f3eb] dark:bg-primary/20 w-fit px-2 py-0.5 rounded">
                {stat.delta}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-[960px] px-4 py-16">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4 text-center items-center">
            <span className="text-primary font-bold tracking-wider uppercase text-sm">
              我們的價值主張
            </span>
            <h2 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight">
              為什麼選擇租賃？
            </h2>
            <p className="text-text-main/70 dark:text-gray-300 text-lg max-w-[600px]">
              從「擁有」轉向「使用」。探索循環經濟模式帶來的便利與環保效益。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-4 rounded-2xl border border-[#cfe7d7] dark:border-[#1f402a] bg-surface-light dark:bg-surface-dark p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark dark:text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    {feature.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-text-main dark:text-white text-xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-text-sub dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-[#e7f3eb]/30 dark:bg-surface-dark/50 py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-12">
            <h2 className="text-text-main dark:text-white text-3xl font-black">
              簡單四步，開啟循環生活
            </h2>
          </div>
          <div className="w-full overflow-hidden rounded-2xl border border-[#cfe7d7] dark:border-[#1f402a] bg-surface-light dark:bg-surface-dark p-3 shadow-sm">
            <Image
              src="/item-rental-process.jpeg"
              alt="Rentaloop 租借流程"
              width={2400}
              height={1350}
              className="h-auto w-full rounded-xl"
              priority
            />
          </div>
        </div>
      </section>

      <QaSection />

      <section className="w-full max-w-[960px] px-4 py-16">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight">
              我們對 SDGs 的承諾
            </h2>
            <p className="text-text-main/70 dark:text-gray-300 text-base max-w-[720px]">
              Rentaloop 的核心使命與聯合國永續發展目標 (SDGs) 高度一致，我們致力於創造一個負責任的未來。
            </p>
          </div>
          <div className="mt-8">
            <ArticleSlider articles={articles} />
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1280px] px-4 md:px-10 py-10 mb-10">
        <div className="w-full bg-text-main dark:bg-[#0a160e] rounded-2xl p-8 md:p-16 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <h2 className="relative z-10 text-white text-3xl md:text-5xl font-black tracking-tight">
            準備好改變生活方式了嗎？
          </h2>
          <p className="relative z-10 text-gray-300 text-lg max-w-xl">
            加入數千名使用者的行列，開始體驗更聰明、更環保的生活。
          </p>
          <button className="relative z-10 mt-4 flex min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-white hover:text-text-main transition-colors text-text-main text-base font-bold">
            免費註冊
          </button>
        </div>
      </section>
    </div>
  );
}
