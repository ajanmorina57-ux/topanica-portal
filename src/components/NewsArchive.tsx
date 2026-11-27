"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Article, Locale } from "@/lib/models";
import { CATEGORIES, formatDate, isValidArticleCover } from "@/lib/site";

type ArticleItem = Article & { translation_missing?: boolean };

export function NewsArchive({ articles, isAdmin = false }: { articles: ArticleItem[]; isAdmin?: boolean }) {
  const locale = useLocale() as Locale;
  const tCat = useTranslations("Categories");
  const tNews = useTranslations("News");
  const [filter, setFilter] = useState<string>("all");
  const filtered = useMemo(
    () => (filter === "all" ? articles : articles.filter((a) => a.category === filter)),
    [articles, filter],
  );

  const filters = useMemo(
    () =>
      [
        ["all", tNews("filterAll")],
        ...CATEGORIES.map((category) => [category, tCat(category)] as const),
      ] as const,
    [tCat, tNews],
  );

  return (
    <>
      <div className="filter-row" aria-label={tNews("filterAria")}>
        {filters.map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            className={filter === value ? "filter-button active" : "filter-button"}
            onClick={() => setFilter(value)}
          >
            {label}
            {filter === value && <span className="filter-indicator" aria-hidden="true" />}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="article-list">
          {filtered.map((article) => {
            const rawCover = article.cover_url || article.image_url;
            const cover = isValidArticleCover(rawCover) ? rawCover : null;
            const articleHref = { pathname: "/lajme/[slug]", params: { slug: article.slug } } as const;

            return (
              <article key={article.id} className="article-row">
                <div className="article-meta">
                  <span>{tCat(article.category)}</span>
                  <time dateTime={article.published_at ?? article.created_at}>
                    {formatDate(article.published_at ?? article.created_at, locale)}
                  </time>
                  {article.translation_missing && (
                    <span className="translation-missing-pill">{tNews("originalLanguageBadge")}</span>
                  )}
                </div>
                <div className="article-copy" lang={article.translation_missing ? "sq" : undefined}>
                  <h2>
                    <Link href={articleHref}>{article.title}</Link>
                  </h2>
                  <p>{article.summary}</p>
                </div>
                <div className="article-row-end">
                  {cover && (
                    <Link
                      href={articleHref}
                      className="article-thumbnail-frame"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <Image
                        src={cover}
                        alt=""
                        width={256}
                        height={144}
                        sizes="128px"
                        className="article-thumbnail-img"
                        unoptimized={cover.startsWith("http") || cover.startsWith("/api/")}
                      />
                    </Link>
                  )}
                  {isAdmin && (
                    <NextLink
                      className="news-admin-edit-link"
                      href={`/admin?tab=news&status=${article.status}&edit=${article.id}#article-form`}
                    >
                      {tNews("editShort")}
                    </NextLink>
                  )}
                  <Link
                    className="row-arrow"
                    aria-label={tNews("readArticleAria", { title: article.title })}
                    href={articleHref}
                  >
                    ↗
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-note">{tNews("emptyCategory")}</p>
      )}
    </>
  );
}
