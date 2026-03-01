import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProductReviews } from "@/lib/serpapi";
import { Retailer } from "@/lib/types";

const reviewsSchema = z.object({
  products: z.array(
    z.object({
      productId: z.string(),
      retailer: z.enum(["amazon", "bestbuy", "walmart"]),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products } = reviewsSchema.parse(body);

    const reviewResults = await Promise.all(
      products.map((p) =>
        getProductReviews(p.productId, p.retailer as Retailer)
      )
    );

    const reviews = reviewResults.flat();

    return NextResponse.json({ reviews });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
