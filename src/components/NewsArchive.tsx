"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGroup, motion } from "framer-motion";
import type { Article } from "@/lib/models";
import { CATEGORY_LABELS, formatDate } from "@/lib/site";
import { Reveal } from "@/components/Motion";

const filters = [["all", "Të gjitha"], ["topanice", "Topanicë"], ["komuna", "Komuna"], ["zhvillim", "Zhvillim"], ["mergata", "Mërgata"]] as const;
export function NewsArchive({ articles }: { articles: Article[] }) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = useMemo(() => filter === "all" ? articles : articles.filter((a) => a.category === filter), [articles, filter]);
  return <>
    <LayoutGroup id="news-filters"><div className="filter-row" aria-label="Filtro lajmet">{filters.map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? "filter-button active" : "filter-button"} onClick={() => setFilter(value)}>{label}{filter === value && <motion.span className="filter-indicator" layoutId="news-filter-indicator" transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }} />}</button>)}</div></LayoutGroup>
    {filtered.length ? <div className="article-list">{filtered.map((article, index) => <Reveal key={article.id} delay={index % 4 * 0.045}><article className="article-row" >
      <div className="article-meta"><span>{CATEGORY_LABELS[article.category]}</span><time dateTime={article.published_at ?? article.created_at}>{formatDate(article.published_at ?? article.created_at)}</time></div>
      <div className="article-copy"><h2><Link href={`/lajme/${article.slug}`}>{article.title}</Link></h2><p>{article.summary}</p></div>
      <Link className="row-arrow" aria-label={`Lexo: ${article.title}`} href={`/lajme/${article.slug}`}>↗</Link>
    </article></Reveal>)}</div> : <p className="empty-note">Nuk ka lajme në këtë rubrikë.</p>}
  </>;
}
