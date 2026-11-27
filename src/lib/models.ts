export type Locale = "sq" | "en" | "de";
export type TranslationLocale = "en" | "de";

export const TRANSLATION_LOCALES: readonly TranslationLocale[] = ["en", "de"] as const;

export type Article = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: "topanice" | "komuna" | "zhvillim" | "mergata";
  cover_url: string | null;
  image_url?: string | null;
  source_name: string | null;
  source_url: string | null;
  is_auto_scraped: boolean;
  source_type: "rss" | "tavily" | "facebook_import" | "manual";
  status: "published" | "draft";
  published_at: string | null;
  created_at: string;
};

export type HistoryEntry = {
  id: number;
  era_year: string;
  title: string;
  content: string;
  image_url?: string | null;
  source_citation: string | null;
  sort_order: number;
};

export type GalleryPhoto = {
  id: number;
  title: string;
  category: "arkiv" | "natyre" | "fshati";
  image_url: string;
  year_taken: number | null;
  credit: string | null;
  created_at: string;
};

export type Submission = {
  id: number;
  sender_name: string;
  sender_contact: string | null;
  type: "histori" | "foto" | "lajm";
  message: string;
  attachment_url: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export type ArticleTranslation = {
  article_id?: number;
  locale?: TranslationLocale;
  title: string;
  summary: string;
  body: string;
  updated_at?: string;
};

export type HistoryEntryTranslation = {
  history_entry_id?: number;
  locale?: TranslationLocale;
  era_year: string;
  title: string;
  content: string;
  source_citation: string | null;
  updated_at?: string;
};

export type GalleryPhotoTranslation = {
  gallery_photo_id?: number;
  locale?: TranslationLocale;
  title: string;
  credit: string | null;
  updated_at?: string;
};

export type ArticleTranslationsMap = Partial<Record<TranslationLocale, ArticleTranslation>>;
export type HistoryEntryTranslationsMap = Partial<Record<TranslationLocale, HistoryEntryTranslation>>;
export type GalleryPhotoTranslationsMap = Partial<Record<TranslationLocale, GalleryPhotoTranslation>>;

export type LocalizedArticle = Article & {
  locale: Locale;
  translation_missing: boolean;
  translations?: ArticleTranslationsMap;
};

export type LocalizedHistoryEntry = HistoryEntry & {
  locale: Locale;
  translation_missing: boolean;
  translations?: HistoryEntryTranslationsMap;
};

export type LocalizedGalleryPhoto = GalleryPhoto & {
  locale: Locale;
  translation_missing: boolean;
  translations?: GalleryPhotoTranslationsMap;
};
