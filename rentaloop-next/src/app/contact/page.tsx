const supportContexts = [
  {
    icon: "help_center",
    title: "使用問題",
    description: "關於如何租賃、上架物品、平台規則或帳戶管理的疑問。我們提供詳細的操作指南。",
    mailto: "mailto:support@rental-platform.com?subject=使用問題諮詢",
    action: "詢問使用問題",
  },
  {
    icon: "gavel",
    title: "租借糾紛",
    description: "遇到物品損壞、延遲歸還或交易雙方的爭議？我們的客服團隊將協助您公正處理。",
    mailto: "mailto:support@rental-platform.com?subject=租借糾紛回報",
    action: "回報糾紛案件",
  },
  {
    icon: "bug_report",
    title: "系統困難",
    description: "發現系統錯誤 (Bug)、功能故障或操作介面異常？請告訴我們，幫助平台運作更順暢。",
    mailto: "mailto:support@rental-platform.com?subject=系統問題回報",
    action: "報告技術問題",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center w-full">
        <section className="w-full px-4 md:px-10 py-12 md:py-20 max-w-7xl mx-auto">
          <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
            <div className="flex flex-col gap-6 lg:w-1/2 items-start text-left">
              <div className="flex flex-col gap-3">
                <span className="text-primary font-bold tracking-wider uppercase text-sm">
                  支援中心
                </span>
                <h1 className="text-text-main dark:text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  聯絡我們：<br />
                  支援與協助
                </h1>
                <h2 className="text-text-main/80 dark:text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                  我們在這裡協助您解決租賃過程中的任何問題，推動循環經濟，共同打造更美好的共享環境。
                </h2>
              </div>
              <div className="flex flex-wrap gap-4 mt-2">
                <a
                  className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary-dark transition-all text-text-main font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                  href="#contact-options"
                >
                  選擇聯絡主題
                </a>
                <a
                  className="flex items-center justify-center rounded-lg h-12 px-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-text-main dark:text-white font-bold text-base hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  href="#"
                >
                  查看常見問答 (FAQ)
                </a>
              </div>
            </div>
            <div className="w-full lg:w-1/2 h-full">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent z-10" />
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBl-D1Cy3pUcCaowQJevKrY4o8JElQoLae7HrIVPdZglZ4nb9blo4oPZDEh6C3TaLzEB8SfO8jclQFqyxtGBbICbKTEXhqFaJjz4gGnYV_m3X0vOar3YfVrin3KWhSN5tjXy9QdexwDZdvo1QdNCV8MN5huHnYJ1AlBRK6qXV_ZuI8FxybExdm7pwql9m594NSI2STFIYMDin9ckMsFag0UDOzm4igTvyUCEX7lGRdgLGNVd28JY64oiNNP0qKNjOZBaKKfffGb")',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="w-full bg-white dark:bg-surface-dark py-16 md:py-24 border-y border-[#e7f3eb] dark:border-gray-800"
          id="contact-options"
        >
          <div className="px-4 md:px-10 max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-4 text-center items-center">
              <h2 className="text-text-main dark:text-white text-3xl md:text-4xl font-bold leading-tight">
                常見支援情境
              </h2>
              <p className="text-text-sub dark:text-gray-400 text-lg max-w-2xl">
                請根據您遇到的狀況，選擇最適合的聯絡主題，以利我們加速處理您的需求。
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {supportContexts.map((context) => (
                <div
                  key={context.title}
                  className="group flex flex-col p-6 lg:p-8 rounded-xl bg-background-light dark:bg-background-dark border border-[#cfe7d7] dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl">{context.icon}</span>
                  </div>
                  <h3 className="text-text-main dark:text-white text-xl font-bold mb-3">{context.title}</h3>
                  <p className="text-text-sub dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                    {context.description}
                  </p>
                  <a
                    className="inline-flex items-center text-text-main dark:text-primary font-bold hover:underline decoration-2 decoration-primary underline-offset-4 mt-auto"
                    href={context.mailto}
                  >
                    {context.action}
                    <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-4 md:px-10 py-16 md:py-24 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white to-[#f0f9f4] dark:from-surface-dark dark:to-background-dark rounded-2xl p-8 md:p-12 border border-[#cfe7d7] dark:border-gray-700 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-2">
                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              </div>
              <h2 className="text-text-main dark:text-white text-3xl md:text-4xl font-black tracking-tight">
                直接與我們聯繫
              </h2>
              <p className="text-text-main/80 dark:text-gray-300 text-lg leading-relaxed max-w-2xl">
                如果您有其他疑問，或是不確定該選擇哪個分類，歡迎直接發送電子郵件至{" "}
                <span className="font-bold text-text-main dark:text-white">support@rental-platform.com</span>。
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>平均回覆時間：24 小時內</span>
              </div>
              <div className="pt-4 w-full flex justify-center">
                <a
                  className="flex items-center justify-center w-full sm:w-auto min-w-[200px] rounded-lg h-12 px-8 bg-primary hover:bg-primary-dark text-text-main font-bold text-lg tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  href="mailto:support@rental-platform.com"
                >
                  撰寫郵件
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
