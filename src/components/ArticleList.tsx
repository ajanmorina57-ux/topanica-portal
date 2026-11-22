import Link from "next/link";
import type { Article } from "@/lib/models";
import { CATEGORY_LABELS, formatDate } from "@/lib/site";
import { Reveal } from "@/components/Motion";

export function ArticleList({ articles }: { articles: Article[] }) {
  if (!articles.length) return <p className="empty-note">Nuk ka ende lajme të publikuara. Njoftimet e reja do të shfaqen këtu.</p>;
  return <div className="article-list">{articles.map((article, index) => <Reveal key={article.id} delay={index * 0.055}><article className="article-row">
    <div className="article-meta"><span>{CATEGORY_LABELS[article.category]}</span><time dateTime={article.published_at ?? article.created_at}>{formatDate(article.published_at ?? article.created_at)}</time></div>
    <div className="article-copy"><h3><Link href={`/lajme/${article.slug}`}>{article.title}</Link></h3><p>{article.summary}</p></div>
    <Link className="row-arrow" aria-label={`Lexo: ${article.title}`} href={`/lajme/${article.slug}`}>↗</Link>
  </article></Reveal>)}</div>;
}
