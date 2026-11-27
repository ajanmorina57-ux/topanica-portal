import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/models";
import { getSiteUrl } from "@/lib/site";

export type StaticRouteKey = "/" | "/lajme" | "/historia" | "/galeria" | "/kontribuo";

export const OG_LOCALES: Record<Locale, string> = {
  sq: "sq_XK",
  en: "en_US",
  de: "de_DE",
};

export const DEFAULT_OG_IMAGE = {
  url: "/gallery/topanica-35.webp",
  width: 604,
  height: 453,
} as const;

export function getAlternateOgLocales(locale: Locale): string[] {
  return routing.locales.filter((candidate) => candidate !== locale).map((candidate) => OG_LOCALES[candidate]);
}

export function getLocalizedPath(locale: Locale, route: StaticRouteKey, slug?: string): string {
  if (route === "/") {
    return `/${locale}`;
  }
  const base = `/${locale}${routing.pathnames[route][locale]}`;
  return slug ? `${base}/${slug}` : base;
}

export function getLanguageAlternates(
  route: StaticRouteKey,
  options?: { slug?: string; includeXDefault?: boolean; absolute?: boolean },
) {
  const base = options?.absolute ? getSiteUrl() : "";
  const sqUrl = `${base}${getLocalizedPath("sq", route, options?.slug)}`;
  const enUrl = `${base}${getLocalizedPath("en", route, options?.slug)}`;
  const deUrl = `${base}${getLocalizedPath("de", route, options?.slug)}`;

  return {
    sq: sqUrl,
    en: enUrl,
    de: deUrl,
    ...(options?.includeXDefault ? { "x-default": sqUrl } : {}),
  };
}

type PageMetadataInput = {
  locale: Locale;
  route: StaticRouteKey;
  title: string;
  description: string;
  /** Use true for the locale root page so `<title>` stays exact without duplicating the layout template. */
  isHome?: boolean;
};

export async function buildPageMetadata({
  locale,
  route,
  title,
  description,
  isHome = false,
}: PageMetadataInput): Promise<Metadata> {
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const canonical = getLocalizedPath(locale, route);
  const socialTitle = isHome ? title : tMeta("titleTemplate").replace("%s", title);
  const ogAlt = tMeta("ogAlt");

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: getLanguageAlternates(route, { includeXDefault: true }),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALES[locale],
      alternateLocale: getAlternateOgLocales(locale),
      siteName: "Topanica",
      url: canonical,
      title: socialTitle,
      description,
      images: [{ ...DEFAULT_OG_IMAGE, alt: ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: DEFAULT_OG_IMAGE.url, alt: ogAlt }],
    },
  };
}

type ArticleMetadataInput = {
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  publishedTime: string;
  coverUrl?: string | null;
};

export async function buildArticleMetadata({
  locale,
  slug,
  title,
  summary,
  publishedTime,
  coverUrl,
}: ArticleMetadataInput): Promise<Metadata> {
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  const canonical = getLocalizedPath(locale, "/lajme", slug);
  const ogAlt = tMeta("ogAlt");
  const ogImages = coverUrl
    ? [{ url: coverUrl, alt: title }]
    : [{ ...DEFAULT_OG_IMAGE, alt: ogAlt }];
  const twitterImages = coverUrl
    ? [{ url: coverUrl, alt: title }]
    : [{ url: DEFAULT_OG_IMAGE.url, alt: ogAlt }];

  return {
    title,
    description: summary,
    alternates: {
      canonical,
      languages: getLanguageAlternates("/lajme", { slug, includeXDefault: true }),
    },
    openGraph: {
      type: "article",
      locale: OG_LOCALES[locale],
      alternateLocale: getAlternateOgLocales(locale),
      siteName: "Topanica",
      url: canonical,
      title,
      description: summary,
      publishedTime,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      images: twitterImages,
    },
  };
}
