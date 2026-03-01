"use client";

import { ProductMatch } from "@/lib/types";
import Image from "next/image";

interface ProductHeaderProps {
  matches: ProductMatch[];
  searchQuery?: string;
}

export default function ProductHeader({ matches, searchQuery }: ProductHeaderProps) {
  if (matches.length === 0) return null;

  const primary = matches[0];
  const prices = matches.map((m) => m.price).filter((p) => p !== "N/A");
  const thumbnail = matches.find((m) => m.thumbnail)?.thumbnail;

  return (
    <div className="flex items-start gap-6 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      {thumbnail && (
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
          <Image
            src={thumbnail}
            alt={primary.title}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold text-gray-900 truncate">
          {primary.title}
        </h2>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          {prices.length > 0 && (
            <span className="text-lg font-medium text-gray-900">
              {prices.length > 1
                ? `${prices[0]} — ${prices[prices.length - 1]}`
                : prices[0]}
            </span>
          )}
          <span>Found at {matches.length} retailer{matches.length > 1 ? "s" : ""}</span>
        </div>
        {searchQuery && (
          <p className="mt-1 text-xs text-gray-400">
            Best match for: &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
