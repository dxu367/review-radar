"use client";

import { AlternativeProduct } from "@/lib/types";
import Image from "next/image";

interface AlternativeProductsProps {
  alternatives: AlternativeProduct[];
  onSelect: (title: string) => void;
}

export default function AlternativeProducts({
  alternatives,
  onSelect,
}: AlternativeProductsProps) {
  if (alternatives.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-500">
        Not what you&apos;re looking for? Try these alternatives:
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {alternatives.map((alt, i) => (
          <button
            key={i}
            onClick={() => onSelect(alt.title)}
            className="flex-shrink-0 w-44 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-3 text-left cursor-pointer"
          >
            {alt.thumbnail && (
              <div className="relative w-full h-28 mb-2 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src={alt.thumbnail}
                  alt={alt.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
              {alt.title}
            </p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                {alt.price}
              </span>
              {alt.rating && (
                <span className="text-xs text-gray-400">
                  {alt.rating}&#9733;
                </span>
              )}
            </div>
            <span className="mt-1 inline-block text-[10px] text-gray-400 bg-gray-50 rounded px-1.5 py-0.5 capitalize">
              {alt.retailer}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
