import type { MetadataRoute } from "next";
import { safeQuery } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { getLanguageAlternates, getLocalizedPath, type StaticRouteKey } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SitemapArticleRow = {
  slug: string;
};

const STATIC_ROUTE_CONFIG: Array<{
  route: StaticRouteKey;
}> = [
  { route: "/" },
  { route: "/lajme" },
  { route: "/historia" },
  { route: "/galeria" },
  { route: "/kontribuo" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const articles = await safeQuery<SitemapArticleRow>(
    "SELECT slug FROM articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC",
  );

  // Next.js 15's MetadataRoute.Sitemap serializer emits <xhtml:link> before <lastmod>,
  // <changefreq>, and <priority>, which violates sitemap.xsd's <xsd:sequence> when both
  // alternates and trailing fields are present. Keep only url + alternates so the XML
  // passes strict sitemap.xsd validation while preserving all localized and article URLs.
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTE_CONFIG.flatMap(({ route }) => {
    const languages = getLanguageAlternates(route, { includeXDefault: true, absolute: true });
    return routing.locales.map((locale) => ({
      url: `${siteUrl}${getLocalizedPath(locale, route)}`,
      alternates: { languages },
    }));
  });

  const articleRoutes: MetadataRoute.Sitemap = articles.flatMap((article) => {
    const languages = getLanguageAlternates("/lajme", {
      slug: article.slug,
      includeXDefault: true,
      absolute: true,
    });

    return routing.locales.map((locale) => ({
      url: `${siteUrl}${getLocalizedPath(locale, "/lajme", article.slug)}`,
      alternates: { languages },
    }));
  });

  return [...staticRoutes, ...articleRoutes];
}
