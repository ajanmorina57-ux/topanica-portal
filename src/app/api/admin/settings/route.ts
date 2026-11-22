import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const body = await request.json().catch(() => ({})) as { auto_publish_news?: unknown };
  if (typeof body.auto_publish_news !== "boolean") return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  await query("INSERT INTO site_settings (key,value) VALUES ('auto_publish_news',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [String(body.auto_publish_news)]);
  return NextResponse.json({ auto_publish_news: body.auto_publish_news });
}
