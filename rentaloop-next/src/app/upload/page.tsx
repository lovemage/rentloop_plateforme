const categories = [
  { value: "electronics", label: "3C 電子" },
  { value: "outdoor", label: "戶外露營" },
  { value: "camera", label: "攝影器材" },
  { value: "home", label: "居家生活" },
  { value: "clothing", label: "服飾配件" },
];

const conditions = [
  { value: "new", label: "全新" },
  { value: "like-new", label: "近全新" },
  { value: "good", label: "狀況良好" },
  { value: "fair", label: "可接受" },
];

export default function UploadPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main">
      <main className="flex min-h-screen flex-col">
        <section className="flex-1 px-4 lg:px-10 py-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                  上架物品
                </h1>
                <p className="text-text-sub text-base md:text-lg">讓您的閒置物品創造價值，支持永續生活。</p>
              </div>

              <section className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 md:p-8 shadow-sm border border-border-light dark:border-border-dark">
                <h2 className="text-text-main dark:text-white text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span> 基本資訊
                </h2>
                <div className="flex flex-col gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">物品名稱</span>
                    <input
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub transition-colors"
                      placeholder="例如：Canon EOS R6 相機"
                      type="text"
                    />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">類別</span>
                      <div className="relative">
                        <select
                          defaultValue=""
                          className="w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white h-12 px-4 pr-10 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        >
                          <option disabled value="">
                            選擇類別
                          </option>
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">物品狀況</span>
                      <div className="relative">
                        <select
                          defaultValue=""
                          className="w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white h-12 px-4 pr-10 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        >
                          <option disabled value="">
                            選擇狀況
                          </option>
                          {conditions.map((condition) => (
                            <option key={condition.value} value={condition.value}>
                              {condition.label}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">物品描述</span>
                    <textarea
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white p-4 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub transition-colors resize-none"
                      placeholder="請詳細描述物品的功能、配件、以及任何外觀上的瑕疵..."
                      rows={5}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 md:p-8 shadow-sm border border-border-light dark:border-border-dark">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-text-main dark:text-white text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">imagesmode</span> 物品照片
                  </h2>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    建議至少 3 張
                  </span>
                </div>
                <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-background-light dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                  <div className="size-16 rounded-full bg-surface-light dark:bg-surface-dark shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                  </div>
                  <div className="text-center">
                    <p className="text-text-main dark:text-white font-bold text-lg">點擊或拖曳上傳照片</p>
                    <p className="text-text-sub text-sm mt-1">支援 JPG, PNG 格式，單檔不超過 5MB</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 relative group overflow-hidden border border-border-light dark:border-border-dark">
                    <img
                      className="w-full h-full object-cover"
                      alt="預覽照片"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkIB2qvM2gbFdtnpC4gDzm8ndylKC-OpQwUqrw34LtfVnXwWCGUPRfudpLqQhhB56zQiYokS6Mq3KyZIf-N6BRCoyqPlAuryoJmpwgL_7l_uncvzxgSMTrEejmWn01DnNhoYFCHkneP-OBvX30j0CNRGZdBSCfwmcij7-vXYhaUY4Wsm3wc82hGNt2nuRyyXNlFm_UW4gsIRC6WxcX-cfSZhfwVz5INcFzmOCETG49uaGB8GTJO5z1275s8t4xipvbEw5taTY0"
                    />
                    <button className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center">封面照片</div>
                  </div>
                  <div className="aspect-square rounded-lg bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark flex items-center justify-center text-text-sub">
                    <span className="material-symbols-outlined text-2xl opacity-20">add_photo_alternate</span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 md:p-8 shadow-sm border border-border-light dark:border-border-dark">
                <h2 className="text-text-main dark:text-white text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">payments</span> 租金與時間
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {["每日租金 (TWD)", "押金 (TWD)"].map((label) => (
                    <label key={label} className="flex flex-col gap-2">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub font-bold">$</span>
                        <input
                          className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white h-12 pl-8 pr-4 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-right font-medium"
                          placeholder="0"
                          type="number"
                        />
                      </div>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">最早可租借日期</span>
                    <input
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      type="date"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">面交地點</span>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub">
                        location_on
                      </span>
                      <input
                        className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white h-12 pl-10 pr-4 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="例如：台北市大安捷運站"
                        type="text"
                      />
                    </div>
                  </label>
                </div>
              </section>

              <section className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 md:p-8 shadow-sm border border-border-light dark:border-border-dark">
                <h2 className="text-text-main dark:text-white text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">assignment</span> 使用說明與注意事項
                </h2>
                <div className="flex flex-col gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">使用說明</span>
                    <textarea
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white p-4 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub transition-colors resize-none"
                      placeholder="簡單說明如何操作或使用此物品..."
                      rows={3}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">注意事項</span>
                    <textarea
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white p-4 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub transition-colors resize-none"
                      placeholder="例如：請勿在雨天使用、歸還前請清潔..."
                      rows={3}
                    />
                  </label>
                </div>
              </section>

              <div className="lg:hidden flex flex-col gap-3 mt-4">
                <button className="w-full h-12 rounded-lg bg-primary hover:bg-primary-dark text-text-main font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                  發布物品
                </button>
                <button className="w-full h-12 rounded-lg border border-border-light dark:border-border-dark text-text-sub font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  儲存草稿
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-28 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-text-main dark:text-white font-bold text-lg">預覽效果</h3>
                  <span className="text-xs text-text-sub bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">即時更新</span>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden shadow-lg border border-border-light dark:border-border-dark group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxqupoW9Q9fFfe6JcvM8--cALTLvzdChNa7y3fqf1M5NQ5Qny2-dVJ5jQOwGOQfKuERItnKiGFwNlp9AU1lovy8TS5YPDGXi_zb7z8LecmynN8b8mNpdRhoRAy8_vJK5oJkaHgxi8zpbe2akayKPhAbu3wBPyj90ZxA-cXbnbMddl5B_UjfQZGRtU-umwIeWZ9peQ4of01nEB-HjAeu0teMUEBWleGwGZpbwnpAHemo2RtoqiE7IEQd4O8QmBdYwLSl-DWGIyv"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-text-main">
                      攝影器材
                    </div>
                    <div className="absolute bottom-3 right-3 bg-primary text-text-main text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-sm">verified_user</span> 押金保障
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-lg line-clamp-1">Canon EOS R6 相機</h4>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm">
                        <span className="material-symbols-outlined text-sm fill-current">star</span>
                        <span>5.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-text-sub text-sm">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>台北市大安區</span>
                    </div>
                    <hr className="border-border-light dark:border-border-dark my-1" />
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-black text-primary">$800</span>
                        <span className="text-text-sub text-sm">/日</span>
                      </div>
                      <span className="text-xs text-text-sub bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">押金 $5,000</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="w-full h-12 rounded-lg bg-primary hover:bg-primary-dark text-text-main font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">publish</span>
                    發布物品
                  </button>
                  <button className="w-full h-12 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-sub font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    儲存草稿
                  </button>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 flex gap-3 items-start border border-primary/20">
                  <span className="material-symbols-outlined text-primary mt-0.5">forest</span>
                  <p className="text-sm text-text-main dark:text-white leading-relaxed">
                    <span className="font-bold block mb-1">環保小知識</span>
                    每出租一次這個物品，相當於減少了約 15kg 的碳排放，感謝您的貢獻！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-text-sub text-sm">
            <span>© 2024 租賃平台. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a className="text-text-sub text-sm hover:text-primary" href="#">
              隱私權政策
            </a>
            <a className="text-text-sub text-sm hover:text-primary" href="#">
              使用條款
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
