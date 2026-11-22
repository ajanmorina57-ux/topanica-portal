import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET nuk është konfiguruar." }, { status: 503 });
  try {
    const cronUrl = new URL("/api/cron/scrape", request.url);
    const response = await fetch(cronUrl, {
      method: "GET",
      headers: { authorization: `Bearer ${secret}` },
      cache: "no-store",
      signal: AbortSignal.timeout(55000),
    });
    const report = await response.json();
    return NextResponse.json(report, { status: response.status });
  }
  catch (error) {
    console.error("Admin scraper request failed:", error);
    return NextResponse.json({ checked: 0, inserted: 0, skipped: 0, errors: 1 }, { status: 502 });
  }
}
