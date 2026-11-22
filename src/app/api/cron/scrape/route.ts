import { NextResponse } from "next/server";
import { runScraper } from "@/lib/scraper";

export const runtime = "nodejs";
export const maxDuration = 60;
async function handleScrape(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorizedCron = !!expected && request.headers.get("authorization") === `Bearer ${expected}`;
  if (!authorizedCron) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await runScraper()); }
  catch (error) {
    console.error("Scraper failed:", error);
    return NextResponse.json({
      checked: 0,
      inserted: 0,
      skipped: 0,
      errors: 1,
    }, { status: 502 });
  }
}
export async function GET(request: Request) { return handleScrape(request); }
export async function POST(request: Request) { return handleScrape(request); }
