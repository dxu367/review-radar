"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReviewSummaryProps {
  streamedText: string;
  isStreaming: boolean;
}

export default function ReviewSummary({
  streamedText,
  isStreaming,
}: ReviewSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  if (!streamedText && !isStreaming) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Raw AI Analysis
          </h3>
          {isStreaming && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full animate-pulse">
              Streaming...
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
            {streamedText}
            {isStreaming && <span className="animate-pulse">|</span>}
          </pre>
        </div>
      )}
    </div>
  );
}
