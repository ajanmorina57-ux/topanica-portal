"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { Article } from "@/lib/models";
import type { ImportedArticle } from "@/components/AdminImporter";
import { CATEGORY_LABELS, CATEGORIES } from "@/lib/site";
import { PhotoDropzone } from "@/components/PhotoDropzone";

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
  published_at: string;
};

function fromArticle(article?: Article): Draft {
  const initialDate = article?.published_at || article?.created_at;
  const dateFormatted = initialDate ? new Date(initialDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: article?.id,
    title: article?.title || "",
    summary: article?.summary || "",
    body: article?.body || "",
    category: article?.category || "topanice",
    cover_url: article?.cover_url || article?.image_url || "",
    source_name: article?.source_name || "",
    source_url: article?.source_url || "",
    source_type: article?.source_type || "manual",
    status: article?.status || "draft",
    published_at: dateFormatted,
  };
}

export function ArticleEditor({ article }: { article?: Article }) {
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState(() => fromArticle(article));
  const [imported, setImported] = useState(false);

  useEffect(() => {
    setDraft(fromArticle(article));
    setImported(false);
  }, [article]);

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
    <div className="admin-section-heading editor-heading">
      <div>
        <p className="section-kicker">{draft.id ? `Redakto artikullin #${draft.id}` : "Redaktimi i përmbajtjes"}</p>
        <h3 id="article-editor-title">{draft.id ? `Redakto: ${draft.title.slice(0, 40)}${draft.title.length > 40 ? "..." : ""}` : "Artikull i ri"}</h3>
      </div>
      {draft.id && <a className="text-link cancel-edit-link" href={`/admin?tab=news&status=${draft.status}`}>✕ Anulo redaktimin</a>}
      {imported && <span className="editor-source">U përgatit me AI · draft</span>}
    </div>
    <form action="/api/admin/manage" method="post" className="admin-form">
      <input type="hidden" name="action" value="article-save" />
      {draft.id && <input type="hidden" name="id" value={draft.id} />}
      <input type="hidden" name="source_type" value={draft.source_type} />
      <label className="wide-field">Titulli<input required name="title" minLength={5} maxLength={240} value={draft.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label>Kategoria<select name="category" value={draft.category} onChange={(event) => update("category", event.target.value as Draft["category"])}>{CATEGORIES.map((category) => <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>)}</select></label>
      <label>Statusi<select name="status" value={draft.status} onChange={(event) => update("status", event.target.value as Draft["status"])}><option value="draft">Draft</option><option value="published">Publiko</option></select></label>
      <label>Data e artikullit<input type="date" name="published_at" value={draft.published_at} onChange={(event) => update("published_at", event.target.value)} /></label>
      <label className="wide-field">Përmbledhja<textarea required name="summary" minLength={20} rows={3} value={draft.summary} onChange={(event) => update("summary", event.target.value)} /></label>
      <label className="wide-field">Teksti (ndarje paragrafësh me rresht bosh)<textarea required name="body" minLength={30} rows={8} value={draft.body} onChange={(event) => update("body", event.target.value)} /></label>
      <div className="wide-field">
        <PhotoDropzone
          key={draft.id ? `edit-${draft.id}` : "new"}
          name="cover_url"
          defaultValue={draft.cover_url}
          onChange={(url) => update("cover_url", url)}
          label="Fotografia e artikullit (kopertina)"
          hint="Zgjidhni ose tërhiqni fotografinë e lajmit. Do të konvertohet automatikisht në WebP."
        />
      </div>
      <label>URL e fotografisë <span>(opsionale, ose shkruani URL të drejtpërdrejtë)</span><input type="text" value={draft.cover_url} onChange={(event) => update("cover_url", event.target.value)} /></label>
      <label>Emri i burimit<input name="source_name" value={draft.source_name} onChange={(event) => update("source_name", event.target.value)} /></label>
      <label className="wide-field">URL e burimit<input type="url" name="source_url" value={draft.source_url} onChange={(event) => update("source_url", event.target.value)} /></label>
      <div className="editor-actions">
        <button className="button button-dark" type="submit">
          {draft.id ? (draft.status === "published" ? "Përditëso dhe publiko" : "Përditëso draftin") : (draft.status === "published" ? "Ruaj dhe publiko" : "Ruaj si draft")}
        </button>
        {draft.id && <a className="text-link" href={`/admin?tab=news&status=${draft.status}`}>Anulo redaktimin</a>}
      </div>
    </form>
  </section>;
}
