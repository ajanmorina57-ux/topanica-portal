import type { MetadataRoute } from "next";
import { safeQuery } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type SitemapArticleRow = {
  slug: string;
  published_at: string | null;
  created_at: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const articles = await safeQuery<SitemapArticleRow>(
    "SELECT slug, published_at, created_at FROM articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC",
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/lajme`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/historia`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/galeria`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/kontribuo`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/lajme/${article.slug}`,
    lastModified: new Date(article.published_at ?? article.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
