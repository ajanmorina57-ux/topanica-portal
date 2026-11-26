import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { z } from "zod";

const isImagePath = (value: string) => /^(https?:\/\/|\/)/i.test(value);

const imageOrUrl = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .max(2000)
      .refine(isImagePath, "Duhet të jetë URL ose shteg lokal"),
  ])
  .optional()
  .default("");

const submissionSchema = z.object({
  sender_name: z.string().trim().min(1).max(120),
  sender_contact: z.string().trim().max(240).optional().default(""),
  type: z.enum(["histori", "foto", "lajm"]),
  message: z.string().trim().min(10).max(6000),
  attachment_url: imageOrUrl,
  image_url: imageOrUrl,
  image_urls: z.string().max(30000).optional().default(""),
  website: z.string().max(0).optional().default(""),
});

function parseImageUrls(rawJson: string, fallbackSingle: string, attachmentUrl: string): string[] {
  const urls: string[] = [];
  if (rawJson.trim()) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === "string") {
            const trimmed = item.trim();
            if (trimmed && trimmed.length <= 2000 && isImagePath(trimmed) && !urls.includes(trimmed)) {
              urls.push(trimmed);
            }
          }
        }
      }
    } catch {
      // Ignore malformed JSON and fall back to single fields
    }
  }
  for (const extra of [fallbackSingle, attachmentUrl]) {
    const trimmed = extra.trim();
    if (trimmed && isImagePath(trimmed) && !urls.includes(trimmed)) {
      urls.push(trimmed);
    }
  }
  return urls.slice(0, 12);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const form = await request.formData();
  const parsed = submissionSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/kontribuo?error=invalid", request.url), 303);
  }

  const data = parsed.data;
  const allPhotos = parseImageUrls(data.image_urls, data.image_url, data.attachment_url);
  const primaryImage = data.image_url || allPhotos[0] || data.attachment_url || null;

  try {
    await query(
      "INSERT INTO submissions (sender_name,sender_contact,type,message,attachment_url,image_url,image_urls,status) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,'pending')",
      [
        data.sender_name,
        data.sender_contact || null,
        data.type,
        data.message,
        data.attachment_url || null,
        primaryImage,
        JSON.stringify(allPhotos),
      ],
    );
  } catch (err) {
    console.error("Submission insert error:", err);
    return NextResponse.redirect(new URL("/kontribuo?error=unavailable", request.url), 303);
  }

  return NextResponse.redirect(new URL("/kontribuo?sent=1", request.url), 303);
}
