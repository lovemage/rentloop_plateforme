'use client'

import { type FormEvent, useRef, useState, useTransition } from 'react';
import { sendContactSupportEmail } from '@/app/actions/contact-support';

const supportContexts = [
  {
    icon: "help_center",
    title: "使用問題",
    description: "關於如何租賃、上架物品、平台規則或帳戶管理的疑問。我們提供詳細的操作指南。",
    subject: "使用問題諮詢",
    action: "詢問使用問題",
  },
  {
    icon: "gavel",
    title: "租借糾紛",
    description: "遇到物品損壞、延遲歸還或交易雙方的爭議？我們的客服團隊將協助您公正處理。",
    subject: "租借糾紛回報",
    action: "回報糾紛案件",
  },
  {
    icon: "bug_report",
    title: "系統困難",
    description: "發現系統錯誤 (Bug)、功能故障或操作介面異常？請告訴我們，幫助平台運作更順暢。",
    subject: "系統問題回報",
    action: "報告技術問題",
  },
];

export default function ContactPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [topic, setTopic] = useState("一般諮詢");
  const [subject, setSubject] = useState("客服諮詢");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const jumpToForm = () => {
    const formSection = document.getElementById('support-form');
    formSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenForm = (nextTopic: string, nextSubject: string) => {
    setIsFormOpen(true);
    setTopic(nextTopic);
    setSubject(nextSubject);
    setFeedback(null);
    jumpToForm();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const message = formData.get('message');

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof message !== 'string'
    ) {
      setFeedback({ type: 'error', message: '送出資料格式錯誤，請重新填寫。' });
      return;
    }

    startTransition(async () => {
      const result = await sendContactSupportEmail({
        name,
        email,
        phone,
        topic,
        subject,
        message,
      });

      if (result.success) {
        setFeedback({ type: 'success', message: '客服信件已送出，我們會盡快與您聯繫。' });
        formRef.current?.reset();
        setTopic('一般諮詢');
        setSubject('客服諮詢');
        return;
      }

      setFeedback({ type: 'error', message: result.error || '送出失敗，請稍後再試。' });
    });
  };

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
                <button
                  type="button"
                  className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary-dark transition-all text-text-main font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                  onClick={() => {
                    setIsFormOpen(true);
                    jumpToForm();
                  }}
                >
                  立即填寫客服表單
                </button>
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
                  <button
                    type="button"
                    className="inline-flex items-center text-text-main dark:text-primary font-bold hover:underline decoration-2 decoration-primary underline-offset-4 mt-auto"
                    onClick={() => handleOpenForm(context.title, context.subject)}
                  >
                    {context.action}
                    <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-4 md:px-10 py-10 md:py-16 max-w-4xl mx-auto" id="support-form">
          <div className="rounded-2xl border border-[#d7eadf] bg-[#fcfffd] shadow-lg overflow-hidden">
            <button
              type="button"
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#f2fbf5] transition-colors"
              onClick={() => setIsFormOpen((prev) => !prev)}
            >
              <div>
                <h2 className="text-xl md:text-2xl font-black text-text-main">客服聯絡表單</h2>
                <p className="text-sm text-text-sub mt-1">點擊展開填寫，預設為收合狀態。</p>
              </div>
              <span className="material-symbols-outlined text-primary">{isFormOpen ? 'expand_less' : 'expand_more'}</span>
            </button>

            {isFormOpen && (
              <form ref={formRef} onSubmit={handleSubmit} className="border-t border-[#e7f3eb] px-6 py-6 md:px-8 md:py-8 space-y-5 bg-[#f9fefb]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-semibold">姓名</label>
                    <input id="name" name="name" required className="w-full rounded-lg border border-[#cfe7d7] bg-[#f8fff9] px-3 py-2 text-sm text-[#1f402a] placeholder:text-[#78a88a] focus:outline-none focus:ring-2 focus:ring-[#a9e0be]" placeholder="請輸入您的姓名" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-semibold">Email</label>
                    <input id="email" name="email" type="email" required className="w-full rounded-lg border border-[#cfe7d7] bg-[#f8fff9] px-3 py-2 text-sm text-[#1f402a] placeholder:text-[#78a88a] focus:outline-none focus:ring-2 focus:ring-[#a9e0be]" placeholder="name@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-semibold">電話（選填）</label>
                    <input id="phone" name="phone" className="w-full rounded-lg border border-[#cfe7d7] bg-[#f8fff9] px-3 py-2 text-sm text-[#1f402a] placeholder:text-[#78a88a] focus:outline-none focus:ring-2 focus:ring-[#a9e0be]" placeholder="09xx-xxx-xxx" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="topic" className="text-sm font-semibold">支援情境</label>
                    <input id="topic" name="topic" value={topic} readOnly className="w-full rounded-lg border border-[#d8e9de] bg-[#eef8f1] px-3 py-2 text-sm text-[#2c5b3b]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-sm font-semibold">主旨</label>
                  <input
                    id="subject"
                    name="subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    required
                    className="w-full rounded-lg border border-[#cfe7d7] bg-[#f8fff9] px-3 py-2 text-sm text-[#1f402a] placeholder:text-[#78a88a] focus:outline-none focus:ring-2 focus:ring-[#a9e0be]"
                    placeholder="請輸入主旨"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-semibold">問題描述</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full rounded-lg border border-[#cfe7d7] bg-[#f8fff9] px-3 py-2 text-sm text-[#1f402a] placeholder:text-[#78a88a] focus:outline-none focus:ring-2 focus:ring-[#a9e0be]"
                    placeholder="請描述發生時間、操作步驟與問題細節，方便客服快速協助。"
                  />
                </div>

                {feedback && (
                  <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                    {feedback.message}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-xl h-11 px-6 bg-primary hover:bg-primary-dark text-text-main font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPending ? '送出中...' : '送出客服需求'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section className="w-full px-4 md:px-10 py-16 md:py-24 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#f6fff9] via-white to-[#e2f5e8] dark:from-surface-dark dark:to-background-dark rounded-2xl p-8 md:p-12 border border-[#cfe7d7] dark:border-gray-700 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/15 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary/15 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-2">
                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              </div>
              <h2 className="text-text-main dark:text-white text-3xl md:4xl font-black tracking-tight">
                直接與我們聯繫
              </h2>
              <p className="text-text-main/80 dark:text-gray-300 text-lg leading-relaxed max-w-2xl">
                如果您有其他疑問，或是不確定該選擇哪個分類，歡迎直接發送郵件至{" "}
                <span className="font-bold text-primary dark:text-green-200">service@rentaloop.net</span>，Rentaloop 官方客服團隊會盡快回覆您。
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-200 rounded-full text-sm font-semibold">
                <span className="material-symbols-outlined text-sm text-primary dark:text-green-200">verified</span>
                <span>Rentaloop 官方客服信箱</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/50 text-text-main dark:text-white rounded-full text-sm font-medium border border-primary/20">
                <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                <span>平均回覆時間：約 24 小時內</span>
              </div>
              <div className="pt-4 w-full flex justify-center">
                <button
                  type="button"
                  className="flex items-center justify-center w-full sm:w-auto min-w-[220px] rounded-xl h-12 px-8 bg-primary hover:bg-primary-dark text-text-main font-bold text-lg tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-primary/40"
                  onClick={() => {
                    setIsFormOpen(true);
                    setTopic('一般諮詢');
                    setSubject('客服諮詢');
                    jumpToForm();
                  }}
                >
                  填寫客服表單
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
