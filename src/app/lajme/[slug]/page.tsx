import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { safeQuery } from "@/lib/db";
import type { Article } from "@/lib/models";
import { CATEGORY_LABELS, formatDate } from "@/lib/site";
import { ReadingProgress } from "@/components/Motion";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
async function getArticle(slug: string) { return (await safeQuery<Article>("SELECT * FROM articles WHERE slug=$1 AND status='published' LIMIT 1", [slug]))[0]; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const a = await getArticle(slug); return { title: a?.title ?? "Lajmi nuk u gjet", description: a?.summary }; }
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const article = await getArticle(slug); if (!article) notFound();
  const cover = article.cover_url || article.image_url;
  const isAdministrator = await isAdmin();
  return <><ReadingProgress /><article className="article-page wrap"><div className="article-top-bar"><Link href="/lajme" className="back-link">← Kthehu te lajmet</Link>{isAdministrator && <Link href={`/admin?tab=news&status=${article.status}&edit=${article.id}#article-form`} className="article-admin-edit-badge">Redakto në panel</Link>}</div><div className="article-page-meta"><span>{CATEGORY_LABELS[article.category]}</span><time>{formatDate(article.published_at ?? article.created_at)}</time></div><h1>{article.title}</h1><p className="article-standfirst">{article.summary}</p>{cover && <div className="article-cover-frame"><Image src={cover} alt={article.title} width={1200} height={675} unoptimized className="article-cover-img" priority /></div>}<div className="article-body">{article.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
    {(article.source_type !== "manual" || article.source_name || article.source_url) && <aside className="source-credit"><p>Burimi origjinal</p><span>{article.source_name || (article.source_type === "facebook_import" ? "Importim nga Facebook" : article.source_type === "tavily" ? "Tavily Search" : "RSS")}</span>{article.source_url ? <a href={article.source_url} target="_blank" rel="noreferrer">Lexo artikullin burimor ↗</a> : <span>Lidhja burimore nuk është regjistruar.</span>}</aside>}
  </article></>;
}
