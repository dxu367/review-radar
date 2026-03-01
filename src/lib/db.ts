import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return client;
}

export async function initDb(): Promise<void> {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_key TEXT NOT NULL,
      retailer TEXT NOT NULL,
      price REAL NOT NULL,
      recorded_at TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_price_history_product
    ON price_history (product_key, recorded_at)
  `);
}

export function normalizeProductKey(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function recordPrice(
  productKey: string,
  retailer: string,
  price: number
): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "INSERT INTO price_history (product_key, retailer, price, recorded_at) VALUES (?, ?, ?, ?)",
    args: [productKey, retailer, price, new Date().toISOString()],
  });
}

export interface PriceRow {
  id: number;
  product_key: string;
  retailer: string;
  price: number;
  recorded_at: string;
}

export async function getPriceHistory(productKey: string): Promise<PriceRow[]> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM price_history WHERE product_key = ? ORDER BY recorded_at ASC",
    args: [productKey],
  });
  return result.rows as unknown as PriceRow[];
}

export async function seedPriceHistory(
  productKey: string,
  retailer: string,
  currentPrice: number
): Promise<void> {
  const db = getDb();

  const existing = await db.execute({
    sql: "SELECT COUNT(*) as count FROM price_history WHERE product_key = ? AND retailer = ?",
    args: [productKey, retailer],
  });

  if ((existing.rows[0].count as number) > 0) return;

  const now = new Date();
  const statements = [];

  for (let daysAgo = 90; daysAgo >= 1; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const fluctuation = (Math.random() - 0.5) * 0.16 * currentPrice;
    const price = Math.max(
      currentPrice * 0.85,
      Math.min(currentPrice * 1.15, currentPrice + fluctuation)
    );

    statements.push({
      sql: "INSERT INTO price_history (product_key, retailer, price, recorded_at) VALUES (?, ?, ?, ?)",
      args: [
        productKey,
        retailer,
        Math.round(price * 100) / 100,
        date.toISOString(),
      ],
    });
  }

  await db.batch(statements);
}
