import type { Metadata } from "next";
import NextLink from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getLocalizedArticleBySlug } from "@/lib/db/content";
import { formatDate, isValidArticleCover } from "@/lib/site";
import { ReadingProgress } from "@/components/ReadingProgress";
import { isAdmin } from "@/lib/auth";
import { buildArticleMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "News" });
  const a = await getLocalizedArticleBySlug(slug, locale);
  if (!a) {
    return { title: t("notFoundTitle"), robots: { index: false, follow: false } };
  }

  const rawCover = a.cover_url || a.image_url;
  const cover = isValidArticleCover(rawCover) ? rawCover : null;

  return buildArticleMetadata({
    locale,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    publishedTime: a.published_at ?? a.created_at,
    coverUrl: cover,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const [t, tCat, article, isAdministrator] = await Promise.all([
    getTranslations({ locale, namespace: "News" }),
    getTranslations({ locale, namespace: "Categories" }),
    getLocalizedArticleBySlug(slug, locale),
    isAdmin(),
  ]);

  if (!article) notFound();

  const rawCover = article.cover_url || article.image_url;
  const cover = isValidArticleCover(rawCover) ? rawCover : null;
  const sourceLabel =
    article.source_name || (article.source_type === "facebook_import" ? "Facebook" : t("sourceLabelDefault"));

  return (
    <>
      <ReadingProgress />
      <article className="article-page wrap">
        <div className="article-top-bar">
          <Link href="/lajme" className="back-link">
            {t("backToNews")}
          </Link>
          {isAdministrator && (
            <NextLink
              href={`/admin?tab=news&status=${article.status}&edit=${article.id}#article-form`}
              className="article-admin-edit-badge"
            >
              {t("editInPanel")}
            </NextLink>
          )}
        </div>

        <div className="article-page-meta">
          <span>{tCat(article.category)}</span>
          <time dateTime={article.published_at ?? article.created_at}>
            {formatDate(article.published_at ?? article.created_at, locale)}
          </time>
          {article.translation_missing && (
            <span className="translation-missing-pill">{t("originalLanguageBadge")}</span>
          )}
        </div>

        {article.translation_missing && (
          <aside className="translation-notice" role="note">
            <strong>{t("translationUnavailableTitle")}</strong>
            <p>{t("translationUnavailableNotice")}</p>
          </aside>
        )}

        <h1 lang={article.translation_missing ? "sq" : undefined}>{article.title}</h1>
        <p className="article-standfirst" lang={article.translation_missing ? "sq" : undefined}>
          {article.summary}
        </p>

        {cover && (
          <div className="article-cover-frame">
            <Image
              src={cover}
              alt={article.title}
              width={1200}
              height={675}
              sizes="(max-width: 920px) 100vw, 840px"
              unoptimized={cover.startsWith("http") || cover.startsWith("/api/")}
              className="article-cover-img"
              priority
            />
          </div>
        )}

        <div className="article-body" lang={article.translation_missing ? "sq" : undefined}>
          {article.body.split(/\n\s*\n/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {(article.source_type !== "manual" || article.source_name || article.source_url) && (
          <aside className="source-credit">
            <p>{t("sourceCreditLabel")}</p>
            <span>{sourceLabel}</span>
            {article.source_url ? (
              <a href={article.source_url} target="_blank" rel="noreferrer">
                {t("sourceCreditLink")} ↗
              </a>
            ) : (
              <span>{t("sourceCreditUnavailable")}</span>
            )}
          </aside>
        )}
      </article>
    </>
  );
}
