import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui";

export default function QAPage() {
    const faqs = [
        {
            question: "平台是否有提供押金或金流服務？",
            answer: "目前本平台亦不涉及金流服務。租金與押金由出租方與承租方自行協調支付方式（如面交現金、轉帳等）。我們建議雙方在面交時當面點清款項。"
        },
        {
            question: "如果是物流寄送，運費由誰負擔？",
            answer: "運送方式與費用由雙方自行協議。出租方可以在上架時註明偏好的運送方式（如宅配、超商取貨）。若選擇寄送，建議雙方確認包裝完整，並自行承擔運送風險。平台不負責運送過程中的損壞。"
        },
        {
            question: "收到物品如果是壞的怎麼辦？",
            answer: "我們強烈建議承租方在收到物品（面交或取貨）當下，立即拍照與錄影確認功能。若發現問題，請立即聯繫出租方並保留證據。若事後才反應，責任歸屬較難釐清。"
        },
        {
            question: "租賃期間物品損壞如何賠償？",
            answer: "依據雙方約定。通常輕微的使用痕跡（如細微刮傷）不在此限，但若是人為損壞（拆解、進水、摔壞等），承租方需負擔維修費用或照價賠償。這部分屬民事糾紛，平台不介入裁決。"
        },
        {
            question: "延遲歸還會怎麼樣？",
            answer: "請務必遵守約定的歸還時間。若預期會延遲，請提早與出租方聯繫。出租方有權依照事先約定的規則收取延遲費用（滯納金）。嚴重延遲或失聯者，出租方可依侵占罪採取法律行動。"
        },
        {
            question: "發生糾紛時平台能做什麼？",
            answer: "若雙方發生法律糾紛且無法私下經由協調解決，您可以聯繫客服。在符合法律程序的前提下，我們可以提供雙方留存的註冊資料與歷程記錄作為證據，協助雙方進行法律訴訟或調解。"
        },
    ];

    return (
        <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">常見問題 (Q&A)</h1>

                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-green-600">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <h3 className="font-medium text-gray-900 mb-2">還有其他問題嗎？</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        如果您有其他關於平台使用的疑問，歡迎隨時聯繫我們的客服團隊。
                    </p>
                    <a href="/contact" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        聯絡我們
                    </a>
                </div>
            </div>
        </div>
    );
}
