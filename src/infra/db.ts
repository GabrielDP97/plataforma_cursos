import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy initialization — only connects when first queried
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.NEON_DATABASE_URL;
    if (!url) {
      throw new Error(
        "Missing NEON_DATABASE_URL. Copy .dev.vars.example to .dev.vars and configure your Neon connection string."
      );
    }
    const sql = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Proxy that lazily initializes on first property access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
