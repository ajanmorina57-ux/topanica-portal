"use client";

import { useEffect, useState } from "react";
import type { Article, ArticleTranslationsMap, TranslationLocale } from "@/lib/models";
import type { ImportedArticle } from "@/components/AdminImporter";
import { CATEGORY_LABELS, CATEGORIES } from "@/lib/site";
import { PhotoDropzone } from "@/components/PhotoDropzone";
import { showAdminToast } from "@/components/AdminToast";

type EditableArticle = Article & {
  translations?: ArticleTranslationsMap;
};

type TranslationDraft = {
  title: string;
  summary: string;
  body: string;
};

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
  translations: Record<TranslationLocale, TranslationDraft>;
};

const EMPTY_TRANSLATION: TranslationDraft = { title: "", summary: "", body: "" };

const TRANSLATION_META: Record<TranslationLocale, { label: string; badge: string }> = {
  en: { label: "Përkthimi në anglisht (EN)", badge: "EN" },
  de: { label: "Përkthimi në gjermanisht (DE)", badge: "DE" },
};

function fromArticle(article?: EditableArticle): Draft {
  const initialDate = article?.published_at || article?.created_at;
  const dateFormatted = initialDate
    ? new Date(initialDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const en = article?.translations?.en;
  const de = article?.translations?.de;
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
    translations: {
      en: en ? { title: en.title, summary: en.summary, body: en.body } : { ...EMPTY_TRANSLATION },
      de: de ? { title: de.title, summary: de.summary, body: de.body } : { ...EMPTY_TRANSLATION },
    },
  };
}

