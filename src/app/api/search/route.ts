import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchProduct, lookupProductName } from "@/lib/serpapi";
import { parseProductUrl, isUrl } from "@/lib/url-parser";

const searchSchema = z.object({
  query: z.string().min(1).max(5000),
});

const RETAILER_LABELS: Record<string, string> = {
  amazon: "amazon",
  bestbuy: "best buy",
  walmart: "walmart",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = searchSchema.parse(body);

    let searchQuery = query;

    if (isUrl(query)) {
      const parsed = parseProductUrl(query);

      if (parsed?.productId) {
        // Use Google web search to reliably resolve the product name from its ID
        const label = RETAILER_LABELS[parsed.retailer] || parsed.retailer;
        const productName = await lookupProductName(label, parsed.productId);

        if (productName) {
          searchQuery = productName;
        } else if (parsed.searchQuery) {
          searchQuery = parsed.searchQuery;
        }
      } else if (parsed?.searchQuery) {
        searchQuery = parsed.searchQuery;
      }
    }

    const { matches, alternatives } = await searchProduct(searchQuery);

    return NextResponse.json({ matches, alternatives });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search for products" },
      { status: 500 }
    );
  }
}
