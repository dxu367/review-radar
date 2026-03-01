"use client";

import { AnalysisResult } from "@/lib/types";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ResultsCardProps {
  analysis: AnalysisResult;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export default function ResultsCard({ analysis }: ResultsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start gap-6">
        {/* Score */}
        <div
          className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center ${getScoreColor(analysis.overallScore)}`}
        >
          <span className="text-3xl font-bold">{analysis.overallScore}</span>
          <span className="text-xs font-medium opacity-75">/10</span>
        </div>

        {/* Summary */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">AI Verdict</h3>
          <p className="mt-1 text-gray-700">{analysis.verdict}</p>
          <p className="mt-2 text-sm text-gray-500">{analysis.summary}</p>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
            <ThumbsUp className="w-4 h-4" /> Top Pros
          </h4>
          <ul className="space-y-1">
            {analysis.topPros.map((pro, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">+</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-2">
            <ThumbsDown className="w-4 h-4" /> Top Cons
          </h4>
          <ul className="space-y-1">
            {analysis.topCons.map((con, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">-</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
