import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. The portal cannot run without a database.",
    );
  }
  return new Pool({
    connectionString: url,
    // Neon and most managed Postgres need TLS; reject unauthorized only
    // when DATABASE_SSL_ALLOW_SELFSIGNED=1.
    ssl:
      url.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: process.env.DATABASE_SSL_ALLOW_SELFSIGNED !== "1" },
    max: 10,
  });
}

const pool = global.__pgPool ?? makePool();
if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
