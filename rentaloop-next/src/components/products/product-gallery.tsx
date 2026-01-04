"use client"

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fallback if no images
    const displayImages = images.length > 0 ? images : Array(5).fill('/api/placeholder/800/600');

    const scrollToImage = (index: number) => {
        setCurrentIndex(index);
        const container = document.getElementById('mobile-gallery');
        if (container) {
            container.scrollTo({
                left: container.clientWidth * index,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollLeft / container.clientWidth);
        setCurrentIndex(index);
    };

    return (
        <div className="space-y-4">
            {/* Main Image Display (Mobile: Swipeable, Desktop: Rounded Large Image) */}
            <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 group">

                {/* Mobile Swipe Container (CSS Scroll Snap) */}
                <div
                    id="mobile-gallery"
                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide md:hidden"
                    onScroll={handleScroll}
                >
                    {displayImages.map((src, idx) => (
                        <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                            {/* 這裡使用一般的 img 標籤，生產環境建議用 next/image */}
                            <img
                                src={src}
                                alt={`Product View ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop View (Show Current Selected) */}
                <div className="hidden md:block w-full h-full relative">
                    <img
                        src={displayImages[currentIndex]}
                        alt={`Product View ${currentIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    {/* Desktop Navigation Arrows (Hover Only) */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => scrollToImage(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            className="p-2 bg-white/80 rounded-full hover:bg-white shadow-sm disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-800" />
                        </button>
                        <button
                            onClick={() => scrollToImage(Math.min(displayImages.length - 1, currentIndex + 1))}
                            disabled={currentIndex === displayImages.length - 1}
                            className="p-2 bg-white/80 rounded-full hover:bg-white shadow-sm disabled:opacity-50 transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-800" />
                        </button>
                    </div>
                </div>

                {/* Mobile Page Indicator (Dots) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                    {displayImages.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop Thumbnails Grid */}
            <div className="hidden md:grid grid-cols-5 gap-4">
                {displayImages.map((src, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all ${currentIndex === idx ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-transparent hover:border-gray-300'
                            }`}
                    >
                        <img
                            src={src}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {currentIndex !== idx && (
                            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
