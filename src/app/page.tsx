"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import { Radar, ShoppingCart, Brain, BarChart3 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="flex items-center gap-3 mb-6">
          <Radar className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">ReviewRadar</h1>
        </div>
        <p className="text-lg text-gray-500 mb-8 text-center max-w-lg">
          AI-powered review aggregation across Amazon, Best Buy, and Walmart.
          Get the real picture before you buy.
        </p>
        <SearchBar onSearch={handleSearch} isLoading={false} />

        {/* Example searches */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {[
            "Sony WH-1000XM5 headphones",
            "iPad Air M2",
            "Dyson V15 vacuum",
          ].map((example) => (
            <button
              key={example}
              onClick={() => handleSearch(example)}
              className="text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white border-t border-gray-100 px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          How it works
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              1. Search or paste a URL
            </h3>
            <p className="text-sm text-gray-500">
              Enter a product name or paste a link from Amazon, Best Buy, or
              Walmart.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              2. AI reads all reviews
            </h3>
            <p className="text-sm text-gray-500">
              We collect reviews from multiple retailers and analyze them with
              Claude AI.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              3. Get the full picture
            </h3>
            <p className="text-sm text-gray-500">
              See a consolidated score, pros/cons, and per-retailer breakdown at
              a glance.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        Built with Next.js and Claude AI
      </footer>
    </main>
  );
}
