"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
    {
        question: "Q1：這個網站會負責租賃交易嗎？",
        answer: "不會。本平台僅提供租賃資訊與聯絡媒合，不參與任何交易或金流。",
    },
    {
        question: "Q2：商品壞掉或遺失平台會負責嗎？",
        answer: "不會。商品使用與保管責任完全由租賃雙方自行承擔。",
    },
    {
        question: "Q3：運送途中損壞怎麼辦？",
        answer: "運送風險由使用者自行承擔，平台不負任何責任。",
    },
    {
        question: "Q4：平台可以判定誰該賠償嗎？",
        answer: "不可以。平台不介入責任判定，僅能提供資料紀錄。",
    },
    {
        question: "Q5：平台會保證資訊正確嗎？",
        answer: "平台不保證使用者提供之資訊完全正確，使用者應自行判斷。",
    },
    {
        question: "Q6：發生糾紛平台可以怎麼幫忙？",
        answer: "平台可提供照片與系統紀錄供雙方或司法機關參考。",
    },
    {
        question: "Q7：一定要註冊才能使用嗎？",
        answer: "瀏覽資訊可不註冊，上架與聯絡他人需先註冊。",
    },
    {
        question: "Q8：平台有保險或保障嗎？",
        answer: "目前無。本平台不提供任何保險或交易保障。",
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
