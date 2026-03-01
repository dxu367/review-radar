import { Retailer } from "./types";

interface ParsedUrl {
  retailer: Retailer;
  productId: string;
  searchQuery: string;
}

export function parseProductUrl(input: string): ParsedUrl | null {
  try {
    const url = new URL(input);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes("amazon")) {
      return parseAmazonUrl(url);
    }
    if (hostname.includes("bestbuy")) {
      return parseBestBuyUrl(url);
    }
    if (hostname.includes("walmart")) {
      return parseWalmartUrl(url);
    }

    return null;
  } catch {
    return null;
  }
}

function parseAmazonUrl(url: URL): ParsedUrl | null {
  const dpMatch = url.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
  if (dpMatch) {
    return {
      retailer: "amazon",
      productId: dpMatch[1],
      searchQuery: extractNameFromPath(url.pathname),
    };
  }

  const gpMatch = url.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (gpMatch) {
    return {
      retailer: "amazon",
      productId: gpMatch[1],
      searchQuery: extractNameFromPath(url.pathname),
    };
  }

  return null;
}

function parseBestBuyUrl(url: URL): ParsedUrl | null {
  const skuMatch = url.pathname.match(/\/(\d{7})\.p/);
  if (skuMatch) {
    return {
      retailer: "bestbuy",
      productId: skuMatch[1],
      searchQuery: extractNameFromPath(url.pathname),
    };
  }

  const paramSku = url.searchParams.get("skuId");
  if (paramSku) {
    return {
      retailer: "bestbuy",
      productId: paramSku,
      searchQuery: extractNameFromPath(url.pathname),
    };
  }

  return null;
}

function parseWalmartUrl(url: URL): ParsedUrl | null {
  const ipMatch = url.pathname.match(/\/ip\/[^/]+\/(\d+)/);
  if (ipMatch) {
    return {
      retailer: "walmart",
      productId: ipMatch[1],
      searchQuery: extractNameFromPath(url.pathname),
    };
  }

  const ipMatch2 = url.pathname.match(/\/ip\/(\d+)/);
  if (ipMatch2) {
    return {
      retailer: "walmart",
      productId: ipMatch2[1],
      searchQuery: extractNameFromPath(url.pathname),
    };
  }

  return null;
}

function extractNameFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  for (const segment of segments) {
    if (
      !segment.match(/^(dp|gp|product|ip|site|s)$/i) &&
      !segment.match(/^\d{7,}$/) &&
      !segment.match(/^[A-Z0-9]{10}$/i) &&
      !segment.match(/\.\w+$/) &&
      segment.length > 3
    ) {
      return segment.replace(/-/g, " ");
    }
  }
  return "";
}

export function isUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}
