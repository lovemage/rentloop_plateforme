'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface Article {
    id: string;
    image: string | null;
    title: string;
    excerpt: string | null;
    content: string;
    seoSchema: any;
}

export function ArticleSlider({ articles }: { articles: Article[] }) {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    return (
        <>
            {/* Slider Container */}
            <div className="w-full relative group">
                {/* Scrollable Area */}
                <div className="flex overflow-x-auto gap-6 pb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                    {articles.map((article) => (
                        <div
                            key={article.id}
                            className="min-w-[300px] md:min-w-[380px] snap-center flex-shrink-0 cursor-pointer transition-transform hover:-translate-y-1 block"
                            onClick={() => setSelectedArticle(article)}
                        >
                            {/* Inject JSON-LD for this article */}
                            {article.seoSchema && (
                                <script
                                    type="application/ld+json"
                                    dangerouslySetInnerHTML={{ __html: JSON.stringify(article.seoSchema) }}
                                />
                            )}
                            <div className="flex flex-col gap-4 h-full">
                                <div
                                    className="w-full aspect-video bg-cover bg-center rounded-xl overflow-hidden shadow-sm relative"
                                    style={{ backgroundImage: `url("${article.image}")` }}
                                >
                                    <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-text-main dark:text-white text-lg font-bold leading-normal mb-1 line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-text-sub dark:text-gray-400 text-sm font-normal leading-relaxed line-clamp-3">
                                        {article.excerpt}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedArticle(null)}
                    />

                    <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Image */}
                        <div className="relative h-48 sm:h-64 flex-shrink-0 bg-gray-100">
                            {selectedArticle.image && (
                                <Image
                                    src={selectedArticle.image}
                                    alt={selectedArticle.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h2 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">
                                    {selectedArticle.title}
                                </h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                            {/* Render HTML content safely */}
                            <div
                                className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-green-600 hover:prose-a:text-green-500"
                                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                                關閉
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
