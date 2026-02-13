import Link from "next/link";

export const metadata = {
    title: "交付規則說明 - Rentaloop",
    description: "Rentaloop 平台交付規則說明，目前僅開放面交方式，確保租賃安全與保障。",
};

export default function DeliveryRulesPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-2 inline-block">
                        ← 返回首頁
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">交付規則說明</h1>
                    <p className="text-gray-500 mt-2">最後更新：2026 年 2 月</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 space-y-8">

                        {/* 目前開放方式 */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-green-600">handshake</span>
                                <h2 className="text-xl font-bold text-gray-900">目前開放交付方式：面交</h2>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                                <p className="text-gray-700 leading-relaxed">
                                    為確保租賃雙方的權益與安全，<strong>Rentaloop 平台目前僅開放面交方式</strong>進行物品交付。
                                    面交讓雙方能夠當面確認物品狀況，並即時拍照存證，是最安全可靠的交付方式。
                                </p>
                            </div>
                        </section>

                        {/* 面交流程 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">面交流程</h2>
                            <div className="space-y-4">
                                <Step number={1} title="預約確認" desc="租客提出租賃預約，出租方確認後，雙方約定面交時間與地點。" />
                                <Step number={2} title="面交前準備" desc="出租方檢查物品狀況、配件完整性，並準備好相關文件（如使用說明書）。" />
                                <Step number={3} title="現場確認" desc="雙方於約定地點見面，共同檢查物品外觀與功能是否正常。" />
                                <Step number={4} title="拍照存證" desc="建議雙方於面交時拍攝物品照片（至少正面、背面、細節），作為交付時的狀態記錄。" />
                                <Step number={5} title="確認交付" desc="雙方確認無誤後完成交付，租賃正式開始。" />
                            </div>
                        </section>

                        {/* 面交注意事項 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">面交注意事項</h2>
                            <ul className="space-y-3">
                                <NoteItem text="請選擇人流較多的公共場所（如捷運站、便利商店前）作為面交地點。" />
                                <NoteItem text="建議於白天進行面交，避免夜間或偏僻地點。" />
                                <NoteItem text="面交時務必當面確認物品功能正常、配件齊全。" />
                                <NoteItem text="雙方應於面交時拍照或錄影存證，作為日後爭議處理的依據。" />
                                <NoteItem text="若物品有任何瑕疵或損壞，請於面交時當面提出並記錄。" />
                                <NoteItem text="請準時赴約。若需更改時間，請提前通知對方。" />
                            </ul>
                        </section>

                        {/* 歸還流程 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">歸還流程</h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                                <p className="text-gray-700 leading-relaxed">
                                    歸還時同樣採用面交方式，雙方需共同確認物品狀況。出租方應檢查物品是否有損壞、配件是否齊全，
                                    並拍照留存作為歸還時的狀態記錄。確認物品無損後，出租方於平台上確認歸還，租賃即告結束。
                                </p>
                            </div>
                        </section>

                        {/* 未來規劃 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">其他交付方式</h2>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                                <p className="text-gray-600 leading-relaxed">
                                    宅配、郵寄、超商取貨等交付方式目前尚未開放。平台將持續評估並在確保用戶權益的前提下，
                                    逐步開放更多交付選項。屆時會透過平台公告通知所有用戶。
                                </p>
                            </div>
                        </section>

                        {/* 免責聲明 */}
                        <section className="border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">免責聲明</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Rentaloop 平台僅提供資訊媒合服務，不直接參與物品交付過程。
                                平台不對交付過程中發生的損壞、遺失或任何糾紛負責。
                                請雙方自行確認物品狀況並做好相應記錄。如有爭議，建議雙方先自行協商，
                                必要時可聯繫平台客服協助處理。
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}

function Step({ number, title, desc }: { number: number; title: string; desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                {number}
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm mt-0.5">{desc}</p>
            </div>
        </div>
    );
}

function NoteItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 flex-shrink-0 mt-0.5 text-lg">warning</span>
            <span className="text-gray-700 text-sm">{text}</span>
        </li>
    );
}
