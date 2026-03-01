"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useProductSearch } from "@/hooks/useProductSearch";
import SearchBar from "@/components/SearchBar";
import LoadingSteps from "@/components/LoadingSteps";
import ProductHeader from "@/components/ProductHeader";
import ResultsCard from "@/components/ResultsCard";
import RetailerBreakdown from "@/components/RetailerBreakdown";
import ReviewSummary from "@/components/ReviewSummary";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import AlternativeProducts from "@/components/AlternativeProducts";
import { Radar, AlertCircle } from "lucide-react";
import Link from "next/link";

function ResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { step, matches, alternatives, analysis, error, streamedText, priceHistory, search } =
    useProductSearch();

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  const handleNewSearch = (newQuery: string) => {
    window.history.pushState({}, "", `/results?q=${encodeURIComponent(newQuery)}`);
    search(newQuery);
  };

  const isLoading = step !== "idle" && step !== "done" && step !== "error";

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Radar className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">
              ReviewRadar
            </span>
          </Link>
          <div className="flex-1">
            <SearchBar onSearch={handleNewSearch} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <LoadingSteps step={step} />

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {matches.length > 0 && <ProductHeader matches={matches} searchQuery={query} />}

        {alternatives.length > 0 && (
          <AlternativeProducts alternatives={alternatives} onSelect={handleNewSearch} />
        )}

        {priceHistory.length > 0 && (
          <PriceHistoryChart priceHistory={priceHistory} />
        )}

        {analysis && <ResultsCard analysis={analysis} />}

        {analysis?.retailers && (
          <RetailerBreakdown retailers={analysis.retailers} />
        )}

        <ReviewSummary
          streamedText={streamedText}
          isStreaming={step === "analyzing"}
        />
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
