import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '運作流程 | Rentaloop',
  description: '了解如何在 Rentaloop 租借與出租物品，輕鬆完成共享生活。',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20 relative overflow-hidden">
      {/* Animated SVG Background */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-[0.05] pointer-events-none overflow-hidden">
        <svg
          className="absolute w-[800px] h-[800px] -top-40 -left-40 animate-[spin_60s_linear_infinite]"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="var(--color-primary)"
            d="M45.7,-76.1C58.9,-69.3,69.2,-55.4,75.4,-40.5C81.6,-25.6,83.7,-9.7,81.1,5.2C78.5,20.1,71.2,34.1,61.1,45.4C51,56.7,38,65.3,23.5,71.7C9,78.1,-7.1,82.4,-22.1,79.2C-37.1,76,-51,65.3,-62.4,52.2C-73.8,39.1,-82.7,23.6,-85.1,7.2C-87.5,-9.2,-83.4,-26.5,-73.4,-40.1C-63.4,-53.7,-47.5,-63.6,-32.4,-69.5C-17.3,-75.4, -0.6,-77.3,15.5,-74.6C31.6,-71.9,45.7,-76.1,45.7,-76.1Z"
            transform="translate(100 100) scale(1.1)"
          />
        </svg>
        <svg
          className="absolute w-[600px] h-[600px] top-[40%] -right-20 animate-[spin_40s_linear_infinite_reverse]"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="var(--color-border-light)"
            d="M41.5,-68.8C55.4,-61.8,69.5,-53.8,77.9,-41.2C86.3,-28.6,89,-11.4,85.6,4.6C82.2,20.6,72.7,35.4,60.8,46.9C48.9,58.4,34.6,66.6,18.9,72.2C3.2,77.8,-13.9,80.8,-28.5,76.5C-43.1,72.2,-55.2,60.6,-64.7,47.3C-74.2,34,-81.1,19,-82.8,3.5C-84.5,-12,-81,-28,-72.1,-40.8C-63.2,-53.6,-48.9,-63.2,-34.7,-69.9C-20.5,-76.6,-6.4,-80.4,7.2,-79.3C20.8,-78.2,41.5,-68.8,41.5,-68.8Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-text-main dark:text-white mb-6">
              Rentaloop 運作流程
            </h1>
            <p className="text-lg text-text-sub dark:text-gray-300 max-w-2xl mx-auto">
              無論您是想體驗新物品的承租人，還是想活化閒置資產的出租人，在 Rentaloop 都能輕鬆安全地完成交易。
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-16">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Renter Flow */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-border-light dark:border-border-dark relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                  <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                </div>
                <h2 className="text-2xl font-bold text-text-main dark:text-white">一般會員 (承租人)</h2>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-200 dark:before:via-blue-800/50 before:to-transparent">
                {renterSteps.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className="w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark border-2 border-blue-500 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 z-10 shrink-0">
                      {index + 1}
                    </div>
                    <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 flex-1 border border-border-light dark:border-border-dark shadow-sm">
                      <h3 className="font-bold text-lg text-text-main dark:text-white mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-xl">{step.icon}</span>
                        {step.title}
                      </h3>
                      <p className="text-text-sub dark:text-gray-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <Link href="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors shadow-sm">
                  開始探索商品
                </Link>
              </div>
            </div>

            {/* Owner Flow */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-border-light dark:border-border-dark relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/5 flex items-center justify-center text-primary-dark dark:text-primary border border-primary/20 dark:border-primary/10">
                  <span className="material-symbols-outlined text-2xl">storefront</span>
                </div>
                <h2 className="text-2xl font-bold text-text-main dark:text-white">出租會員 (出租人)</h2>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/30 dark:before:via-primary/20 before:to-transparent">
                {ownerSteps.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className="w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark border-2 border-primary flex items-center justify-center font-bold text-primary-dark dark:text-primary z-10 shrink-0">
                      {index + 1}
                    </div>
                    <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 flex-1 border border-border-light dark:border-border-dark shadow-sm">
                      <h3 className="font-bold text-lg text-text-main dark:text-white mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">{step.icon}</span>
                        {step.title}
                      </h3>
                      <p className="text-text-sub dark:text-gray-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link href="/items/new" className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-full transition-colors shadow-sm">
                  上架我的商品
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const renterSteps = [
  {
    icon: 'person_add',
    title: '註冊與認證',
    description: '使用 Email 或社群帳號快速註冊，為保障交易安全，建議完成基本身分認證。'
  },
  {
    icon: 'search',
    title: '尋找與預約',
    description: '瀏覽豐富的租賃商品，選擇您需要的租借日期，確認金額與押金後送出預約申請。'
  },
  {
    icon: 'credit_card',
    title: '確認與付款',
    description: '出租人確認訂單後，平台會引導您支付租金與押金，款項會由平台第三方託管，保障您的權益。'
  },
  {
    icon: 'handshake',
    title: '領取商品',
    description: '依照約定的時間地點面交，或透過物流收取商品。建議當面確認商品狀況並拍照留存。'
  },
  {
    icon: 'sentiment_satisfied',
    title: '開心使用',
    description: '在租期內盡情使用商品！請愛惜使用，若遇到任何問題可隨時透過平台與出租人聯繫。'
  },
  {
    icon: 'assignment_return',
    title: '歸還與退押金',
    description: '租期結束時歸還商品。出租人確認商品無損後，平台將自動退還全額押金給您，最後別忘了給予評價！'
  }
];

const ownerSteps = [
  {
    icon: 'verified_user',
    title: '註冊與實名認證',
    description: '成為出租會員需完成實名認證（KYC）並綁定收款銀行帳戶，確保交易安全與身分真實性。'
  },
  {
    icon: 'add_photo_alternate',
    title: '上架商品',
    description: '拍攝清晰的商品照片，撰寫詳細的物品描述、使用規則，並設定每日租金與押金金額。'
  },
  {
    icon: 'notifications_active',
    title: '審核預約',
    description: '當有承租人預約時，您會收到通知。您可以查看對方的評價紀錄，再決定是否接受該筆預約。'
  },
  {
    icon: 'local_shipping',
    title: '交付商品',
    description: '在約定的時間將商品交給承租人。建議當面點交配件、確認物品外觀，雙方拍照存證避免爭議。'
  },
  {
    icon: 'payments',
    title: '獲得收入',
    description: '承租人成功領取商品後，租金收入將會撥款至您的平台錢包，您可以隨時申請提領至銀行帳戶。'
  },
  {
    icon: 'fact_check',
    title: '收回與檢查',
    description: '租期結束收回商品時，請仔細檢查商品功能與外觀。確認無誤後，系統將退還押金給承租人。完成評價為彼此加分！'
  }
];