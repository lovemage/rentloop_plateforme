'use client'

import { useState } from 'react';
import { askQuestion, replyQuestion } from '@/app/actions/qa';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Image from 'next/image';

interface Question {
    id: string;
    content: string;
    reply: string | null;
    createdAt: Date | null;
    repliedAt: Date | null;
    user: {
        name: string | null;
        image: string | null;
    } | null;
}

interface ProductQAProps {
    itemId: string;
    questions: Question[];
    isOwner: boolean;
    currentUserId?: string;
}

export function ProductQA({ itemId, questions, isOwner, currentUserId }: ProductQAProps) {
    const [askContent, setAskContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!askContent.trim()) return;
        setSubmitting(true);

        const res = await askQuestion(itemId, askContent);
        if (res.error) {
            alert(res.error);
        } else {
            setAskContent('');
        }
        setSubmitting(false);
    };

    const handleReply = async (questionId: string) => {
        if (!replyContent.trim()) return;
        setSubmitting(true);

        const res = await replyQuestion(itemId, questionId, replyContent);
        if (res.error) {
            alert(res.error);
        } else {
            setReplyingId(null);
            setReplyContent('');
        }
        setSubmitting(false);
    };

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-gray-900">問與答 ({questions.length})</h3>

            {/* Questions List */}
            <div className="space-y-6">
                {questions.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center bg-gray-50 rounded-lg">尚無提問，成為第一個發問的人吧！</p>
                ) : (
                    questions.map((q) => (
                        <div key={q.id} className="space-y-3">
                            {/* Question Bubble */}
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    {q.user?.image ? (
                                        <Image src={q.user.image} alt={q.user?.name || 'User'} width={40} height={40} className="rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {q.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-800">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-bold text-gray-900">{q.user?.name || 'Anonymous'}</span>
                                            <span className="text-xs text-gray-500">
                                                {q.createdAt && formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: zhTW })}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap">{q.content}</p>
                                    </div>

                                    {/* Action Link for Owner */}
                                    {isOwner && !q.reply && replyingId !== q.id && (
                                        <button
                                            onClick={() => setReplyingId(q.id)}
                                            className="text-xs text-primary font-bold mt-1 ml-2 hover:underline"
                                        >
                                            回覆
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Reply Bubble */}
                            {q.reply && (
                                <div className="flex gap-3 flex-row-reverse ml-8 md:ml-12">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-white">
                                            業主
                                        </div>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <div className="bg-green-50 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-gray-800 text-left inline-block max-w-full">
                                            <div className="mb-1 text-xs text-green-700 font-bold">
                                                業主回覆
                                                <span className="text-gray-400 font-normal ml-2">
                                                    {q.repliedAt && formatDistanceToNow(new Date(q.repliedAt), { addSuffix: true, locale: zhTW })}
                                                </span>
                                            </div>
                                            <p className="whitespace-pre-wrap">{q.reply}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reply Input Form (Owner Only) */}
                            {isOwner && replyingId === q.id && (
                                <div className="ml-12 pl-3 border-l-2 border-gray-200">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2"
                                        placeholder="輸入回覆..."
                                        rows={2}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleReply(q.id)}
                                            disabled={submitting}
                                            className="px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:bg-primary-dark"
                                        >
                                            送出回覆
                                        </button>
                                        <button
                                            onClick={() => { setReplyingId(null); setReplyContent(''); }}
                                            className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded hover:bg-gray-300"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Ask Box */}
            {!isOwner && (
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <h4 className="font-bold text-sm mb-2">提出問題</h4>
                    {currentUserId ? (
                        <form onSubmit={handleAsk}>
                            <textarea
                                value={askContent}
                                onChange={(e) => setAskContent(e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-3"
                                placeholder="請問這個還有空檔嗎？配件包含什麼？(請勿留下電話或Line，以免被系統屏蔽)"
                                rows={3}
                                required
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? '傳送中...' : '送出提問'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4 bg-gray-50 rounded text-sm text-gray-500">
                            請 <a href="/auth" className="text-primary font-bold hover:underline">登入</a> 後提出問題
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
