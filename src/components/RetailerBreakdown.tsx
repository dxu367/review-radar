"use client";

import { RetailerSummary } from "@/lib/types";
import { ExternalLink, Star } from "lucide-react";

interface RetailerBreakdownProps {
  retailers: RetailerSummary[];
}

const retailerNames: Record<string, string> = {
  amazon: "Amazon",
  bestbuy: "Best Buy",
  walmart: "Walmart",
};

const sentimentColors: Record<string, string> = {
  positive: "bg-green-100 text-green-700",
  mixed: "bg-yellow-100 text-yellow-700",
  negative: "bg-red-100 text-red-700",
};

export default function RetailerBreakdown({ retailers }: RetailerBreakdownProps) {
  if (retailers.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Retailer Breakdown
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {retailers.map((r) => (
          <div
            key={r.retailer}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">
                {retailerNames[r.retailer] || r.retailer}
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${sentimentColors[r.sentiment]}`}
              >
                {r.sentiment}
              </span>
            </div>

            {r.rating !== null && (
              <div className="flex items-center gap-1.5 mb-3">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-gray-900">{r.rating}</span>
                <span className="text-sm text-gray-400">
                  ({r.reviewCount} reviews)
                </span>
              </div>
            )}

            {r.pros.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-green-700 mb-1">Pros</p>
                <ul className="space-y-0.5">
                  {r.pros.slice(0, 3).map((p, i) => (
                    <li key={i} className="text-xs text-gray-600">
                      + {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {r.cons.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-red-700 mb-1">Cons</p>
                <ul className="space-y-0.5">
                  {r.cons.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-xs text-gray-600">
                      - {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {r.link && (
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                View on {retailerNames[r.retailer] || r.retailer}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
