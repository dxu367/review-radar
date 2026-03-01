import { ProductMatch, AnalysisResult, RetailerSummary } from "./types";

export function parseAnalysisResult(
  jsonString: string,
  matches: ProductMatch[]
): AnalysisResult {
  const cleaned = jsonString
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.retailers) {
    parsed.retailers = parsed.retailers.map((r: RetailerSummary) => {
      const match = matches.find((m) => m.retailer === r.retailer);
      return {
        ...r,
        link: r.link || match?.link || "",
      };
    });
  }

  return parsed as AnalysisResult;
}
