import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { timingSafeEqual } from "node:crypto";

function equalSecret(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !equalSecret(password, expected)) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  try { await createSession(); } catch { return NextResponse.redirect(new URL("/admin/login?error=config", request.url), 303); }
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
