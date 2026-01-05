'use client';

import { useState, useTransition } from 'react';
import { replyQuestion } from '@/app/actions/qa';
import Image from 'next/image';
import Link from 'next/link';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MemberQAList({ questions }: { questions: any[] }) {
    if (questions.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">目前沒有需要回覆的提問</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {questions.map((q) => (
                <QuestionCard key={q.id} question={q} />
            ))}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuestionCard({ question }: { question: any }) {
    const [reply, setReply] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        startTransition(async () => {
            const res = await replyQuestion(question.itemId, question.id, reply);
            if (res.error) {
                alert(res.error);
            }
        });
    };

    return (
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-100">
                        {question.askerImage ? (
                            <Image src={question.askerImage} alt={question.askerName || 'User'} fill className="object-cover" />
                        ) : (
                            <span className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500">
                                {question.askerName?.[0] || 'U'}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {question.askerName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                            針對 <Link href={`/products/${question.itemId}`} className="text-primary hover:underline">{question.itemTitle}</Link> 的提問
                        </div>
                    </div>
                </div>
                <div className="text-xs text-gray-400">
                    {new Date(question.createdAt).toLocaleDateString()}
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-4">
                {question.content}
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="輸入回覆..."
                    className="w-full p-3 pr-20 text-sm bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-20"
                    disabled={isPending}
                />
                <button
                    type="submit"
                    disabled={isPending || !reply.trim()}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                    {isPending ? '傳送中...' : '回覆'}
                </button>
            </form>
        </div>
    );
}
