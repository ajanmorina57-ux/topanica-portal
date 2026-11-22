import { neon } from "@neondatabase/serverless";

type Row = Record<string, unknown>;
const connectionString = process.env.DATABASE_URL;
const client = connectionString ? neon(connectionString) : null;

export async function query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  if (!client) throw new Error("DATABASE_URL is not configured");
  return client.query(text, params) as Promise<T[]>;
}

export async function safeQuery<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  try { return await query<T>(text, params); } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Database query failed:", error);
    return [];
  }
}
