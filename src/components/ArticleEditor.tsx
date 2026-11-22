"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { Article } from "@/lib/models";
import type { ImportedArticle } from "@/components/AdminImporter";
import { CATEGORY_LABELS, CATEGORIES } from "@/lib/site";

type Draft = {
  id?: number;
  title: string;
  summary: string;
  body: string;
  category: Article["category"];
  cover_url: string;
  source_name: string;
  source_url: string;
  source_type: Article["source_type"];
  status: Article["status"];
};

function fromArticle(article?: Article): Draft {
  return {
    id: article?.id,
    title: article?.title || "",
    summary: article?.summary || "",
    body: article?.body || "",
    category: article?.category || "topanice",
    cover_url: article?.cover_url || "",
    source_name: article?.source_name || "",
    source_url: article?.source_url || "",
    source_type: article?.source_type || "manual",
    status: article?.status || "draft",
  };
}

export function ArticleEditor({ article }: { article?: Article }) {
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState(() => fromArticle(article));
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const onImport = (event: Event) => {
      const next = (event as CustomEvent<ImportedArticle>).detail;
      setDraft((current) => ({ ...current, ...next, id: undefined, cover_url: "", status: "draft" }));
      setImported(true);
      document.getElementById("article-form")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };
    window.addEventListener("topanica:article-import", onImport);
    return () => window.removeEventListener("topanica:article-import", onImport);
  }, [reduce]);

  const update = <K extends keyof Draft>(field: K, value: Draft[K]) => setDraft((current) => ({ ...current, [field]: value }));
  return <section className="admin-form-block article-editor" id="article-form" aria-labelledby="article-editor-title">
    <div className="admin-section-heading editor-heading"><div><p className="section-kicker">Redaktimi i përmbajtjes</p><h3 id="article-editor-title">{draft.id ? "Redakto artikullin" : "Artikull i ri"}</h3></div>{imported && <span className="editor-source">U përgatit me AI · draft</span>}</div>
    <form action="/api/admin/manage" method="post" className="admin-form">
      <input type="hidden" name="action" value="article-save" />
      {draft.id && <input type="hidden" name="id" value={draft.id} />}
      <input type="hidden" name="source_type" value={draft.source_type} />
      <label className="wide-field">Titulli<input required name="title" minLength={5} maxLength={240} value={draft.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label>Kategoria<select name="category" value={draft.category} onChange={(event) => update("category", event.target.value as Draft["category"])}>{CATEGORIES.map((category) => <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>)}</select></label>
      <label>Statusi<select name="status" value={draft.status} onChange={(event) => update("status", event.target.value as Draft["status"])}><option value="draft">Draft</option><option value="published">Publiko</option></select></label>
      <label className="wide-field">Përmbledhja<textarea required name="summary" minLength={20} rows={3} value={draft.summary} onChange={(event) => update("summary", event.target.value)} /></label>
      <label className="wide-field">Teksti (ndarje paragrafësh me rresht bosh)<textarea required name="body" minLength={30} rows={8} value={draft.body} onChange={(event) => update("body", event.target.value)} /></label>
      <label>URL e kopertinës<input type="url" name="cover_url" value={draft.cover_url} onChange={(event) => update("cover_url", event.target.value)} /></label>
      <label>Emri i burimit<input name="source_name" value={draft.source_name} onChange={(event) => update("source_name", event.target.value)} /></label>
      <label className="wide-field">URL e burimit<input type="url" name="source_url" value={draft.source_url} onChange={(event) => update("source_url", event.target.value)} /></label>
      <div className="editor-actions"><button className="button button-dark" type="submit">{draft.status === "published" ? "Ruaj dhe publiko" : "Ruaj si draft"}</button>{draft.id && <a className="text-link" href="/admin?tab=news">Anulo redaktimin</a>}</div>
    </form>
  </section>;
}
