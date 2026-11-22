import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { safeQuery } from "@/lib/db";
import type { Article } from "@/lib/models";
import { CATEGORY_LABELS, formatDate } from "@/lib/site";
import { ReadingProgress } from "@/components/Motion";

export const dynamic = "force-dynamic";
async function getArticle(slug: string) { return (await safeQuery<Article>("SELECT * FROM articles WHERE slug=$1 AND status='published' LIMIT 1", [slug]))[0]; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const a = await getArticle(slug); return { title: a?.title ?? "Lajmi nuk u gjet", description: a?.summary }; }
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const article = await getArticle(slug); if (!article) notFound();
  return <><ReadingProgress /><article className="article-page wrap"><Link href="/lajme" className="back-link">← Kthehu te lajmet</Link><div className="article-page-meta"><span>{CATEGORY_LABELS[article.category]}</span><time>{formatDate(article.published_at ?? article.created_at)}</time></div><h1>{article.title}</h1><p className="article-standfirst">{article.summary}</p><div className="article-body">{article.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
    {(article.source_type !== "manual" || article.source_name || article.source_url) && <aside className="source-credit"><p>Burimi origjinal</p><span>{article.source_name || (article.source_type === "facebook_import" ? "Importim nga Facebook" : article.source_type === "tavily" ? "Tavily Search" : "RSS")}</span>{article.source_url ? <a href={article.source_url} target="_blank" rel="noreferrer">Lexo artikullin burimor ↗</a> : <span>Lidhja burimore nuk është regjistruar.</span>}</aside>}
  </article></>;
}
