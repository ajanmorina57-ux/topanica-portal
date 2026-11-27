import type { MetadataRoute } from "next";
import { safeQuery } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { getLanguageAlternates, getLocalizedPath, type StaticRouteKey } from "@/lib/seo";

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
  { route: "/", changeFrequency: "daily", priority: (locale) => (locale === "sq" ? 1 : 0.9) },
  { route: "/lajme", changeFrequency: "daily", priority: 0.9 },
  { route: "/historia", changeFrequency: "monthly", priority: 0.8 },
  { route: "/galeria", changeFrequency: "weekly", priority: 0.8 },
  { route: "/kontribuo", changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const articles = await safeQuery<SitemapArticleRow>(
    "SELECT slug, published_at, created_at FROM articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC",
  );

  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTE_CONFIG.flatMap(
    ({ route, changeFrequency, priority }) => {
      const languages = getLanguageAlternates(route, { absolute: true });
      return routing.locales.map((locale) => ({
        url: `${siteUrl}${getLocalizedPath(locale, route)}`,
        changeFrequency,
        priority: typeof priority === "function" ? priority(locale) : priority,
        alternates: { languages },
      }));
    },
  );

  const articleRoutes: MetadataRoute.Sitemap = articles.flatMap((article) => {
    const languages = getLanguageAlternates("/lajme", {
      slug: article.slug,
      absolute: true,
    });
    const lastModified = new Date(article.published_at ?? article.created_at);

    return routing.locales.map((locale) => ({
      url: `${siteUrl}${getLocalizedPath(locale, "/lajme", article.slug)}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages },
    }));
  });

  return [...staticRoutes, ...articleRoutes];
}
