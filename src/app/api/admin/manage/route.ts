import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { slugify } from "@/lib/site";
import { z } from "zod";

const imageOrUrl = z.string().trim().max(2000).refine((val) => /^(https?:\/\/|\/)/i.test(val), "Duhet të jetë URL ose shteg lokal");
const httpUrl = z.string().url().max(2000).refine((value) => /^https?:\/\//i.test(value));
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
const formObject = (form: FormData) => Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === "string"));

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
      const status = data.status || "draft";
      const finalImage = data.image_url || data.cover_url || null;
      let rawDate: string | null = null;
      if (data.published_at && data.published_at.trim() !== "") {
        const parsedDate = new Date(data.published_at.trim());
        if (!Number.isNaN(parsedDate.getTime())) rawDate = parsedDate.toISOString();
      }
      if (data.id) {
        await query(
          "UPDATE articles SET title=$1,summary=$2,body=$3,category=$4,cover_url=$5,image_url=$5,source_name=$6,source_url=$7,source_type=$8,status=$9,published_at=COALESCE($10::timestamptz, CASE WHEN $9='published' THEN COALESCE(published_at, NOW()) ELSE published_at END) WHERE id=$11",
          [data.title, data.summary, data.body, data.category, finalImage, data.source_name || null, data.source_url || null, data.source_type, status, rawDate, data.id],
        );
      } else {
        const slug = `${slugify(data.title) || "lajm-topanica"}-${randomUUID()}`;
        await query(
          "INSERT INTO articles (slug,title,summary,body,category,cover_url,image_url,source_name,source_url,source_type,is_auto_scraped,status,published_at) VALUES ($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,FALSE,$10,COALESCE($11::timestamptz, CASE WHEN $10='published' THEN NOW() ELSE NULL END))",
          [slug, data.title, data.summary, data.body, data.category, finalImage, data.source_name || null, data.source_url || null, data.source_type, status, rawDate],
        );
      }
      notice = status === "published" ? "published" : "saved";
    } else if (action === "article-status") {
      const data = articleStatusSchema.parse(values);
      await query("UPDATE articles SET status=$1,published_at=CASE WHEN $1='published' THEN COALESCE(published_at,NOW()) ELSE NULL END WHERE id=$2", [data.status, data.id]);
      notice = data.status === "published" ? "published" : "saved";
    } else if (action === "history-save") {
      const data = historySchema.parse(values);
      const img = data.image_url || null;
      if (data.id) await query("UPDATE history_entries SET era_year=$1,title=$2,content=$3,source_citation=$4,sort_order=$5,image_url=$6 WHERE id=$7", [data.era_year, data.title, data.content, data.source_citation || null, data.sort_order, img, data.id]);
      else await query("INSERT INTO history_entries (era_year,title,content,source_citation,sort_order,image_url) VALUES ($1,$2,$3,$4,$5,$6)", [data.era_year, data.title, data.content, data.source_citation || null, data.sort_order, img]);
    } else if (action === "photo-save") {
      const data = photoSchema.parse(values);
      const year = data.year_taken === "" ? null : data.year_taken;
      if (data.id) await query("UPDATE gallery_photos SET title=$1,category=$2,image_url=$3,year_taken=$4,credit=$5 WHERE id=$6", [data.title, data.category, data.image_url, year, data.credit || null, data.id]);
      else await query("INSERT INTO gallery_photos (title,category,image_url,year_taken,credit) VALUES ($1,$2,$3,$4,$5)", [data.title, data.category, data.image_url, year, data.credit || null]);
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
