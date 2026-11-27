import { cache } from "react";
import { safeQuery } from "@/lib/db";
import type {
  Article,
  ArticleTranslation,
  ArticleTranslationsMap,
  GalleryPhoto,
  GalleryPhotoTranslation,
  GalleryPhotoTranslationsMap,
  HistoryEntry,
  HistoryEntryTranslation,
  HistoryEntryTranslationsMap,
  Locale,
  LocalizedArticle,
  LocalizedGalleryPhoto,
  LocalizedHistoryEntry,
  TranslationLocale,
} from "@/lib/models";

function isTranslationLocale(locale: Locale): locale is TranslationLocale {
  return locale === "en" || locale === "de";
}

function groupTranslationsById<
  T extends { locale: TranslationLocale },
  K extends keyof T,
>(rows: T[], idKey: K): Map<number, Partial<Record<TranslationLocale, T>>> {
  const map = new Map<number, Partial<Record<TranslationLocale, T>>>();
  for (const row of rows) {
    const entityId = Number(row[idKey]);
    if (!Number.isInteger(entityId) || entityId <= 0) continue;
    const existing = map.get(entityId) ?? {};
    existing[row.locale] = row;
    map.set(entityId, existing);
  }
  return map;
}

export async function getLocalizedArticles(
  locale: Locale,
  options: {
    status?: "published" | "draft" | "all";
    category?: Article["category"];
    limit?: number;
  } = {},
): Promise<LocalizedArticle[]> {
  const status = options.status ?? "published";
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (isTranslationLocale(locale)) {
    params.push(locale);
  }
  const localeParam = isTranslationLocale(locale) ? `$${params.length}` : null;

  if (status !== "all") {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  }
  if (options.category) {
    params.push(options.category);
    conditions.push(`a.category = $${params.length}`);
  }

  let limitClause = "";
  if (typeof options.limit === "number" && Number.isInteger(options.limit) && options.limit > 0) {
    params.push(options.limit);
    limitClause = ` LIMIT $${params.length}`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  if (!localeParam) {
    const rows = await safeQuery<Article>(
      `SELECT a.*
       FROM articles a
       ${whereClause}
       ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC${limitClause}`,
      params,
    );
    return rows.map((row) => ({
      ...row,
      locale: "sq",
      translation_missing: false,
    }));
  }

  const rows = await safeQuery<Omit<LocalizedArticle, "locale">>(
    `SELECT
       a.id,
       a.slug,
       COALESCE(t.title, a.title) AS title,
       COALESCE(t.summary, a.summary) AS summary,
       COALESCE(t.body, a.body) AS body,
       a.category,
       a.cover_url,
       a.image_url,
       a.source_name,
       a.source_url,
       a.is_auto_scraped,
       a.source_type,
       a.status,
       a.published_at,
       a.created_at,
       (t.article_id IS NULL) AS translation_missing
     FROM articles a
     LEFT JOIN article_translations t
       ON t.article_id = a.id AND t.locale = ${localeParam}
     ${whereClause}
     ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC${limitClause}`,
    params,
  );

  return rows.map((row) => ({
    ...row,
    locale,
    translation_missing: Boolean(row.translation_missing),
  }));
}

export const getLocalizedArticleBySlug = cache(async (
  slug: string,
  locale: Locale,
): Promise<LocalizedArticle | null> => {
  if (!slug) return null;

  if (!isTranslationLocale(locale)) {
    const rows = await safeQuery<Article>(
      "SELECT * FROM articles WHERE slug = $1 AND status = 'published' LIMIT 1",
      [slug],
    );
    const article = rows[0];
    if (!article) return null;
    return {
      ...article,
      locale: "sq",
      translation_missing: false,
    };
  }

  const rows = await safeQuery<Omit<LocalizedArticle, "locale">>(
    `SELECT
       a.id,
       a.slug,
       COALESCE(t.title, a.title) AS title,
       COALESCE(t.summary, a.summary) AS summary,
       COALESCE(t.body, a.body) AS body,
       a.category,
       a.cover_url,
       a.image_url,
       a.source_name,
       a.source_url,
       a.is_auto_scraped,
       a.source_type,
       a.status,
       a.published_at,
       a.created_at,
       (t.article_id IS NULL) AS translation_missing
     FROM articles a
     LEFT JOIN article_translations t
       ON t.article_id = a.id AND t.locale = $2
     WHERE a.slug = $1 AND a.status = 'published'
     LIMIT 1`,
    [slug, locale],
  );

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    locale,
    translation_missing: Boolean(row.translation_missing),
  };
});

