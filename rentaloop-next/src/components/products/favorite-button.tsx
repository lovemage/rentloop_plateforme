"use client";

import { useTransition, useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/tracking";

export function FavoriteButton({ itemId, initialFavorited, initialCount = 0 }: { itemId: string; initialFavorited: boolean; initialCount?: number }) {
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);

  const handleToggle = () => {
    // Optimistic update
    const nextFavorited = !favorited;
    setFavorited(nextFavorited);
    setCount(prev => nextFavorited ? prev + 1 : Math.max(0, prev - 1));

    startTransition(async () => {
      const res = await toggleFavorite(itemId);
      if (res.success) {
        setFavorited(res.favorited);
        // We could sync count from server but simple increment/decrement is fine for UX
        // Unless we return count from server action. But for now optimistic is good.
      } else {
        // Revert on failure
        setFavorited(!nextFavorited);
        setCount(prev => !nextFavorited ? prev + 1 : Math.max(0, prev - 1));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border transition-colors ${favorited
        ? "bg-primary text-text-main border-primary hover:bg-primary-dark"
        : "bg-white text-gray-900 border-gray-200 hover:border-primary"
        }`}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
      <span>{favorited ? "已關注" : "關注"}</span>
      {count > 0 && <span className="ml-1 opacity-80 text-xs">({count})</span>}
    </button>
  );
}
