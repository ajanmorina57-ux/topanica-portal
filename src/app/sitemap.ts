import type { MetadataRoute } from "next";
import { safeQuery } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { getLocalizedPath, type StaticRouteKey } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SitemapArticleRow = {
  slug: string;
  published_at: string | null;
  created_at: string;
};

const STATIC_ROUTE_CONFIG: Array<{
  route: StaticRouteKey;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number | ((locale: (typeof routing.locales)[number]) => number);
}> = [
  { route: "/", changeFrequency: "daily", priority: (locale) => (locale === "sq" ? 1.0 : 0.9) },
  { route: "/lajme", changeFrequency: "daily", priority: 0.9 },
  { route: "/historia", changeFrequency: "weekly", priority: 0.8 },
  { route: "/galeria", changeFrequency: "weekly", priority: 0.8 },
  { route: "/kontribuo", changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const articles = await safeQuery<SitemapArticleRow>(
    "SELECT slug, published_at, created_at FROM articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 16000",
  );

  // Next.js 15 MetadataRoute.Sitemap emits <xhtml:link> before <lastmod>/<changefreq>/<priority>,
  // which violates sitemap.xsd <xsd:sequence> ordering. Keep hreflang links in HTML <head>
  // and HTTP Link headers, and emit clean standard <url> entries here so sitemap.xml passes
  // strict sitemap.xsd validation with lastModified, changeFrequency, and priority intact.
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTE_CONFIG.flatMap(
    ({ route, changeFrequency, priority }) =>
      routing.locales.map((locale) => ({
        url: `${siteUrl}${getLocalizedPath(locale, route)}`,
        changeFrequency,
        priority: typeof priority === "function" ? priority(locale) : priority,
      })),
  );

  const seenUrls = new Set(staticRoutes.map((entry) => entry.url));
  const articleRoutes: MetadataRoute.Sitemap = [];

  for (const article of articles) {
    const cleanSlug = article.slug?.trim();
    if (!cleanSlug) continue;

    const rawDate = article.published_at ?? article.created_at;
    const parsedDate = rawDate ? new Date(rawDate) : null;
    const lastModified =
      parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;

    for (const locale of routing.locales) {
      const url = `${siteUrl}${getLocalizedPath(locale, "/lajme", encodeURIComponent(cleanSlug))}`;
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      articleRoutes.push({
        url,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return [...staticRoutes, ...articleRoutes];
}