export function ArticleEditor({ article }: { article?: EditableArticle }) {
  const [draft, setDraft] = useState(() => fromArticle(article));
  const [imported, setImported] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [openLocales, setOpenLocales] = useState<Record<TranslationLocale, boolean>>({
    en: false,
    de: false,
  });

  useEffect(() => {
    setDraft(fromArticle(article));
    setImported(false);
    setValidationError("");
    setOpenLocales({ en: false, de: false });
  }, [article]);

  useEffect(() => {
    const onImport = (event: Event) => {
      const next = (event as CustomEvent<ImportedArticle>).detail;
      setDraft((current) => ({
        ...current,
        ...next,
        id: undefined,
        cover_url: next.cover_url || "",
        status: "draft",
        translations: {
          en: { ...EMPTY_TRANSLATION },
          de: { ...EMPTY_TRANSLATION },
        },
      }));
      setImported(true);
      setValidationError("");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document
        .getElementById("article-form")
        ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };
    window.addEventListener("topanica:article-import", onImport);
    return () => window.removeEventListener("topanica:article-import", onImport);
  }, []);

  const update = <K extends keyof Draft>(field: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const updateTranslation = (
    locale: TranslationLocale,
    field: keyof TranslationDraft,
    value: string,
  ) => {
    setValidationError("");
    setDraft((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [locale]: {
          ...current.translations[locale],
          [field]: value,
        },
      },
    }));
  };

  const clearTranslation = (locale: TranslationLocale) => {
    setValidationError("");
    setDraft((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [locale]: { ...EMPTY_TRANSLATION },
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    for (const locale of ["en", "de"] as const) {
      const tr = draft.translations[locale];
      const title = tr.title.trim();
      const summary = tr.summary.trim();
      const body = tr.body.trim();
      if (!title && !summary && !body) continue;

      const label = TRANSLATION_META[locale].badge;
      let message = "";
      if (title.length < 3) {
        message = `Përkthimi ${label}: Titulli duhet të ketë të paktën 3 karaktere.`;
      } else if (summary.length < 5) {
        message = `Përkthimi ${label}: Përmbledhja duhet të ketë të paktën 5 karaktere.`;
      } else if (body.length < 10) {
        message = `Përkthimi ${label}: Teksti duhet të ketë të paktën 10 karaktere.`;
      }

      if (message) {
        event.preventDefault();
        setOpenLocales((current) => ({ ...current, [locale]: true }));
        setValidationError(message);
        showAdminToast(message, "error");
        return;
      }
    }
    setValidationError("");
  };

  return (
    <section className="admin-form-block article-editor" id="article-form" aria-labelledby="article-editor-title">
      <div className="admin-section-heading editor-heading">
        <div>
          <p className="section-kicker">{draft.id ? `Redakto artikullin #${draft.id}` : "Redaktimi i përmbajtjes"}</p>
          <h3 id="article-editor-title">
            {draft.id
              ? `Redakto: ${draft.title.slice(0, 40)}${draft.title.length > 40 ? "…" : ""}`
              : "Artikull i ri"}
          </h3>
        </div>
        {draft.id && (
          <a className="text-link cancel-edit-link" href={`/admin?tab=news&status=${draft.status}`}>
            Anulo redaktimin
          </a>
        )}
        {imported && <span className="editor-source">U përgatit me AI · draft</span>}
      </div>
      <form action="/api/admin/manage" method="post" className="admin-form" onSubmit={handleSubmit}>
        <input type="hidden" name="action" value="article-save" />
        {draft.id && <input type="hidden" name="id" value={draft.id} />}
        <input type="hidden" name="source_type" value={draft.source_type} />
        <label className="wide-field">
          Titulli (Shqip)
          <input
            required
            name="title"
            minLength={5}
            maxLength={240}
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </label>
        <label>
          Kategoria
          <select
            name="category"
            value={draft.category}
            onChange={(event) => update("category", event.target.value as Draft["category"])}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Statusi
          <select
            name="status"
            value={draft.status}
            onChange={(event) => update("status", event.target.value as Draft["status"])}
          >
            <option value="draft">Draft</option>
            <option value="published">Publiko</option>
          </select>
        </label>
        <label>
          Data e artikullit
          <input
            type="date"
            name="published_at"
            value={draft.published_at}
            onChange={(event) => update("published_at", event.target.value)}
          />
        </label>
        <label className="wide-field">
          Përmbledhja (Shqip)
          <textarea
            required
            name="summary"
            minLength={20}
            rows={3}
            value={draft.summary}
            onChange={(event) => update("summary", event.target.value)}
          />
        </label>
        <label className="wide-field">
          Teksti (Shqip — ndarje paragrafësh me rresht bosh)
          <textarea
            required
            name="body"
            minLength={30}
            rows={8}
            value={draft.body}
            onChange={(event) => update("body", event.target.value)}
          />
        </label>
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
        <label>
          URL e fotografisë <span>(opsionale, ose shkruani URL të drejtpërdrejtë)</span>
          <input
            type="text"
            value={draft.cover_url}
            onChange={(event) => update("cover_url", event.target.value)}
          />
        </label>
        <label>
          Emri i burimit
          <input
            name="source_name"
            value={draft.source_name}
            onChange={(event) => update("source_name", event.target.value)}
          />
        </label>
        <label className="wide-field">
          URL e burimit
          <input
            type="url"
            name="source_url"
            value={draft.source_url}
            onChange={(event) => update("source_url", event.target.value)}
          />
        </label>

        <div className="wide-field translation-group">
          {(["en", "de"] as const).map((locale) => {
            const tr = draft.translations[locale];
            const hasContent = Boolean(tr.title.trim() && tr.summary.trim() && tr.body.trim());
            const hasAny = Boolean(tr.title.trim() || tr.summary.trim() || tr.body.trim());
            const meta = TRANSLATION_META[locale];
            return (
              <details
                key={locale}
                className="translation-details"
                open={openLocales[locale]}
                onToggle={(event) => {
                  const isOpen = event.currentTarget.open;
                  setOpenLocales((current) => ({ ...current, [locale]: isOpen }));
                }}
              >
                <summary>
                  <span>{meta.label}</span>
                  <span className={`translation-badge ${hasContent ? "ok" : "missing"}`}>
                    {hasContent ? `${meta.badge} ✓` : `Mungon ${meta.badge}`}
                  </span>
                </summary>
                <div className="translation-fields">
                  <label className="wide-field">
                    Titulli ({meta.badge})
                    <input
                      name={`title_${locale}`}
                      maxLength={240}
                      value={tr.title}
                      onChange={(event) => updateTranslation(locale, "title", event.target.value)}
                      placeholder={`Titulli në ${meta.badge} (lëreni bosh për të fshirë/mos ruajtur)`}
                    />
                  </label>
                  <label className="wide-field">
                    Përmbledhja ({meta.badge})
                    <textarea
                      name={`summary_${locale}`}
                      maxLength={1200}
                      rows={3}
                      value={tr.summary}
                      onChange={(event) => updateTranslation(locale, "summary", event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    Teksti ({meta.badge})
                    <textarea
                      name={`body_${locale}`}
                      maxLength={25000}
                      rows={6}
                      value={tr.body}
                      onChange={(event) => updateTranslation(locale, "body", event.target.value)}
                    />
                  </label>
                  {hasAny && (
                    <div className="translation-clear-row">
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={() => clearTranslation(locale)}
                      >
                        Pastro fushat {meta.badge}
                      </button>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>

        {validationError && (
          <p className="admin-error wide-field" role="alert">
            {validationError}
          </p>
        )}

        <div className="editor-actions">
          <button className="button button-dark" type="submit">
            {draft.id
              ? draft.status === "published"
                ? "Përditëso dhe publiko"
                : "Përditëso draftin"
              : draft.status === "published"
                ? "Ruaj dhe publiko"
                : "Ruaj si draft"}
          </button>
          {draft.id && (
            <a className="text-link" href={`/admin?tab=news&status=${draft.status}`}>
              Anulo redaktimin
            </a>
          )}
        </div>
      </form>
    </section>
  );
}
