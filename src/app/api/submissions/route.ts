import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { z } from "zod";

const submissionSchema = z.object({
  sender_name: z.string().trim().min(1).max(120),
  sender_contact: z.string().trim().max(240).optional().default(""),
  type: z.enum(["histori", "foto", "lajm"]),
  message: z.string().trim().min(10).max(6000),
  attachment_url: z.union([z.literal(""), z.string().url().max(2000).refine((value) => /^https?:\/\//i.test(value))]).optional().default(""),
  website: z.string().max(0).optional().default(""),
});
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const form = await request.formData();
  const parsed = submissionSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.redirect(new URL("/kontribuo?error=invalid", request.url), 303);
  const data = parsed.data;
  try {
    await query("INSERT INTO submissions (sender_name,sender_contact,type,message,attachment_url,status) VALUES ($1,$2,$3,$4,$5,'pending')",
      [data.sender_name, data.sender_contact || null, data.type, data.message, data.attachment_url || null]);
  } catch {
    return NextResponse.redirect(new URL("/kontribuo?error=unavailable", request.url), 303);
  }
  return NextResponse.redirect(new URL("/kontribuo?sent=1", request.url), 303);
}
