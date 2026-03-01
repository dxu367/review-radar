import Anthropic from "@anthropic-ai/sdk";
import { ProductMatch, Review } from "./types";

const anthropic = new Anthropic();

export async function analyzeReviews(
  productName: string,
  matches: ProductMatch[],
  reviews: Review[]
): Promise<ReadableStream<Uint8Array>> {
  const reviewsByRetailer = reviews.reduce(
    (acc, r) => {
      if (!acc[r.retailer]) acc[r.retailer] = [];
      acc[r.retailer].push(r);
      return acc;
    },
    {} as Record<string, Review[]>
  );

  const reviewSummary = Object.entries(reviewsByRetailer)
    .map(
      ([retailer, revs]) =>
        `## ${retailer.toUpperCase()} Reviews (${revs.length}):\n${revs
          .map(
            (r) =>
              `- [${r.rating}/5] "${r.title}" by ${r.author}: ${r.content}`
          )
          .join("\n")}`
    )
    .join("\n\n");

  const matchInfo = matches
    .map(
      (m) =>
        `- ${m.retailer}: "${m.title}" at ${m.price} (${m.rating ?? "N/A"} stars, ${m.reviewCount ?? 0} reviews) — ${m.link}`
    )
    .join("\n");

  const prompt = `You are an expert product reviewer. Analyze the following product reviews from multiple retailers and provide a consolidated analysis.

Product: ${productName}

Product Listings:
${matchInfo}

Reviews:
${reviewSummary}

Return a JSON object (no markdown fences, just raw JSON) with this exact structure:
{
  "productName": "the product name",
  "overallScore": <number 1-10>,
  "summary": "<2-3 sentence summary of the product based on all reviews>",
  "verdict": "<1 sentence buy/skip/consider recommendation>",
  "topPros": ["<pro 1>", "<pro 2>", "<pro 3>"],
  "topCons": ["<con 1>", "<con 2>", "<con 3>"],
  "retailers": [
    {
      "retailer": "<amazon|bestbuy|walmart>",
      "rating": <number or null>,
      "reviewCount": <number>,
      "sentiment": "<positive|mixed|negative>",
      "pros": ["<retailer-specific pro>", ...],
      "cons": ["<retailer-specific con>", ...],
      "link": "<product url>"
    }
  ]
}

Only include retailers that have actual listings. Be specific about pros and cons based on actual review content. The overallScore should reflect a weighted average considering review volume and consistency across retailers.`;

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