export async function getLocalizedHistoryEntries(
  locale: Locale,
  options: { title?: string; limit?: number } = {},
): Promise<LocalizedHistoryEntry[]> {
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (isTranslationLocale(locale)) {
    params.push(locale);
  }
  const localeParam = isTranslationLocale(locale) ? `$${params.length}` : null;

  if (options.title) {
    params.push(options.title);
    conditions.push(`h.title = $${params.length}`);
  }

  let limitClause = "";
  if (typeof options.limit === "number" && Number.isInteger(options.limit) && options.limit > 0) {
    params.push(options.limit);
    limitClause = ` LIMIT $${params.length}`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  if (!localeParam) {
    const rows = await safeQuery<HistoryEntry>(
      `SELECT h.*
       FROM history_entries h
       ${whereClause}
       ORDER BY h.sort_order ASC, h.id ASC${limitClause}`,
      params,
    );
    return rows.map((row) => ({
      ...row,
      locale: "sq",
      translation_missing: false,
    }));
  }

  const rows = await safeQuery<Omit<LocalizedHistoryEntry, "locale">>(
    `SELECT
       h.id,
       COALESCE(t.era_year, h.era_year) AS era_year,
       COALESCE(t.title, h.title) AS title,
       COALESCE(t.content, h.content) AS content,
       h.image_url,
       CASE
         WHEN t.history_entry_id IS NOT NULL THEN COALESCE(NULLIF(t.source_citation, ''), h.source_citation)
         ELSE h.source_citation
       END AS source_citation,
       h.sort_order,
       (t.history_entry_id IS NULL) AS translation_missing
     FROM history_entries h
     LEFT JOIN history_entry_translations t
       ON t.history_entry_id = h.id AND t.locale = ${localeParam}
     ${whereClause}
     ORDER BY h.sort_order ASC, h.id ASC${limitClause}`,
    params,
  );

  return rows.map((row) => ({
    ...row,
    locale,
    translation_missing: Boolean(row.translation_missing),
  }));
}

export async function getLocalizedGalleryPhotos(
  locale: Locale,
  options: { homeOrder?: boolean; limit?: number } = {},
): Promise<LocalizedGalleryPhoto[]> {
  const params: unknown[] = [];

  if (isTranslationLocale(locale)) {
    params.push(locale);
  }
  const localeParam = isTranslationLocale(locale) ? `$${params.length}` : null;

  let limitClause = "";
  if (typeof options.limit === "number" && Number.isInteger(options.limit) && options.limit > 0) {
    params.push(options.limit);
    limitClause = ` LIMIT $${params.length}`;
  }

  const orderClause = options.homeOrder
    ? "ORDER BY CASE g.category WHEN 'natyre' THEN 0 WHEN 'fshati' THEN 1 ELSE 2 END, g.year_taken DESC NULLS LAST, g.created_at DESC"
    : "ORDER BY g.year_taken DESC NULLS LAST, g.created_at DESC";

  if (!localeParam) {
    const rows = await safeQuery<GalleryPhoto>(
      `SELECT g.*
       FROM gallery_photos g
       ${orderClause}${limitClause}`,
      params,
    );
    return rows.map((row) => ({
      ...row,
      locale: "sq",
      translation_missing: false,
    }));
  }

  const rows = await safeQuery<Omit<LocalizedGalleryPhoto, "locale">>(
    `SELECT
       g.id,
       COALESCE(t.title, g.title) AS title,
       g.category,
       g.image_url,
       g.year_taken,
       CASE
         WHEN t.gallery_photo_id IS NOT NULL THEN COALESCE(NULLIF(t.credit, ''), g.credit)
         ELSE g.credit
       END AS credit,
       g.created_at,
       (t.gallery_photo_id IS NULL) AS translation_missing
     FROM gallery_photos g
     LEFT JOIN gallery_photo_translations t
       ON t.gallery_photo_id = g.id AND t.locale = ${localeParam}
     ${orderClause}${limitClause}`,
    params,
  );

  return rows.map((row) => ({
    ...row,
    locale,
    translation_missing: Boolean(row.translation_missing),
  }));
}

type ArticleTranslationRow = ArticleTranslation & { article_id: number; locale: TranslationLocale };
type HistoryTranslationRow = HistoryEntryTranslation & { history_entry_id: number; locale: TranslationLocale };
type GalleryTranslationRow = GalleryPhotoTranslation & { gallery_photo_id: number; locale: TranslationLocale };

export async function getAdminArticleByIdWithTranslations(id: number): Promise<LocalizedArticle | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const [articles, translationRows] = await Promise.all([
    safeQuery<Article>("SELECT * FROM articles WHERE id = $1 LIMIT 1", [id]),
    safeQuery<ArticleTranslationRow>(
      "SELECT article_id, locale, title, summary, body, updated_at FROM article_translations WHERE article_id = $1",
      [id],
    ),
  ]);
  const article = articles[0];
  if (!article) return null;
  const translations: ArticleTranslationsMap = {};
  for (const row of translationRows) {
    translations[row.locale] = row;
  }
  return {
    ...article,
    locale: "sq",
    translation_missing: false,
    translations,
  };
}

