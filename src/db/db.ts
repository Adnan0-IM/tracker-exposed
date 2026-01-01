import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Use the non-"-pooler" Neon endpoint in DATABASE_URL for serverless HTTP
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql);
