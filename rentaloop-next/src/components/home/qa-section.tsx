"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui";

const FAQS = [
    {
        question: "Q1：Rentaloop 會參與我們的租賃交易嗎？",
        answer: "Rentaloop 是一個充滿溫度的共享社群，我們致力於連結需要物品的您與願意分享的鄰居。我們專注於提供透明的媒合資訊，而具體的租借細節與款項，則由您與物主像朋友般直接協調，這樣能讓溝通更靈活、更有人情味。",
    },
    {
        question: "Q2：使用過程中如果發生意外損壞怎麼辦？",
        answer: "我們深信每位租客都會像愛護自己的東西一樣珍惜租來的物品。當然，意外有時難免，我們建議雙方在租借前先約定好保障方式（如押金）。若真的發生損壞，基於社群互信原則，請誠實告知物主並共同商討合理的補償方案。",
    },
    {
        question: "Q3：最推薦的交貨方式是什麼？",
        answer: "我們最推薦「面交」！這不僅能省去運費，更能讓雙方當面確認物品狀況，建立互信。見面時，建議您可以一起錄影或拍照留存物品當下的狀態，這一個小小的動作，能讓彼此的租賃體驗更安心、更沒有誤會。",
    },
    {
        question: "Q4：如果我們對物品狀況有不同認知怎麼辦？",
        answer: "互相信任是共享經濟的基石。為了避免認知落差，我們強烈建議在交付與歸還的當下，雙方都一起檢查並記錄物品狀況。若仍有爭議，平台很樂意提供相關的對話或紀錄作為輔助，協助雙方理性溝通，還原真相。",
    },
    {
        question: "Q5：如何讓租賃過程更順利、更放心？",
        answer: "多一點溝通，多一份安心！在租賃前，不妨多利用聊聊功能詢問細節。面交時，保持親切與開放的態度，並透過手機錄影快速掃描一圈物品，這不僅是保護自己，也是給予對方的一份尊重與承諾。",
    },
    {
        question: "Q6：一定要註冊才能使用嗎？",
        answer: "您可以自由瀏覽平台上的豐富資訊，但若想聯繫物主或上架您的寶貝物品，則需要簡單的註冊。這是為了建立一個真實、可信賴的社群環境。",
    },
];

export function QaSection() {
    return (
        <section className="w-full max-w-[960px] px-4 py-16 mx-auto">
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4 text-center items-center">
                    <span className="text-primary font-bold tracking-wider uppercase text-sm">
                        FAQ
                    </span>
                    <h2 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight">
                        常見問題
                    </h2>
                    <p className="text-text-main/70 dark:text-gray-300 text-lg max-w-[600px]">
                        關於平台服務的常見疑問解答
                    </p>
                </div>

                <div className="w-full">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {FAQS.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="border border-[#cfe7d7] dark:border-[#1f402a] rounded-xl px-6 bg-white dark:bg-surface-dark data-[state=open]:bg-green-50 dark:data-[state=open]:bg-primary/5 transition-colors"
                            >
                                <AccordionTrigger className="text-left font-bold text-lg text-text-main dark:text-white hover:text-primary hover:no-underline py-6">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-text-main/80 dark:text-gray-300 text-base leading-relaxed pb-6">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
