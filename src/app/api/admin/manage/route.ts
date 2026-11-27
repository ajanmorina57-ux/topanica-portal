import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/models";
import { slugify } from "@/lib/site";
import { z } from "zod";

const imageOrUrl = z.string().trim().max(2000).refine((val) => /^(https?:\/\/|\/)/i.test(val), "Duhet të jetë URL ose shteg lokal");
const httpUrl = z.string().url().max(2000).refine((value) => /^https?:\/\//i.test(value));

const LOCALE_NAMES: Record<TranslationLocale, string> = {
  en: "EN",
  de: "DE",
};

const articleSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(3).max(240),
  summary: z.string().trim().min(5).max(1200),
  body: z.string().trim().min(10).max(25000),
  category: z.enum(["topanice", "komuna", "zhvillim", "mergata"]),
  cover_url: imageOrUrl.optional().or(z.literal("")),
  image_url: imageOrUrl.optional().or(z.literal("")),
  source_name: z.string().trim().max(240).optional().or(z.literal("")),
  source_url: httpUrl.optional().or(z.literal("")),
  source_type: z.enum(["rss", "tavily", "facebook_import", "manual"]).default("manual"),
  status: z.enum(["draft", "published"]).optional(),
  published_at: z.string().trim().optional().or(z.literal("")),
});
const historySchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  era_year: z.string().trim().min(1).max(80),
  title: z.string().trim().min(3).max(240),
  content: z.string().trim().min(20).max(6000),
  image_url: imageOrUrl.optional().or(z.literal("")),
  source_citation: z.string().trim().max(1200).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).max(10000).default(100),
});
const photoSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(2).max(240),
  category: z.enum(["arkiv", "natyre", "fshati"]),
  image_url: z.string().trim().min(1).max(2000).refine((val) => /^(https?:\/\/|\/)/i.test(val), "Duhet të jetë URL ose shteg lokal"),
  year_taken: z.union([z.literal(""), z.coerce.number().int().min(1800).max(2100)]).optional(),
  credit: z.string().trim().max(500).optional(),
});
const submissionStatusSchema = z.object({ id: z.coerce.number().int().positive(), status: z.enum(["approved", "rejected", "pending"]) });
const submissionConvertSchema = z.object({ id: z.coerce.number().int().positive() });
const articleStatusSchema = z.object({ id: z.coerce.number().int().positive(), status: z.enum(["published", "draft"]) });
const deleteSchema = z.object({ id: z.coerce.number().int().positive(), entity: z.enum(["article", "history", "photo"]) });
const formObject = (form: FormData): Record<string, string> =>
  Object.fromEntries(
    [...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );

const strField = (values: Record<string, string>, key: string) => (values[key] ?? "").trim();

type ParsedArticleTranslation = { title: string; summary: string; body: string };
type ParsedHistoryTranslation = { era_year: string; title: string; content: string; source_citation: string | null };
type ParsedPhotoTranslation = { title: string; credit: string | null };

function parseArticleTranslations(
  values: Record<string, string>,
): Record<TranslationLocale, ParsedArticleTranslation | null> {
  const result = {} as Record<TranslationLocale, ParsedArticleTranslation | null>;
  for (const locale of TRANSLATION_LOCALES) {
    const label = LOCALE_NAMES[locale];
    const title = strField(values, `title_${locale}`);
    const summary = strField(values, `summary_${locale}`);
    const body = strField(values, `body_${locale}`);
    if (!title && !summary && !body) {
      result[locale] = null;
      continue;
    }
    const parsed = z
      .object({
        title: z.string().min(3, `Përkthimi ${label}: Titulli duhet të ketë të paktën 3 karaktere.`).max(240, `Përkthimi ${label}: Titulli është shumë i gjatë.`),
        summary: z.string().min(5, `Përkthimi ${label}: Përmbledhja duhet të ketë të paktën 5 karaktere.`).max(1200, `Përkthimi ${label}: Përmbledhja është shumë e gjatë.`),
        body: z.string().min(10, `Përkthimi ${label}: Teksti duhet të ketë të paktën 10 karaktere.`).max(25000, `Përkthimi ${label}: Teksti është shumë i gjatë.`),
      })
      .safeParse({ title, summary, body });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || `Përkthimi ${label}: Kontrolloni fushat e artikullit.`);
    }
    result[locale] = parsed.data;
  }
  return result;
}

