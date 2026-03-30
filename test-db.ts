import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from './src/lib/db/index';
import { users } from './src/lib/db/schema';

async function main() {
  const result = await db.select().from(users).limit(1);
  console.log('DB connected! Users table works:', result);
  process.exit(0);
}

main().catch(console.error);
