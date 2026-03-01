import { NextRequest } from "next/server";
import { z } from "zod";
import { analyzeReviews } from "@/lib/claude";

const analyzeSchema = z.object({
  productName: z.string().min(1),
  matches: z.array(
    z.object({
      retailer: z.enum(["amazon", "bestbuy", "walmart"]),
      title: z.string(),
      price: z.string(),
      rating: z.number().nullable(),
      reviewCount: z.number().nullable(),
      thumbnail: z.string().nullable(),
      link: z.string(),
      productId: z.string(),
      serpApiProductId: z.string().optional(),
    })
  ),
  reviews: z.array(
    z.object({
      retailer: z.enum(["amazon", "bestbuy", "walmart"]),
      author: z.string(),
      rating: z.number(),
      title: z.string(),
      content: z.string(),
      date: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, matches, reviews } = analyzeSchema.parse(body);

    const stream = await analyzeReviews(productName, matches, reviews);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Analyze error:", error);
    return Response.json(
      { error: "Failed to analyze reviews" },
      { status: 500 }
    );
  }
}
