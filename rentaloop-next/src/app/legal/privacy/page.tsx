import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PrivacyPage() {
    return (
        <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-3xl mx-auto prose prose-green">
                <h1 className="text-3xl font-bold mb-8">隱私權政策</h1>

                <p className="text-gray-600 mb-8">最後更新日期：{new Date().toLocaleDateString('zh-TW')}</p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">1. 引言</h2>
                    <p>
                        歡迎使用 Rentaloop（以下簡稱「本平台」）。我們非常重視您的隱私權，並致力於保護您的個人資料。本隱私權政策旨在向您說明我們如何收集、使用、處理及保護您的個人資訊。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">2. 資料收集與使用</h2>
                    <p>我們僅在提供服務所需的範圍內收集您的個人資料，包括但不限於：</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>註冊資訊：電子郵件、姓名、個人頭像。</li>
                        <li>驗證資訊：為了確保交易安全，我們可能會要求提供身分證明文件（僅用於審核，審核後不保留原始檔案，或加密存儲）。</li>
                        <li>交易資訊：租賃雙方的聯絡方式將在訂單確認後提供給對方，以利後續面交或寄送聯繫。</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">3. 平台角色與資料揭露</h2>
                    <p>
                        <strong>本平台僅作為資訊媒合的中介者。</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>我們不會將您的資料出售給第三方。</li>
                        <li>當租賃媒合成功後，出租方與承租方將獲得對方的必要聯絡資訊。</li>
                        <li>若發生法律糾紛或應執法機關要求，我們將依法配合提供相關使用者資料（如註冊時留存的紀錄）。</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">4. 安全性</h2>
                    <p>
                        我們採取合理的技術與管理措施來保護您的資料安全。然而，網際網路傳輸無法保證百分之百安全，請您妥善保管您的帳號密碼。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">5. 聯絡我們</h2>
                    <p>
                        如果您對本隱私權政策有任何疑問，請透過平台客服系統或 Email 與我們聯繫。
                    </p>
                </section>
            </div>
        </div>
    );
}
