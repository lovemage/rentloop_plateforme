import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <SiteHeader />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto prose prose-green">
                    <h1 className="text-3xl font-bold mb-8">服務條款</h1>

                    <p className="text-gray-600 mb-8">最後更新日期：{new Date().toLocaleDateString('zh-TW')}</p>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                        <p className="font-bold text-amber-700">重要聲明</p>
                        <p className="text-sm text-amber-600">
                            Rentaloop 僅提供租賃資訊媒合服務，不介入租賃雙方的實際交易與物品交付。出租方與承租方應自行評估風險，本平台不對物品狀況、損壞或任何交易糾紛負擔法律責任。
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">1. 服務內容</h2>
                        <p>
                            本平台提供使用者上架物品出租資訊及瀏覽租賃資訊的服務。所有交易行為（包含交付、付款、歸還）均由租賃雙方自行協調與執行。
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">2. 使用者義務</h2>
                        <h3 className="text-lg font-medium mb-2 mt-4">出租方責任：</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>必須確保上架物品描述真實，無虛假資訊。</li>
                            <li><strong>交付前必須拍照/錄影存證</strong>，確認物品功能正常且外觀無損。</li>
                            <li>應清楚說明租賃規則、押金及延遲歸還之罰則。</li>
                        </ul>

                        <h3 className="text-lg font-medium mb-2 mt-4">承租方責任：</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>收到物品時應立即檢查並拍照/錄影</strong>，若有問題應當場或第一時間反應。</li>
                            <li>歸還前應清潔物品，並拍照存證。</li>
                            <li>禁止拆解、改裝、轉租、或將物品用於違法用途。</li>
                            <li>若發生損壞或遺失，應依雙方約定或出租方規定進行賠償。</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">3. 禁止事項</h2>
                        <p>使用者不得於本平台進行以下行為，否則我們將停權並保留法律追訴權：</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>上架違禁品（如槍砲彈藥、毒品、盜版商品等）。</li>
                            <li>嚴禁將租賃物品拆解、泡水、於不適當環境（如極端高溫/戶外惡劣環境）使用，除非出租方明示允許。</li>
                            <li>詐欺或惡意破壞行為。</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">4. 免責聲明與糾紛處理</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>物品狀況責任</strong>：本平台不負責檢查物品狀況。任何使用後的損壞、功能異常，概由租賃雙方自行協商處理。</li>
                            <li><strong>運送責任</strong>：任何運送過程中造成的損壞或遺失，本平台不負賠償責任。建議使用有保險的物流服務或面交確認。</li>
                            <li><strong>證據保全</strong>：若發生爭議，使用者可向平台客服請求調閱雙方註冊資料或上傳的照片紀錄，但平台無法進行仲裁或強制執行賠償。建議雙方循法律途徑解決。</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">5. 條款修訂</h2>
                        <p>
                            本平台保留隨時修改本服務條款的權利。修改後的條款將公佈於網站上，恕不另行個別通知。繼續使用本服務即代表您同意受修訂後的條款約束。
                        </p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
