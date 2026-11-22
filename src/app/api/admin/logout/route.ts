import { NextResponse } from "next/server";
import { clearSession, requireAdmin } from "@/lib/auth";
export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  await clearSession();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
