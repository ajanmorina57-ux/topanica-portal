export type Article = {
  id: number; slug: string; title: string; summary: string; body: string; category: "topanice" | "komuna" | "zhvillim" | "mergata";
  cover_url: string | null; image_url?: string | null; source_name: string | null; source_url: string | null; is_auto_scraped: boolean;
  source_type: "rss" | "tavily" | "facebook_import" | "manual";
  status: "published" | "draft"; published_at: string | null; created_at: string;
};
export type HistoryEntry = { id: number; era_year: string; title: string; content: string; image_url?: string | null; source_citation: string | null; sort_order: number };
export type GalleryPhoto = { id: number; title: string; category: "arkiv" | "natyre" | "fshati"; image_url: string; year_taken: number | null; credit: string | null; created_at: string };
export type Submission = { id: number; sender_name: string; sender_contact: string | null; type: "histori" | "foto" | "lajm"; message: string; attachment_url: string | null; image_url?: string | null; image_urls?: string[] | null; status: "pending" | "approved" | "rejected"; created_at: string };
