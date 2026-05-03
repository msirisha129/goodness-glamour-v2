import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DB_CONNECTION_STRING ||
  process.env.NETLIFY_DB_URL ||
  process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL (or Netlify DB connection string) is required");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);


