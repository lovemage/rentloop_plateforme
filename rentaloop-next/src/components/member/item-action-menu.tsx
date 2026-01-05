'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { toggleItemStatus, deleteItem } from '@/app/actions/items';
import Link from 'next/link';
import { MoreHorizontal, Trash2, Power, Eye, Edit } from 'lucide-react';

export function ItemActionMenu({ itemId, currentStatus }: { itemId: string; currentStatus: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleStatus = () => {
        if (confirm(currentStatus === 'active' ? '確認要下架此商品嗎？' : '確認要重新上架此商品嗎？')) {
            startTransition(async () => {
                await toggleItemStatus(itemId);
                setIsOpen(false);
            });
        }
    };

    const handleDelete = () => {
        if (confirm('確定要刪除此商品嗎？此操作無法復原。')) {
            startTransition(async () => {
                await deleteItem(itemId);
                setIsOpen(false);
            });
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-text-main dark:text-white transition-colors"
            >
                <MoreHorizontal className="w-5 h-5" />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <div className="py-1">
                        <Link href={`/products/${itemId}`} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5">
                            <Eye className="w-4 h-4" />
                            瀏覽商品
                        </Link>
                        {/* Edit Link - assuming route exists or will exist */}
                        <Link href={`/items/${itemId}/edit`} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5">
                            <Edit className="w-4 h-4" />
                            編輯商品
                        </Link>

                        <button
                            onClick={handleToggleStatus}
                            disabled={isPending}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-left"
                        >
                            <Power className={`w-4 h-4 ${currentStatus === 'active' ? 'text-red-600' : 'text-green-600'}`} />
                            {currentStatus === 'active' ? '下架商品' : '重新上架'}
                        </button>

                        <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 text-left"
                        >
                            <Trash2 className="w-4 h-4" />
                            刪除商品
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
