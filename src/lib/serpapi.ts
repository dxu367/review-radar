import { getJson } from "serpapi";
import { ProductMatch, Review, Retailer } from "./types";

const RETAILER_KEYWORDS: Record<Retailer, string[]> = {
  amazon: ["amazon"],
  bestbuy: ["best buy", "bestbuy"],
  walmart: ["walmart"],
};

function detectRetailerFromSource(source: string): Retailer | null {
  const lower = source.toLowerCase();
  for (const [retailer, keywords] of Object.entries(RETAILER_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      return retailer as Retailer;
    }
  }
  return null;
}

function detectRetailerFromLink(link: string): Retailer | null {
  try {
    const hostname = new URL(link).hostname.toLowerCase();
    if (hostname.includes("amazon")) return "amazon";
    if (hostname.includes("bestbuy")) return "bestbuy";
    if (hostname.includes("walmart")) return "walmart";
  } catch {
    // not a valid URL
  }
  return null;
}

export async function lookupProductName(
  retailer: string,
  productId: string
): Promise<string | null> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY not configured");

  try {
    const response = await getJson({
      engine: "google",
      q: `${retailer} ${productId}`,
      api_key: apiKey,
      num: 1,
      gl: "us",
      hl: "en",
    });

    const result = response.organic_results?.[0];
    if (!result?.title) return null;

    // Clean up common suffixes like "- Amazon.com" or ": Best Buy"
    let name = result.title
      .replace(/\s*[-:|]\s*(Amazon\.com|Best Buy|Walmart\.com|Amazon).*$/i, "")
      .replace(/\.\.\.$/,  "")
      .trim();

    // If the title was truncated (...), try to complete it from the snippet
    if (result.title.endsWith("...") && result.snippet) {
      // Extract key product words from snippet that aren't in the title
      const snippetWords = result.snippet
        .split(/[,.:;!]\s*/)[0]  // first phrase of snippet
        .replace(/\s+/g, " ")
        .trim();
      if (snippetWords.length > 5 && snippetWords.length < 80) {
        name = name + " " + snippetWords;
      }
    }

    return name;
  } catch {
    return null;
  }
}

interface SearchResult {
  matches: ProductMatch[];
}

export async function searchProduct(query: string): Promise<SearchResult> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY not configured");

  const response = await getJson({
    engine: "google_shopping",
    q: query,
    api_key: apiKey,
    num: 40,
    gl: "us",
    hl: "en",
  });

  const results = response.shopping_results || [];
  const matches: ProductMatch[] = [];
  const seenRetailers = new Set<Retailer>();

  for (const item of results) {
    const retailer =
      detectRetailerFromSource(item.source || "") ||
      detectRetailerFromLink(item.link || item.product_link || "");

    if (!retailer || seenRetailers.has(retailer)) continue;

    seenRetailers.add(retailer);
    matches.push({
      retailer,
      title: item.title || query,
      price: item.extracted_price
        ? `$${item.extracted_price}`
        : item.price || "N/A",
      rating: item.rating || null,
      reviewCount: item.reviews || null,
      thumbnail: item.thumbnail || null,
      link: item.link || item.product_link || "",
      productId: item.product_id || "",
      serpApiProductId: item.product_id || "",
    });

    if (seenRetailers.size === 3) break;
  }

  return { matches };
}

export async function getProductReviews(
  productId: string,
  retailer: Retailer
): Promise<Review[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY not configured");

  if (!productId) return [];

  try {
    const response = await getJson({
      engine: "google_product",
      product_id: productId,
      api_key: apiKey,
      gl: "us",
      hl: "en",
    });

    const reviewsData = response.reviews_results?.reviews || [];

    return reviewsData.slice(0, 25).map(
      (r: {
        user?: { name?: string };
        rating?: number;
        title?: string;
        snippet?: string;
        date?: string;
      }) => ({
        retailer,
        author: r.user?.name || "Anonymous",
        rating: r.rating || 0,
        title: r.title || "",
        content: (r.snippet || "").slice(0, 300),
        date: r.date || "",
      })
    );
  } catch (error) {
    console.error(`Failed to fetch reviews for ${retailer}:`, error);
    return [];
  }
}