function parseHistoryTranslations(
  values: Record<string, string>,
): Record<TranslationLocale, ParsedHistoryTranslation | null> {
  const result = {} as Record<TranslationLocale, ParsedHistoryTranslation | null>;
  for (const locale of TRANSLATION_LOCALES) {
    const label = LOCALE_NAMES[locale];
    const era_year = strField(values, `era_year_${locale}`);
    const title = strField(values, `title_${locale}`);
    const content = strField(values, `content_${locale}`);
    const source_citation = strField(values, `source_citation_${locale}`);
    if (!era_year && !title && !content && !source_citation) {
      result[locale] = null;
      continue;
    }
    const parsed = z
      .object({
        era_year: z.string().min(1, `Përkthimi ${label}: Plotësoni periudhën/vitin.`).max(80, `Përkthimi ${label}: Periudha është shumë e gjatë.`),
        title: z.string().min(3, `Përkthimi ${label}: Titulli duhet të ketë të paktën 3 karaktere.`).max(240, `Përkthimi ${label}: Titulli është shumë i gjatë.`),
        content: z.string().min(20, `Përkthimi ${label}: Përmbajtja duhet të ketë të paktën 20 karaktere.`).max(6000, `Përkthimi ${label}: Përmbajtja është shumë e gjatë.`),
        source_citation: z.string().max(1200, `Përkthimi ${label}: Burimi është shumë i gjatë.`),
      })
      .safeParse({ era_year, title, content, source_citation });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || `Përkthimi ${label}: Kontrolloni fushat historike.`);
    }
    result[locale] = {
      era_year: parsed.data.era_year,
      title: parsed.data.title,
      content: parsed.data.content,
      source_citation: parsed.data.source_citation || null,
    };
  }
  return result;
}

function parsePhotoTranslations(
  values: Record<string, string>,
): Record<TranslationLocale, ParsedPhotoTranslation | null> {
  const result = {} as Record<TranslationLocale, ParsedPhotoTranslation | null>;
  for (const locale of TRANSLATION_LOCALES) {
    const label = LOCALE_NAMES[locale];
    const title = strField(values, `title_${locale}`);
    const credit = strField(values, `credit_${locale}`);
    if (!title && !credit) {
      result[locale] = null;
      continue;
    }
    const parsed = z
      .object({
        title: z.string().min(2, `Përkthimi ${label}: Titulli i fotos duhet të ketë të paktën 2 karaktere.`).max(240, `Përkthimi ${label}: Titulli është shumë i gjatë.`),
        credit: z.string().max(500, `Përkthimi ${label}: Autori/burimi është shumë i gjatë.`),
      })
      .safeParse({ title, credit });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || `Përkthimi ${label}: Kontrolloni fushat e fotos.`);
    }
    result[locale] = {
      title: parsed.data.title,
      credit: parsed.data.credit || null,
    };
  }
  return result;
}

async function syncArticleTranslations(
  articleId: number,
  translations: Record<TranslationLocale, ParsedArticleTranslation | null>,
) {
  for (const locale of TRANSLATION_LOCALES) {
    const entry = translations[locale];
    if (!entry) {
      await query("DELETE FROM article_translations WHERE article_id=$1 AND locale=$2", [articleId, locale]);
      continue;
    }
    await query(
      `INSERT INTO article_translations (article_id, locale, title, summary, body, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (article_id, locale) DO UPDATE SET
         title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         body = EXCLUDED.body,
         updated_at = NOW()`,
      [articleId, locale, entry.title, entry.summary, entry.body],
    );
  }
}

async function syncHistoryTranslations(
  historyEntryId: number,
  translations: Record<TranslationLocale, ParsedHistoryTranslation | null>,
) {
  for (const locale of TRANSLATION_LOCALES) {
    const entry = translations[locale];
    if (!entry) {
      await query("DELETE FROM history_entry_translations WHERE history_entry_id=$1 AND locale=$2", [
        historyEntryId,
        locale,
      ]);
      continue;
    }
    await query(
      `INSERT INTO history_entry_translations (history_entry_id, locale, era_year, title, content, source_citation, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (history_entry_id, locale) DO UPDATE SET
         era_year = EXCLUDED.era_year,
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         source_citation = EXCLUDED.source_citation,
         updated_at = NOW()`,
      [historyEntryId, locale, entry.era_year, entry.title, entry.content, entry.source_citation],
    );
  }
}

