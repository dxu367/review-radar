import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "prices.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_key TEXT NOT NULL,
        retailer TEXT NOT NULL,
        price REAL NOT NULL,
        recorded_at TEXT NOT NULL
      )
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_price_history_product
      ON price_history (product_key, recorded_at)
    `);
  }
  return db;
}

export function normalizeProductKey(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, " ");
}

export function recordPrice(
  productKey: string,
  retailer: string,
  price: number
): void {
  const database = getDb();
  const stmt = database.prepare(
    "INSERT INTO price_history (product_key, retailer, price, recorded_at) VALUES (?, ?, ?, ?)"
  );
  stmt.run(productKey, retailer, price, new Date().toISOString());
}

export interface PriceRow {
  id: number;
  product_key: string;
  retailer: string;
  price: number;
  recorded_at: string;
}

export function getPriceHistory(productKey: string): PriceRow[] {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT * FROM price_history WHERE product_key = ? ORDER BY recorded_at ASC"
  );
  return stmt.all(productKey) as PriceRow[];
}

export function seedPriceHistory(
  productKey: string,
  retailer: string,
  currentPrice: number
): void {
  const database = getDb();

  // Check if history already exists for this product+retailer
  const existing = database
    .prepare(
      "SELECT COUNT(*) as count FROM price_history WHERE product_key = ? AND retailer = ?"
    )
    .get(productKey, retailer) as { count: number };

  if (existing.count > 0) return;

  // Generate 90 days of simulated price history
  const now = new Date();
  const insert = database.prepare(
    "INSERT INTO price_history (product_key, retailer, price, recorded_at) VALUES (?, ?, ?, ?)"
  );

  const insertMany = database.transaction(() => {
    for (let daysAgo = 90; daysAgo >= 1; daysAgo--) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      // Random fluctuation: +/- up to 8% of current price
      const fluctuation = (Math.random() - 0.5) * 0.16 * currentPrice;
      const price = Math.max(
        currentPrice * 0.85,
        Math.min(currentPrice * 1.15, currentPrice + fluctuation)
      );

      insert.run(
        productKey,
        retailer,
        Math.round(price * 100) / 100,
        date.toISOString()
      );
    }
  });

  insertMany();
}
