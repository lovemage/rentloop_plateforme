"use client";

import { useTransition, useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/tracking";

export function FavoriteButton({ itemId, initialFavorited }: { itemId: string; initialFavorited: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleFavorite(itemId);
      if (res.success) setFavorited(res.favorited);
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
      {favorited ? "已關注" : "關注"}
    </button>
  );
}
