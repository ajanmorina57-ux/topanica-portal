import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { query } from "@/lib/db";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/models";
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
  locale: z.enum(["sq", "en", "de"]).optional().default("sq"),
});

function resolveSubmissionLocale(rawLocale: FormDataEntryValue | null, referer: string | null): Locale {
  if (typeof rawLocale === "string" && hasLocale(routing.locales, rawLocale)) {
    return rawLocale;
  }
  if (referer) {
    try {
      const seg = new URL(referer).pathname.split("/").filter(Boolean)[0];
      if (seg && hasLocale(routing.locales, seg)) {
        return seg;
      }
    } catch {
      // Ignore malformed referer
    }
  }
  return routing.defaultLocale;
}

function getLocalizedContributeUrl(locale: Locale, queryString: string, requestUrl: string): URL {
  const path = routing.pathnames["/kontribuo"][locale];
  return new URL(`/${locale}${path}${queryString}`, requestUrl);
}

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
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
  }

  const referer = request.headers.get("referer");
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    const fallbackLocale = resolveSubmissionLocale(null, referer);
    return NextResponse.redirect(getLocalizedContributeUrl(fallbackLocale, "?error=invalid", request.url), 303);
  }

  const locale = resolveSubmissionLocale(form.get("locale"), referer);
  const parsed = submissionSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) {
    return NextResponse.redirect(getLocalizedContributeUrl(locale, "?error=invalid", request.url), 303);
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
    return NextResponse.redirect(getLocalizedContributeUrl(locale, "?error=unavailable", request.url), 303);
  }

  return NextResponse.redirect(getLocalizedContributeUrl(locale, "?sent=1", request.url), 303);
}
