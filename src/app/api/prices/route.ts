import { NextRequest, NextResponse } from "next/server";
import {
  normalizeProductKey,
  recordPrice,
  getPriceHistory,
  seedPriceHistory,
  initDb,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  await initDb();

  const product = request.nextUrl.searchParams.get("product");
  if (!product) {
    return NextResponse.json(
      { error: "Missing product parameter" },
      { status: 400 }
    );
  }

  const productKey = normalizeProductKey(product);
  const history = await getPriceHistory(productKey);

  return NextResponse.json({ history });
}

interface PriceEntry {
  retailer: string;
  price: number;
  title: string;
}

export async function POST(request: NextRequest) {
  await initDb();

  const body = await request.json();
  const { prices } = body as { prices: PriceEntry[] };

  if (!prices || !Array.isArray(prices)) {
    return NextResponse.json(
      { error: "Missing prices array" },
      { status: 400 }
    );
  }

  for (const entry of prices) {
    const productKey = normalizeProductKey(entry.title);
    await seedPriceHistory(productKey, entry.retailer, entry.price);
    await recordPrice(productKey, entry.retailer, entry.price);
  }

  return NextResponse.json({ ok: true });
}
