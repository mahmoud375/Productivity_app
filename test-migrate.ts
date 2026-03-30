import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function runMigrations() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  console.log("running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  console.log("migrations finished!");
  process.exit(0);
}
runMigrations().catch(console.error);
