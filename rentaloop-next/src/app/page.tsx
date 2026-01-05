import Link from "next/link";
import Image from "next/image";
import { getBannerSetting, type BannerSetting } from "@/app/actions/admin-banners";

const stats = [
  {
    title: "廢棄物減量",
    value: "15,000 kg",
    delta: "+12% 同比增長",
    icon: "delete_outline",
  },
  {
    title: "物品流通次數",
    value: "50,000+",
    delta: "+25% 活躍度",
    icon: "sync_alt",
  },
  {
    title: "碳排放減少",
    value: "8,500 kg",
    delta: "+10% 貢獻值",
    icon: "co2",
  },
];

const features = [
  {
    icon: "home",
    title: "釋放居家空間",
    description:
      "只在需要時使用物品，讓家裡不再堆滿一年只用一次的裝備。享受極簡生活。",
  },
  {
    icon: "eco",
    title: "永續環保選擇",
    description:
      "每次租賃都能減少製造新產品的碳排放與資源消耗，直接為地球減負。",
  },
  {
    icon: "payments",
    title: "經濟實惠聰明",
    description:
      "以零售價的一小部分體驗頂級產品，把省下的錢花在更美好的體驗上。",
  },
];

const sdgs = [
  {
    label: "目標 12：負責任的消費與生產",
    description:
      "透過延長產品生命週期與共享模式，確保永續的消費模式，減少過度生產。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkoJVaNkuUJpqSqpsjfefIJfPKNnBcvGY-1tSPH0cpO1VtdBxx4I9ezwD1siRvGpPyNKufpdGwlLoCtgTUMZLb4_o96brXoCWYYMlBumm8ohN9r33RfEdnC76aJysIEHq4OjhVx9ff6bdvpSn3Vy4UzVKGPe5BQkUkDMIuVo4SM2s5sBDuLG5VRGO4LusFO6g2EXxZxMqbFjz_G9OqCnZ48tbUDTC61krnwNKiiGyYEYADIuKo9qW28OyGOlpRe6QRHrqRH3o6",
  },
  {
    label: "目標 13：氣候行動",
    description:
      "採取緊急行動應對氣候變遷，透過資源效率化減少碳足跡。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2zRYJ8leExYoogwCA29kg1mOOoeTKI4qoN0toTA4FCysnUumVC0G5VozCWKuXsZ_E-04wZJXY3kmy0oWzHhdvsNcRdn2-SMZyk7hXMF0nnrhXlp4zLOL1SneH7-lYN7i_jaQl0wZRPx0DJwcR5ZA6qdwx5PTgYRiDL5EF3M0tjiEcTSFHIqFaoNeu_V1F8mw7S4Bx8v1myFZXpX0xZk_2-YhxdXPDIDiAsPARi2_Qv8o4mRF1D24g6xLsTEQlKwpONs9NQdrm",
  },
  {
    label: "目標 11：永續城市",
    description:
      "減少城市廢棄物，讓我們的社區更加包容、安全、有韌性且永續。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBBvDmMunigSJTmTJ2EhqqA1FAowiMsFqsTjT-xOR86qkJc81rjeeaXxPN7X5EvASiFkqOsXnje1R_a161XiG3ng24-VtX1PpoMY8lVHUmM_umj0ChCdDgzembXlR7M5bV_DRj4UOf3ZDPPDkkpOFlAEavFFKDxXlwe-l-MCZUYunTPhPO2HRWlYHigs_w2EccdPOuSHLDyDG-AUEBBBiRAwZtuESKk61zXa1hRRLP9hN3NfCdIDnQHfINHdC0iVcas_6HTP8Gx",
  },
];

const DEFAULT_BANNER_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTBPvJJQMMJ_r6epTr33NaItdolKC0lJ2vtXkCgBRVHKf5ibNgR9fGm7YvRATfVAiSCXG2R6erxAeH-AIMGNYHyv9PaUBHor69DF3JAKls2QUhOSvk3IzkoXoSHszd_hNrExcM4EkRFzcqryorEGDY8QflTqBSqMzGggmMLDMU_CR_jQXzKgjU-piZmfz75A_ogiMouI9YRGebhSM9S7b6aDAtbCpB-xLNheKgcXUYH-n2NBZpfT5-pxBE6cDHQcTQO8nZHbIR';

export default async function Home() {
  const homeBannerRes = await getBannerSetting('home_banner');
  const homeBanner = homeBannerRes.success ? homeBannerRes.data : null;

  const bgImage = homeBanner?.imageUrl || DEFAULT_BANNER_IMAGE;
  const title = homeBanner?.title || "擁抱體驗，\n何必佔有";
  const subtitle = homeBanner?.subtitle || "加入循環經濟的行列。租賃優質裝備，不僅能省下開銷，更能透過減少浪費為地球盡一份心力。";
  const tagText = homeBanner?.tagText;
  const styles = homeBanner?.styles || {};

  return (
    <div className="flex flex-col items-center">
      <section className="w-full max-w-[1280px] px-4 md:px-10 py-5">
        <div
          className="w-full rounded-2xl overflow-hidden relative min-h-[560px] flex items-center justify-center text-center p-6 md:p-12 group"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url("${bgImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          data-alt="Banner Image"
        >
          <div className="relative z-10 flex flex-col gap-6 max-w-3xl items-center">
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
              style={{ color: styles.titleColor }}
              className={`whitespace-pre-line ${styles.titleSize || 'text-4xl md:text-6xl'} font-black leading-tight tracking-tight drop-shadow-sm`}
            >
              {title}
            </h1>
            <h2
              style={{ color: styles.subtitleColor }}
              className={`${styles.subtitleSize || 'text-base md:text-xl'} font-medium leading-relaxed max-w-2xl drop-shadow-md`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sdgs.map((goal) => (
              <div key={goal.label} className="group flex flex-col gap-4">
                <div
                  className="w-full aspect-video bg-cover bg-center rounded-xl overflow-hidden shadow-sm"
                  style={{ backgroundImage: `url("${goal.image}")` }}
                  data-alt={goal.label}
                >
                  <div className="w-full h-full bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <div>
                  <p className="text-text-main dark:text-white text-lg font-bold leading-normal mb-1">
                    {goal.label}
                  </p>
                  <p className="text-text-sub dark:text-gray-400 text-sm font-normal leading-relaxed">
                    {goal.description}
                  </p>
                </div>
              </div>
            ))}
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
