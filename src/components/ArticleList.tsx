import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Article, Locale } from "@/lib/models";
import { formatDate, isValidArticleCover } from "@/lib/site";

type ArticleItem = Article & { translation_missing?: boolean };

export function ArticleList({ articles }: { articles: ArticleItem[] }) {
  const locale = useLocale() as Locale;
  const tCat = useTranslations("Categories");
  const tNews = useTranslations("News");

  if (!articles.length) {
    return <p className="empty-note">{tNews("emptyList")}</p>;
  }

  return (
    <div className="article-list">
      {articles.map((article) => {
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
              <h3>
                <Link href={articleHref}>{article.title}</Link>
              </h3>
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
  );
}
