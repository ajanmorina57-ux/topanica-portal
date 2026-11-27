import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { safeQuery } from "@/lib/db";
import {
  getAdminArticleByIdWithTranslations,
  getAdminContentWithTranslations,
} from "@/lib/db/content";
import type {
  GalleryPhotoTranslationsMap,
  HistoryEntryTranslationsMap,
  Submission,
  TranslationLocale,
} from "@/lib/models";
import { TRANSLATION_LOCALES } from "@/lib/models";
import {
  CATEGORY_LABELS,
  GALLERY_LABELS,
  SOURCE_TYPE_LABELS,
  SUBMISSION_TYPE_LABELS,
  formatDate,
} from "@/lib/site";
import { AdminControls } from "@/components/AdminControls";
import { AdminImporter } from "@/components/AdminImporter";
import { AdminToast } from "@/components/AdminToast";
import { ArticleEditor } from "@/components/ArticleEditor";
import { PhotoDropzone } from "@/components/PhotoDropzone";

export const metadata = {
  title: "Administrimi",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
type AdminTab = "news" | "submissions" | "history" | "gallery";
type MissingFilter = "all" | "any" | "en" | "de";
type Settings = { value: string };

const LOCALE_LABELS: Record<TranslationLocale, { full: string; short: string }> = {
  en: { full: "Përkthimi në anglisht (EN)", short: "EN" },
  de: { full: "Përkthimi në gjermanisht (DE)", short: "DE" },
};

const formInput = (name: string, value = "", label = name, type = "text") => (
  <label>
    {label}
    <input name={name} type={type} defaultValue={value} />
  </label>
);
const formArea = (name: string, value = "", label = name, required = true) => (
  <label>
    {label}
    <textarea name={name} rows={5} defaultValue={value} required={required} />
  </label>
);

type TranslatableItem = {
  translations?: Partial<Record<TranslationLocale, unknown>>;
};

function countMissingTranslations<T extends TranslatableItem>(items: T[]) {
  let en = 0;
  let de = 0;
  let any = 0;
  for (const item of items) {
    const hasEn = Boolean(item.translations?.en);
    const hasDe = Boolean(item.translations?.de);
    if (!hasEn) en += 1;
    if (!hasDe) de += 1;
    if (!hasEn || !hasDe) any += 1;
  }
  return { en, de, any };
}

function matchesMissingFilter(item: TranslatableItem, missing: MissingFilter) {
  if (missing === "all") return true;
  if (missing === "en") return !item.translations?.en;
  if (missing === "de") return !item.translations?.de;
  return !item.translations?.en || !item.translations?.de;
}

function TranslationBadges({ translations }: { translations?: Partial<Record<TranslationLocale, unknown>> }) {
  const hasEn = Boolean(translations?.en);
  const hasDe = Boolean(translations?.de);
  return (
    <span className="translation-badges" aria-label="Statusi i përkthimeve">
      <span className="translation-badge ok">AL ✓</span>
      <span className={`translation-badge ${hasEn ? "ok" : "missing"}`}>
        {hasEn ? "EN ✓" : "Mungon EN"}
      </span>
      <span className={`translation-badge ${hasDe ? "ok" : "missing"}`}>
        {hasDe ? "DE ✓" : "Mungon DE"}
      </span>
    </span>
  );
}

function buildAdminHref(params: {
  tab: AdminTab;
  status?: string;
  q?: string;
  missing?: MissingFilter;
  edit?: number;
}) {
  const query = new URLSearchParams();
  query.set("tab", params.tab);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  if (params.missing && params.missing !== "all") query.set("missing", params.missing);
  if (params.edit) query.set("edit", String(params.edit));
  return `/admin?${query.toString()}`;
}

function TranslationSummaryBar({
  tab,
  missingCounts,
  missingFilter,
  status,
  searchQuery,
}: {
  tab: AdminTab;
  missingCounts: { en: number; de: number; any: number };
  missingFilter: MissingFilter;
  status?: string;
  searchQuery?: string;
}) {
  const filters: Array<[MissingFilter, string, number | null]> = [
    ["all", "Të gjitha", null],
    ["any", "Pa përkthim", missingCounts.any],
    ["en", "Mungon EN", missingCounts.en],
    ["de", "Mungon DE", missingCounts.de],
  ];

  return (
    <div className="translation-summary-bar" role="region" aria-label="Përmbledhja e përkthimeve">
      <span className="translation-summary-count">
        {missingCounts.any === 0
          ? "Të gjitha hyrjet janë të përkthyera (EN & DE ✓)."
          : `Mungojnë përkthime: ${missingCounts.en} EN · ${missingCounts.de} DE (${missingCounts.any} gjithsej jo të plota)`}
      </span>
      <div className="translation-filter-links">
        {filters.map(([value, label, count]) => (
          <Link
            key={value}
            className={missingFilter === value ? "selected" : ""}
            href={buildAdminHref({ tab, status, q: searchQuery, missing: value })}
          >
            {label}
            {count !== null && <span>{count}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function HistoryTranslationFields({ translations }: { translations?: HistoryEntryTranslationsMap }) {
  return (
    <div className="wide-field translation-group">
      {TRANSLATION_LOCALES.map((locale) => {
        const tr = translations?.[locale];
        const meta = LOCALE_LABELS[locale];
        return (
          <details key={locale} className="translation-details">
            <summary>
              <span>{meta.full}</span>
              <span className={`translation-badge ${tr ? "ok" : "missing"}`}>
                {tr ? `${meta.short} ✓` : `Mungon ${meta.short}`}
              </span>
            </summary>
            <div className="translation-fields">
              {formInput(`era_year_${locale}`, tr?.era_year || "", `Viti / periudha (${meta.short})`)}
              {formInput(`title_${locale}`, tr?.title || "", `Titulli (${meta.short})`)}
              <div className="wide-field">
                {formInput(`source_citation_${locale}`, tr?.source_citation || "", `Burimi (${meta.short})`)}
              </div>
              {formArea(`content_${locale}`, tr?.content || "", `Përmbajtja (${meta.short})`, false)}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function GalleryTranslationFields({ translations }: { translations?: GalleryPhotoTranslationsMap }) {
  return (
    <div className="wide-field translation-group">
      {TRANSLATION_LOCALES.map((locale) => {
        const tr = translations?.[locale];
        const meta = LOCALE_LABELS[locale];
        return (
          <details key={locale} className="translation-details">
            <summary>
              <span>{meta.full}</span>
              <span className={`translation-badge ${tr ? "ok" : "missing"}`}>
                {tr ? `${meta.short} ✓` : `Mungon ${meta.short}`}
              </span>
            </summary>
            <div className="translation-fields">
              {formInput(`title_${locale}`, tr?.title || "", `Titulli (${meta.short})`)}
              {formInput(`credit_${locale}`, tr?.credit || "", `Autori / burimi (${meta.short})`)}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function AdminNavigation({ active, counts }: { active: AdminTab; counts: Record<AdminTab, number> }) {
  const items: Array<[AdminTab, string]> = [
    ["news", "Lajme"],
    ["submissions", "Kontribute"],
    ["history", "Historia"],
    ["gallery", "Galeria"],
  ];
  return (
    <nav className="admin-nav" aria-label="Seksionet e administrimit">
      {items.map(([tab, label]) => (
        <Link
          key={tab}
          className={active === tab ? "active" : ""}
          aria-current={active === tab ? "page" : undefined}
          href={`/admin?tab=${tab}`}
        >
          <span>{label}</span>
          <small>{counts[tab]}</small>
        </Link>
      ))}
    </nav>
  );
}

function DeleteForm({ entity, id }: { entity: "article" | "history" | "photo"; id: number }) {
  return (
    <form action="/api/admin/manage" method="post">
      <input type="hidden" name="action" value="delete" />
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />
      <button className="admin-delete" type="submit">
        Fshi
      </button>
    </form>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string; edit?: string; q?: string; missing?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const params = await searchParams;
  const tabs: AdminTab[] = ["news", "submissions", "history", "gallery"];
  const active = tabs.includes(params.tab as AdminTab) ? (params.tab as AdminTab) : "news";
  const status =
    params.status === "draft" || params.status === "published" || params.status === "all" ? params.status : "all";
  const missingFilter: MissingFilter =
    params.missing === "any" || params.missing === "en" || params.missing === "de" ? params.missing : "all";
  const searchQuery = (params.q || "").trim();
  const editId = params.edit ? Number(params.edit) : undefined;

  const [settings, content, submissions, editFallback] = await Promise.all([
    safeQuery<Settings>("SELECT value FROM site_settings WHERE key='auto_publish_news' LIMIT 1"),
    getAdminContentWithTranslations(),
    safeQuery<Submission>("SELECT * FROM submissions WHERE status='pending' ORDER BY created_at ASC LIMIT 100"),
    editId && Number.isInteger(editId) && editId > 0
      ? getAdminArticleByIdWithTranslations(editId)
      : Promise.resolve(null),
  ]);

  const { articles, history, photos } = content;
  const editing = editId
    ? (articles.find((article) => article.id === editId) ?? editFallback ?? undefined)
    : undefined;

  const normalizedQuery = searchQuery.toLocaleLowerCase("sq-XK");
  const filteredArticles = articles.filter((article) => {
    if (status !== "all" && article.status !== status) return false;
    if (!matchesMissingFilter(article, missingFilter)) return false;
    if (!normalizedQuery) return true;
    const haystack = `${article.title} ${article.summary} ${article.source_name || ""}`.toLocaleLowerCase("sq-XK");
    return haystack.includes(normalizedQuery);
  });

  const filteredHistory = history.filter((entry) => matchesMissingFilter(entry, missingFilter));
  const filteredPhotos = photos.filter((photo) => matchesMissingFilter(photo, missingFilter));

  const articleMissingCounts = countMissingTranslations(articles);
  const historyMissingCounts = countMissingTranslations(history);
  const photoMissingCounts = countMissingTranslations(photos);

  const counts: Record<AdminTab, number> = {
    news: articles.length,
    submissions: submissions.length,
    history: history.length,
    gallery: photos.length,
  };

  return (
    <div className="admin-page wrap" data-ui="admin">
      <AdminToast />
      <header className="admin-head">
        <div className="admin-brand">
          <Image src="/logo.png" alt="" width={72} height={60} />
          <div>
            <p className="section-kicker">Portali i Topanicës</p>
            <h1>Administrimi</h1>
          </div>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="admin-logout" type="submit">
            Dil nga paneli <span aria-hidden="true">↗</span>
          </button>
        </form>
      </header>

      <section className="automation-section admin-section" aria-labelledby="automation-title">
        <div className="admin-section-heading">
          <div>
            <p className="section-kicker">Botimi dhe mbledhja</p>
            <h2 id="automation-title">Kontrolli i lajmeve</h2>
          </div>
          <p>Menaxhoni publikimin automatik dhe burimet lokale.</p>
        </div>
        <AdminControls initialAutoPublish={settings[0]?.value === "true"} />
      </section>

      <AdminNavigation active={active} counts={counts} />

      {active === "news" && (
        <section className="admin-section admin-tab-content">
          <div className="admin-section-heading">
            <div>
              <p className="section-kicker">Redaksia</p>
              <h2>Lajmet</h2>
            </div>
            <p>{articles.length} artikuj gjithsej.</p>
          </div>
          <AdminImporter />
          <div className="admin-list-tabs" aria-label="Filtro artikujt">
            <Link
              className={status === "all" ? "selected" : ""}
              href={buildAdminHref({ tab: "news", status: "all", q: searchQuery, missing: missingFilter })}
            >
              Të gjitha <span>{articles.length}</span>
            </Link>
            <Link
              className={status === "draft" ? "selected" : ""}
              href={buildAdminHref({ tab: "news", status: "draft", q: searchQuery, missing: missingFilter })}
            >
              Draftet <span>{articles.filter((article) => article.status === "draft").length}</span>
            </Link>
            <Link
              className={status === "published" ? "selected" : ""}
              href={buildAdminHref({ tab: "news", status: "published", q: searchQuery, missing: missingFilter })}
            >
              Të publikuara <span>{articles.filter((article) => article.status === "published").length}</span>
            </Link>
          </div>
          <TranslationSummaryBar
            tab="news"
            missingCounts={articleMissingCounts}
            missingFilter={missingFilter}
            status={status}
            searchQuery={searchQuery}
          />
          <form action="/admin" method="get" className="admin-search-form">
            <input type="hidden" name="tab" value="news" />
            <input type="hidden" name="status" value={status} />
            {missingFilter !== "all" && <input type="hidden" name="missing" value={missingFilter} />}
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Kërko sipas titullit ose burimit"
              aria-label="Kërko lajme"
            />
            <button className="button button-dark" type="submit">
              Kërko
            </button>
            {searchQuery && (
              <Link className="text-link" href={buildAdminHref({ tab: "news", status, missing: missingFilter })}>
                Pastro
              </Link>
            )}
          </form>
          <div className="admin-rows">
            {filteredArticles.map((article) => {
              const isEditing = article.id === editing?.id;
              const sourceLabel = article.source_name || SOURCE_TYPE_LABELS[article.source_type] || article.source_type;
              return (
                <article className={`admin-row ${isEditing ? "is-editing" : ""}`} key={article.id}>
                  <div className="admin-row-copy">
                    <strong>{article.title}</strong>
                    <span>
                      {article.status === "published" ? "Publikuar" : "Draft"} · {CATEGORY_LABELS[article.category]} ·{" "}
                      {sourceLabel} · {formatDate(article.published_at ?? article.created_at)}
                    </span>
                    <TranslationBadges translations={article.translations} />
                  </div>
                  <div className="admin-row-actions">
                    {article.status === "published" && (
                      <Link className="admin-view-link" href={`/lajme/${article.slug}`}>
                        Shiko ↗
                      </Link>
                    )}
                    {article.status === "draft" && (
                      <form action="/api/admin/manage" method="post">
                        <input type="hidden" name="action" value="article-status" />
                        <input type="hidden" name="id" value={article.id} />
                        <input type="hidden" name="status" value="published" />
                        <button className="admin-approve" type="submit">
                          Mirato dhe publiko
                        </button>
                      </form>
                    )}
                    <Link
                      className={`admin-edit-link ${isEditing ? "active-edit" : ""}`}
                      href={`${buildAdminHref({ tab: "news", status, q: searchQuery, missing: missingFilter, edit: article.id })}#article-form`}
                    >
                      {isEditing ? "Në redaktim" : "Redakto"}
                    </Link>
                    <DeleteForm entity="article" id={article.id} />
                  </div>
                </article>
              );
            })}
            {!filteredArticles.length && <p className="empty-note">Nuk ka artikuj në këtë listë.</p>}
          </div>
          <ArticleEditor key={editing?.id ? `edit-${editing.id}` : "new-article"} article={editing} />
        </section>
      )}

      {active === "submissions" && (
        <section className="admin-section admin-tab-content">
          <div className="admin-section-heading">
            <div>
              <p className="section-kicker">Nga banorët dhe mërgata</p>
              <h2>Kontribute në pritje</h2>
            </div>
            <p>{submissions.length} dërgesa presin shqyrtim.</p>
          </div>
          <div className="admin-rows">
            {submissions.map((submission) => {
              const photoList = Array.from(
                new Set(
                  [
                    ...(Array.isArray(submission.image_urls) ? submission.image_urls : []),
                    ...(submission.image_url ? [submission.image_url] : []),
                    ...(submission.attachment_url ? [submission.attachment_url] : []),
                  ].filter(Boolean),
                ),
              );
              return (
                <article className="submission-row" key={submission.id}>
                  <div className="submission-meta">
                    <strong>{submission.sender_name}</strong>
                    <span>
                      {SUBMISSION_TYPE_LABELS[submission.type] || submission.type} · {formatDate(submission.created_at)}
                      {submission.sender_contact ? ` · ${submission.sender_contact}` : ""}
                    </span>
                  </div>
                  <p>{submission.message}</p>
                  {photoList.length > 0 && (
                    <div className="submission-photos-grid">
                      {photoList.map((imgUrl, idx) => (
                        <div className="submission-photo-preview" key={`${submission.id}-${idx}`}>
                          <Image
                            src={imgUrl}
                            alt={`Fotografia ${idx + 1} e dërguar`}
                            width={280}
                            height={180}
                            unoptimized={imgUrl.startsWith("http") || imgUrl.startsWith("/api/")}
                            className="submission-thumb-img"
                          />
                          <a className="submission-attachment" href={imgUrl} target="_blank" rel="noreferrer">
                            Shiko në madhësi të plotë ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="admin-row-actions">
                    <form action="/api/admin/manage" method="post">
                      <input type="hidden" name="action" value="submission-status" />
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="admin-approve" type="submit">
                        Mirato
                      </button>
                    </form>
                    <form action="/api/admin/manage" method="post">
                      <input type="hidden" name="action" value="submission-convert-article" />
                      <input type="hidden" name="id" value={submission.id} />
                      <button className="admin-approve" type="submit">
                        Kthe në lajm
                      </button>
                    </form>
                    {photoList.length > 0 && (
                      <form action="/api/admin/manage" method="post">
                        <input type="hidden" name="action" value="submission-convert-photo" />
                        <input type="hidden" name="id" value={submission.id} />
                        <button className="admin-approve" type="submit">
                          {photoList.length > 1 ? `Shto ${photoList.length} foto në galeri` : "Shto në galeri"}
                        </button>
                      </form>
                    )}
                    <form action="/api/admin/manage" method="post">
                      <input type="hidden" name="action" value="submission-convert-history" />
                      <input type="hidden" name="id" value={submission.id} />
                      <button className="admin-approve" type="submit">
                        Shto në histori
                      </button>
                    </form>
                    <form action="/api/admin/manage" method="post">
                      <input type="hidden" name="action" value="submission-status" />
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button className="admin-delete" type="submit">
                        Refuzo
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
            {!submissions.length && <p className="empty-note">Nuk ka kontribute në pritje.</p>}
          </div>
        </section>
      )}

      {active === "history" && (
        <section className="admin-section admin-tab-content">
          <div className="admin-section-heading">
            <div>
              <p className="section-kicker">Gjurmë dhe kujtesë</p>
              <h2>Historia</h2>
            </div>
            <p>Ndryshoni përmbajtjen, përkthimet dhe renditjen kohore.</p>
          </div>
          <TranslationSummaryBar
            tab="history"
            missingCounts={historyMissingCounts}
            missingFilter={missingFilter}
          />
          <div className="admin-rows">
            {filteredHistory.map((entry) => (
              <article className="admin-row admin-edit-row" key={entry.id}>
                <form action="/api/admin/manage" method="post" className="admin-form">
                  <div className="wide-field admin-row-translation-head">
                    <span>#{entry.id} · {entry.era_year}</span>
                    <TranslationBadges translations={entry.translations} />
                  </div>
                  <input type="hidden" name="action" value="history-save" />
                  <input type="hidden" name="id" value={entry.id} />
                  {formInput("era_year", entry.era_year, "Viti / periudha (Shqip)")}
                  {formInput("sort_order", String(entry.sort_order), "Renditja", "number")}
                  {formInput("title", entry.title, "Titulli (Shqip)")}
                  {formInput("source_citation", entry.source_citation || "", "Burimi (Shqip)")}
                  {formInput("image_url", entry.image_url || "", "Lidhja e fotografisë (WebP / URL)")}
                  {formArea("content", entry.content, "Përmbajtja (Shqip)")}
                  <HistoryTranslationFields translations={entry.translations} />
                  <button className="admin-approve" type="submit">
                    Ruaj ndryshimet
                  </button>
                </form>
                <DeleteForm entity="history" id={entry.id} />
              </article>
            ))}
            {!filteredHistory.length && (
              <p className="empty-note">
                {history.length ? "Nuk ka shënime që përputhen me filtrin e përkthimit." : "Shtoni shënimin e parë historik."}
              </p>
            )}
          </div>
          <div className="admin-form-block">
            <p className="section-kicker">Regjistër i ri</p>
            <h3>Shto në kronologji</h3>
            <form action="/api/admin/manage" method="post" className="admin-form">
              <input type="hidden" name="action" value="history-save" />
              {formInput("era_year", "", "Viti / periudha (Shqip)")}
              {formInput("sort_order", "100", "Renditja", "number")}
              {formInput("title", "", "Titulli (Shqip)")}
              {formInput("source_citation", "", "Burimi (Shqip)")}
              <div className="wide-field">
                <PhotoDropzone
                  name="image_url"
                  label="Fotografia e ngjarjes historike (WebP)"
                  hint="Ngarkoni një fotografi historike. Do të konvertohet në WebP."
                />
              </div>
              {formArea("content", "", "Përmbajtja (Shqip)")}
              <HistoryTranslationFields />
              <button className="button button-dark" type="submit">
                Shto shënimin
              </button>
            </form>
          </div>
        </section>
      )}

      {active === "gallery" && (
        <section className="admin-section admin-tab-content">
          <div className="admin-section-heading">
            <div>
              <p className="section-kicker">Arkivi pamor</p>
              <h2>Galeria</h2>
            </div>
            <p>{photos.length} fotografi të regjistruara.</p>
          </div>
          <TranslationSummaryBar
            tab="gallery"
            missingCounts={photoMissingCounts}
            missingFilter={missingFilter}
          />
          <div className="admin-rows">
            {filteredPhotos.map((photo) => (
              <article className="admin-row admin-edit-row photo-admin-row" key={photo.id}>
                <form action="/api/admin/manage" method="post" className="admin-form">
                  <div className="wide-field admin-row-translation-head">
                    <span>#{photo.id} · {GALLERY_LABELS[photo.category]}</span>
                    <TranslationBadges translations={photo.translations} />
                  </div>
                  <input type="hidden" name="action" value="photo-save" />
                  <input type="hidden" name="id" value={photo.id} />
                  {formInput("title", photo.title, "Titulli (Shqip)")}
                  {formInput("image_url", photo.image_url, "Lidhja e fotografisë", "text")}
                  <label>
                    Kategoria
                    <select name="category" defaultValue={photo.category}>
                      {Object.entries(GALLERY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {formInput("year_taken", photo.year_taken ? String(photo.year_taken) : "", "Viti", "number")}
                  {formInput("credit", photo.credit || "", "Autori / burimi i fotografisë (Shqip)")}
                  <GalleryTranslationFields translations={photo.translations} />
                  <button className="admin-approve" type="submit">
                    Ruaj ndryshimet
                  </button>
                </form>
                <DeleteForm entity="photo" id={photo.id} />
              </article>
            ))}
            {!filteredPhotos.length && (
              <p className="empty-note">
                {photos.length
                  ? "Nuk ka fotografi që përputhen me filtrin e përkthimit."
                  : "Fotografitë e para mund të shtohen nga këtu ose të dërgohen nga banorët."}
              </p>
            )}
          </div>
          <div className="admin-form-block">
            <p className="section-kicker">Foto e re</p>
            <h3>Shto në galeri</h3>
            <form action="/api/admin/manage" method="post" className="admin-form">
              <input type="hidden" name="action" value="photo-save" />
              {formInput("title", "", "Titulli (Shqip)")}
              <div className="wide-field">
                <PhotoDropzone
                  name="image_url"
                  label="Fotografia (WebP)"
                  hint="Zgjidhni fotografinë për galeri. Do të konvertohet automatikisht në WebP."
                />
              </div>
              <label>
                Kategoria
                <select name="category" defaultValue="fshati">
                  <option value="arkiv">Arkiv</option>
                  <option value="natyre">Natyrë</option>
                  <option value="fshati">Fshati</option>
                </select>
              </label>
              {formInput("year_taken", "", "Viti", "number")}
              {formInput("credit", "", "Autori / burimi i fotografisë (Shqip)")}
              <GalleryTranslationFields />
              <button className="button button-dark" type="submit">
                Shto fotografinë
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
