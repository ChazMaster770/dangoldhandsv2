import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "[db] DATABASE_URL is not set. Database features will fail until it is configured.",
  );
}

/** Managed/hosted Postgres providers typically require SSL. */
function needsSsl(url: string) {
  return (
    /sslmode=require|sslmode=verify/i.test(url) ||
    /neon\.tech|supabase|vercel|railway\.app|render\.com|upstash|amazonaws|azure|heroku|aiven|elephantsql|cockroachlabs|crunchydata|digitalocean|timescaledb|planetscale|xata/i.test(
      url,
    )
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __dgPool?: Pool;
};

export const pool =
  globalForDb.__dgPool ??
  new Pool({
    connectionString: databaseUrl ?? "postgres://127.0.0.1:5432/__not_configured__",
    // Fail fast instead of hanging the request if the DB is unreachable.
    connectionTimeoutMillis: 5000,
    max: 5,
    idleTimeoutMillis: 10_000,
    ssl:
      databaseUrl && needsSsl(databaseUrl)
        ? { rejectUnauthorized: false }
        : undefined,
  });

// Cache on globalThis so serverless warm invocations and dev hot-reloads
// reuse a single pool instead of exhausting connections.
globalForDb.__dgPool = pool;

export const db = drizzle(pool);
