"use client";

import { useState, useCallback } from "react";
import { ProductMatch, Review, AnalysisResult, PricePoint, AlternativeProduct } from "@/lib/types";
import { parseAnalysisResult } from "@/lib/parse-analysis";

export type SearchStep = "idle" | "searching" | "fetching_reviews" | "analyzing" | "done" | "error";

interface SearchState {
  step: SearchStep;
  matches: ProductMatch[];
  alternatives: AlternativeProduct[];
  reviews: Review[];
  analysis: AnalysisResult | null;
  error: string | null;
  streamedText: string;
  priceHistory: PricePoint[];
}

export function useProductSearch() {
  const [state, setState] = useState<SearchState>({
    step: "idle",
    matches: [],
    alternatives: [],
    reviews: [],
    analysis: null,
    error: null,
    streamedText: "",
    priceHistory: [],
  });

  const search = useCallback(async (query: string) => {
    setState({
      step: "searching",
      matches: [],
      alternatives: [],
      reviews: [],
      analysis: null,
      error: null,
      streamedText: "",
      priceHistory: [],
    });

    try {
      // Step 1: Search for products
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!searchRes.ok) throw new Error("Search failed");
      const { matches, alternatives } = await searchRes.json();

      if (matches.length === 0) {
        setState((s) => ({
          ...s,
          step: "error",
          error: "No products found. Try a different search term.",
        }));
        return;
      }

      setState((s) => ({ ...s, matches, alternatives: alternatives || [], step: "fetching_reviews" }));

      // Record prices and fetch history in background
      const productTitle = matches[0]?.title || query;
      const priceEntries = matches
        .filter((m: ProductMatch) => m.price)
        .map((m: ProductMatch) => ({
          retailer: m.retailer,
          price: parseFloat(m.price.replace(/[^0-9.]/g, "")),
          title: productTitle,
        }))
        .filter((e: { price: number }) => !isNaN(e.price));

      if (priceEntries.length > 0) {
        fetch("/api/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prices: priceEntries }),
        })
          .then(() =>
            fetch(
              `/api/prices?product=${encodeURIComponent(productTitle)}`
            )
          )
          .then((res) => res.json())
          .then((data) => {
            setState((s) => ({ ...s, priceHistory: data.history || [] }));
          })
          .catch(() => {
            // Price history is non-critical, silently ignore errors
          });
      }

      // Step 2: Fetch reviews
      const products = matches
        .filter((m: ProductMatch) => m.productId)
        .map((m: ProductMatch) => ({
          productId: m.serpApiProductId || m.productId,
          retailer: m.retailer,
        }));

      const reviewsRes = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });

      if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
      const { reviews } = await reviewsRes.json();

      setState((s) => ({ ...s, reviews, step: "analyzing" }));

      // Step 3: Analyze with Claude (streaming)
      const productName = matches[0]?.title || query;
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, matches, reviews }),
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");

      const reader = analyzeRes.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setState((s) => ({ ...s, streamedText: fullText }));
        }
      }

      // Parse the completed JSON
      try {
        const analysis = parseAnalysisResult(fullText, matches);
        setState((s) => ({ ...s, analysis, step: "done" }));
      } catch {
        setState((s) => ({ ...s, step: "done" }));
      }
    } catch (error) {
      setState((s) => ({
        ...s,
        step: "error",
        error: error instanceof Error ? error.message : "Something went wrong",
      }));
    }
  }, []);

  return { ...state, search };
}