export async function getAdminContentWithTranslations(): Promise<{
  articles: LocalizedArticle[];
  history: LocalizedHistoryEntry[];
  photos: LocalizedGalleryPhoto[];
}> {
  const [articles, articleTranslations, history, historyTranslations, photos, photoTranslations] =
    await Promise.all([
      safeQuery<Article>(
        "SELECT * FROM articles ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 500",
      ),
      safeQuery<ArticleTranslationRow>(
        "SELECT article_id, locale, title, summary, body, updated_at FROM article_translations",
      ),
      safeQuery<HistoryEntry>("SELECT * FROM history_entries ORDER BY sort_order ASC, id ASC"),
      safeQuery<HistoryTranslationRow>(
        "SELECT history_entry_id, locale, era_year, title, content, source_citation, updated_at FROM history_entry_translations",
      ),
      safeQuery<GalleryPhoto>("SELECT * FROM gallery_photos ORDER BY created_at DESC"),
      safeQuery<GalleryTranslationRow>(
        "SELECT gallery_photo_id, locale, title, credit, updated_at FROM gallery_photo_translations",
      ),
    ]);

  const articleMap = groupTranslationsById(articleTranslations, "article_id");
  const historyMap = groupTranslationsById(historyTranslations, "history_entry_id");
  const photoMap = groupTranslationsById(photoTranslations, "gallery_photo_id");

  return {
    articles: articles.map((article) => ({
      ...article,
      locale: "sq",
      translation_missing: false,
      translations: (articleMap.get(article.id) ?? {}) as ArticleTranslationsMap,
    })),
    history: history.map((entry) => ({
      ...entry,
      locale: "sq",
      translation_missing: false,
      translations: (historyMap.get(entry.id) ?? {}) as HistoryEntryTranslationsMap,
    })),
    photos: photos.map((photo) => ({
      ...photo,
      locale: "sq",
      translation_missing: false,
      translations: (photoMap.get(photo.id) ?? {}) as GalleryPhotoTranslationsMap,
    })),
  };
}
