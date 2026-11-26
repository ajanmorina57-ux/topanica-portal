"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/models";
import { CATEGORY_LABELS, formatDate, isValidArticleCover } from "@/lib/site";

const filters = [
  ["all", "Të gjitha"],
  ["topanice", "Topanicë"],
  ["komuna", "Komuna"],
  ["zhvillim", "Zhvillim"],
  ["mergata", "Mërgata"],
] as const;

export function NewsArchive({ articles, isAdmin = false }: { articles: Article[]; isAdmin?: boolean }) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = useMemo(
    () => (filter === "all" ? articles : articles.filter((a) => a.category === filter)),
    [articles, filter],
  );

  return (
    <>
      <div className="filter-row" aria-label="Filtro lajmet">
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

            return (
              <article key={article.id} className="article-row">
                <div className="article-meta">
                  <span>{CATEGORY_LABELS[article.category]}</span>
                  <time dateTime={article.published_at ?? article.created_at}>
                    {formatDate(article.published_at ?? article.created_at)}
                  </time>
                </div>
                <div className="article-copy">
                  <h2>
                    <Link href={`/lajme/${article.slug}`}>{article.title}</Link>
                  </h2>
                  <p>{article.summary}</p>
                </div>
                <div className="article-row-end">
                  {cover && (
                    <Link
                      href={`/lajme/${article.slug}`}
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
                    <Link
                      className="news-admin-edit-link"
                      href={`/admin?tab=news&status=${article.status}&edit=${article.id}#article-form`}
                    >
                      Redakto
                    </Link>
                  )}
                  <Link className="row-arrow" aria-label={`Lexo: ${article.title}`} href={`/lajme/${article.slug}`}>
                    ↗
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-note">Nuk ka lajme në këtë rubrikë.</p>
      )}
    </>
  );
}
