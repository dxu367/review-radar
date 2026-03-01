export type Retailer = "amazon" | "bestbuy" | "walmart";

export interface SearchRequest {
  query: string;
  isUrl: boolean;
}

export interface ProductMatch {
  retailer: Retailer;
  title: string;
  price: string;
  rating: number | null;
  reviewCount: number | null;
  thumbnail: string | null;
  link: string;
  productId: string;
  serpApiProductId?: string;
}

export interface Review {
  retailer: Retailer;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
}

export interface RetailerSummary {
  retailer: Retailer;
  rating: number | null;
  reviewCount: number;
  sentiment: "positive" | "mixed" | "negative";
  pros: string[];
  cons: string[];
  link: string;
}

export interface PricePoint {
  id: number;
  product_key: string;
  retailer: string;
  price: number;
  recorded_at: string;
}

export interface AlternativeProduct {
  title: string;
  price: string;
  thumbnail: string | null;
  link: string;
  retailer: string;
  rating: number | null;
  reviewCount: number | null;
}

export interface AnalysisResult {
  productName: string;
  overallScore: number;
  summary: string;
  verdict: string;
  topPros: string[];
  topCons: string[];
  retailers: RetailerSummary[];
}