async function syncPhotoTranslations(
  galleryPhotoId: number,
  translations: Record<TranslationLocale, ParsedPhotoTranslation | null>,
) {
  for (const locale of TRANSLATION_LOCALES) {
    const entry = translations[locale];
    if (!entry) {
      await query("DELETE FROM gallery_photo_translations WHERE gallery_photo_id=$1 AND locale=$2", [
        galleryPhotoId,
        locale,
      ]);
      continue;
    }
    await query(
      `INSERT INTO gallery_photo_translations (gallery_photo_id, locale, title, credit, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (gallery_photo_id, locale) DO UPDATE SET
         title = EXCLUDED.title,
         credit = EXCLUDED.credit,
         updated_at = NOW()`,
      [galleryPhotoId, locale, entry.title, entry.credit],
    );
  }
}

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Kërkesë e pavlefshme." }, { status: 400 });
  }
  const action = String(form.get("action") || "");
  const values = formObject(form);
  let notice = "saved";

  try {
    if (action === "article-save") {
      const data = articleSchema.parse(values);
      const translations = parseArticleTranslations(values);
      const status = data.status || "draft";
      const finalImage = data.image_url || data.cover_url || null;
      let rawDate: string | null = null;
      if (data.published_at && data.published_at.trim() !== "") {
        const parsedDate = new Date(data.published_at.trim());
        if (!Number.isNaN(parsedDate.getTime())) rawDate = parsedDate.toISOString();
      }
      let articleId = data.id;
      if (articleId) {
        await query(
          "UPDATE articles SET title=$1,summary=$2,body=$3,category=$4,cover_url=$5,image_url=$5,source_name=$6,source_url=$7,source_type=$8,status=$9,published_at=COALESCE($10::timestamptz, CASE WHEN $9='published' THEN COALESCE(published_at, NOW()) ELSE published_at END) WHERE id=$11",
          [data.title, data.summary, data.body, data.category, finalImage, data.source_name || null, data.source_url || null, data.source_type, status, rawDate, articleId],
        );
      } else {
        const slug = `${slugify(data.title) || "lajm-topanica"}-${randomUUID()}`;
        const inserted = await query<{ id: number }>(
          "INSERT INTO articles (slug,title,summary,body,category,cover_url,image_url,source_name,source_url,source_type,is_auto_scraped,status,published_at) VALUES ($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,FALSE,$10,COALESCE($11::timestamptz, CASE WHEN $10='published' THEN NOW() ELSE NULL END)) RETURNING id",
          [slug, data.title, data.summary, data.body, data.category, finalImage, data.source_name || null, data.source_url || null, data.source_type, status, rawDate],
        );
        articleId = inserted[0]?.id;
      }
      if (articleId) await syncArticleTranslations(articleId, translations);
      notice = status === "published" ? "published" : "saved";
    } else if (action === "article-status") {
      const data = articleStatusSchema.parse(values);
      await query("UPDATE articles SET status=$1,published_at=CASE WHEN $1='published' THEN COALESCE(published_at,NOW()) ELSE NULL END WHERE id=$2", [data.status, data.id]);
      notice = data.status === "published" ? "published" : "saved";
    } else if (action === "history-save") {
      const data = historySchema.parse(values);
      const translations = parseHistoryTranslations(values);
      const img = data.image_url || null;
      let historyId = data.id;
      if (historyId) {
        await query(
          "UPDATE history_entries SET era_year=$1,title=$2,content=$3,source_citation=$4,sort_order=$5,image_url=$6 WHERE id=$7",
          [data.era_year, data.title, data.content, data.source_citation || null, data.sort_order, img, historyId],
        );
      } else {
        const inserted = await query<{ id: number }>(
          "INSERT INTO history_entries (era_year,title,content,source_citation,sort_order,image_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
          [data.era_year, data.title, data.content, data.source_citation || null, data.sort_order, img],
        );
        historyId = inserted[0]?.id;
      }
      if (historyId) await syncHistoryTranslations(historyId, translations);
    } else if (action === "photo-save") {
      const data = photoSchema.parse(values);
      const translations = parsePhotoTranslations(values);
      const year = data.year_taken === "" ? null : data.year_taken;
      let photoId = data.id;
      if (photoId) {
        await query(
          "UPDATE gallery_photos SET title=$1,category=$2,image_url=$3,year_taken=$4,credit=$5 WHERE id=$6",
          [data.title, data.category, data.image_url, year, data.credit || null, photoId],
        );
      } else {
        const inserted = await query<{ id: number }>(
          "INSERT INTO gallery_photos (title,category,image_url,year_taken,credit) VALUES ($1,$2,$3,$4,$5) RETURNING id",
          [data.title, data.category, data.image_url, year, data.credit || null],
        );
        photoId = inserted[0]?.id;
      }
      if (photoId) await syncPhotoTranslations(photoId, translations);
    } else if (action === "submission-status") {
      const data = submissionStatusSchema.parse(values);
      await query("UPDATE submissions SET status=$1 WHERE id=$2", [data.status, data.id]);
      notice = data.status === "approved" ? "approved" : "rejected";
    } else if (action === "submission-convert-article") {
      const data = submissionConvertSchema.parse(values);
      const rows = await query<{ id: number }>(
        `WITH approved AS (
          UPDATE submissions SET status='approved' WHERE id=$1 AND status='pending'
          RETURNING message, attachment_url, image_url
        )
        INSERT INTO articles (slug,title,summary,body,category,cover_url,image_url,source_name,source_type,is_auto_scraped,status)
        SELECT $2, left(regexp_replace(message, '[[:space:]]+', ' ', 'g'), 140), left(message, 320), message,
          'topanice', COALESCE(image_url, attachment_url), COALESCE(image_url, attachment_url), 'Kontribut i komunitetit', 'manual', FALSE, 'draft' FROM approved
        RETURNING id`,
        [data.id, `kontribut-topanice-${randomUUID()}`],
      );
      if (!rows.length) throw new Error("Kontributi nuk është më në pritje.");
      notice = "converted";
    } else if (action === "submission-convert-photo") {
      const data = submissionConvertSchema.parse(values);
      const subRows = await query<{ sender_name: string; message: string; attachment_url: string | null; image_url: string | null; image_urls: string[] | null }>(
        "SELECT sender_name, message, attachment_url, image_url, image_urls FROM submissions WHERE id=$1 AND status='pending' LIMIT 1",
        [data.id],
      );
      const sub = subRows[0];
      if (!sub) throw new Error("Kontributi nuk është më në pritje.");
      const urls = new Set<string>();
      if (Array.isArray(sub.image_urls)) {
        for (const u of sub.image_urls) {
          if (typeof u === "string" && u.trim()) urls.add(u.trim());
        }
      }
      if (sub.image_url?.trim()) urls.add(sub.image_url.trim());
      if (sub.attachment_url?.trim()) urls.add(sub.attachment_url.trim());
      if (!urls.size) throw new Error("Ky kontribut nuk ka një fotografi.");

      const title = sub.message.replace(/\s+/g, " ").trim().slice(0, 240) || "Pamje nga Topanica";
      const credit = sub.sender_name.slice(0, 500);
      for (const photoUrl of urls) {
        await query(
          "INSERT INTO gallery_photos (title,category,image_url,credit) VALUES ($1,'fshati',$2,$3)",
          [title, photoUrl, credit],
        );
      }
      await query("UPDATE submissions SET status='approved' WHERE id=$1 AND status='pending'", [data.id]);
      notice = "converted";
    } else if (action === "submission-convert-history") {
      const data = submissionConvertSchema.parse(values);
      const rows = await query<{ id: number }>(
        `WITH approved AS (
          UPDATE submissions SET status='approved' WHERE id=$1 AND status='pending'
          RETURNING sender_name, message, attachment_url, image_url
        )
        INSERT INTO history_entries (era_year,title,content,source_citation,image_url,sort_order)
        SELECT 'Kujtesë', left(regexp_replace(message, '[[:space:]]+', ' ', 'g'), 120), message,
          'Dërguar nga ' || sender_name, COALESCE(image_url, attachment_url), 100 FROM approved
        RETURNING id`,
        [data.id],
      );
      if (!rows.length) throw new Error("Kontributi nuk është më në pritje.");
      notice = "converted";
    } else if (action === "delete") {
      const data = deleteSchema.parse(values);
      const table = data.entity === "article" ? "articles" : data.entity === "history" ? "history_entries" : "gallery_photos";
      await query(`DELETE FROM ${table} WHERE id=$1`, [data.id]);
      notice = "deleted";
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin action failed:", error);
    return NextResponse.json({ error: error instanceof z.ZodError ? "Ju lutemi kontrolloni fushat e plotësuara." : error instanceof Error ? error.message : "Nuk mund të ruhej ky ndryshim." }, { status: 400 });
  }

  const current = new URL(request.url);
  const referer = request.headers.get("referer");
  let returnTo: URL | null = null;
  if (referer) {
    try { returnTo = new URL(referer); } catch { returnTo = null; }
  }
  const destination = returnTo?.host === current.host ? returnTo : new URL("/admin?tab=news", request.url);
  if (action === "article-save") {
    destination.pathname = "/admin";
    destination.searchParams.set("tab", "news");
    destination.searchParams.delete("edit");
    const savedStatus = String(values.status || "");
    if (savedStatus === "published" || savedStatus === "draft") {
      destination.searchParams.set("status", savedStatus);
    }
  }
  destination.searchParams.set("notice", notice);
  return NextResponse.redirect(destination, 303);
}
