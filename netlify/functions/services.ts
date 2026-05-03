import type { Handler } from "@netlify/functions";
import { db } from "./_db";
import { services } from "../../shared/schema";
import { eq } from "drizzle-orm";

export const handler: Handler = async (event) => {
  try {
    const url = new URL(event.rawUrl);
    const category = url.searchParams.get("category");
    const rows = category
      ? await db.select().from(services).where(eq(services.category, category))
      : await db.select().from(services);
    const active = rows.filter(r => r.isActive);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(active),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to fetch services" }) };
  }
};


