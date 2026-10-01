import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db, pool } from "./index";
import { media } from "./schema";
import { ensureSeed } from "./seed-data";

/**
 * Self-healing schema bootstrap.
 * On the first DB access of each server instance we create any missing
 * tables (idempotent) and seed the starter catalogue, so a fresh database
 * "just works" without running migrations manually.
 */
const DDL = `
CREATE TABLE IF NOT EXISTS "products" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "set_name" text,
  "kind" text DEFAULT 'pack' NOT NULL,
  "price" integer NOT NULL,
  "compare_at" integer,
  "image" text NOT NULL,
  "description" text,
  "badge" text,
  "stock" integer DEFAULT 0 NOT NULL,
  "featured" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "claims" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "image" text NOT NULL,
  "start_price" integer NOT NULL,
  "min_increment" integer DEFAULT 10 NOT NULL,
  "current_bid" integer DEFAULT 0 NOT NULL,
  "current_bidder" text,
  "bids_count" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'live' NOT NULL,
  "ends_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "bids" (
  "id" serial PRIMARY KEY NOT NULL,
  "claim_id" integer NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "amount" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "phone" text,
  "note" text,
  "channel" text NOT NULL,
  "items" jsonb NOT NULL,
  "total" integer NOT NULL,
  "status" text DEFAULT 'new' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "media" (
  "name" text PRIMARY KEY NOT NULL,
  "content_type" text NOT NULL,
  "data" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "claims_status_idx" ON "claims" USING btree ("status");
CREATE INDEX IF NOT EXISTS "bids_claim_idx" ON "bids" USING btree ("claim_id");
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bids_claim_id_fk_auto'
  ) THEN
    ALTER TABLE "bids"
      ADD CONSTRAINT "bids_claim_id_fk_auto"
      FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE;
  END IF;
END $$;
`;

/** Upgrades stale /images/*.png references in existing rows to .jpg. */
async function migrateImagePaths() {
  await db.execute(
    sql`UPDATE "products" SET "image" = REPLACE("image", '.png', '.jpg')
        WHERE "image" LIKE '/images/%' AND "image" LIKE '%.png'`,
  );
  await db.execute(
    sql`UPDATE "claims" SET "image" = REPLACE("image", '.png', '.jpg')
        WHERE "image" LIKE '/images/%' AND "image" LIKE '%.png'`,
  );
}

/**
 * Copies /public/images into the media table (idempotent) so /api/img can
 * serve them on deployments where the static files are missing.
 */
async function seedMediaFromDisk() {
  try {
    const dir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(dir)) return;

    const rows: { name: string; contentType: string; data: string }[] = [];
    const TYPES: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const walk = (d: string, rel: string) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        const name = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          walk(full, name);
        } else {
          const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
          const contentType = TYPES[ext];
          if (contentType) {
            rows.push({
              name,
              contentType,
              data: fs.readFileSync(full).toString("base64"),
            });
          }
        }
      }
    };
    walk(dir, "");
    if (rows.length === 0) return;

    await db.insert(media).values(rows).onConflictDoNothing({ target: media.name });
    console.log(`[db] Media table synced (${rows.length} images from disk)`);
  } catch (err) {
    // Non-fatal: the image route falls back to a placeholder.
    console.error("[db] media seed skipped:", err instanceof Error ? err.message : err);
  }
}

let ensurePromise: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await pool.query(DDL);
      await migrateImagePaths();
      await ensureSeed();
      await seedMediaFromDisk();
    })().catch((err: unknown) => {
      console.error(
        "[db] ensure failed:",
        err instanceof Error ? err.message : err,
      );
      // Reset so the next request retries instead of caching the failure.
      ensurePromise = null;
      throw err;
    });
  }
  return ensurePromise;
}
