import "dotenv/config";
import { ensureDb } from "./ensure";

/**
 * Manual seed entrypoint: creates missing tables (idempotent) and seeds
 * the starter catalogue if the tables are empty.
 * Usage: npx tsx src/db/seed.ts
 */
ensureDb()
  .then(() => {
    console.log("Database ensured and seeded (existing data was kept).");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
