import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { pickMessages } from "@/i18n/messages";
import { routing } from "@/i18n/routing";
import { getLocalizedHistoryEntries } from "@/lib/db/content";
import { HistoryPhotoFigure } from "@/components/HistoryPhotoFigure";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "History" });
  return buildPageMetadata({
    locale,
    route: "/historia",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

function renderFormatted(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderTimelineContent(content: string) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasSubevents = paragraphs.some((p) => /^\*\*(.*?):?\*\*/.test(p));

  if (!hasSubevents) {
    return (
      <div className="timeline-standard-body">
        {paragraphs.map((p, i) => (
          <p key={i}>{renderFormatted(p)}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="timeline-subevents-flow">
      {paragraphs.map((p, i) => {
        const match = p.match(/^\*\*(.*?):?\*\*:?\s*([\s\S]*)$/);
        if (match) {
          const rawHeading = match[1].replace(/:$/, "").trim();
          const rest = match[2].trim();
          const dashSplit = rawHeading.split(/\s+[–—\-]\s+/);

          const hasDateSplit = dashSplit.length > 1;
          const dateLabel = hasDateSplit ? dashSplit[0] : null;
          const titleLabel = hasDateSplit ? dashSplit.slice(1).join(" – ") : rawHeading;

          const lines = rest
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

          const bulletItems: string[] = [];
          for (const line of lines) {
            if (/^[-•*]\s+/.test(line)) {
              bulletItems.push(line.replace(/^[-•*]\s+/, "").trim());
            } else if (line.length > 0) {
              bulletItems.push(line);
            }
          }

          return (
            <section key={i} className="timeline-chapter">
              <div className="timeline-chapter-header">
                {dateLabel && <span className="timeline-chapter-date">{dateLabel}</span>}
                <h4 className="timeline-chapter-title">{titleLabel}</h4>
              </div>
              {bulletItems.length > 0 && (
                <ul className="timeline-bullet-list">
                  {bulletItems.map((item, idx) => (
                    <li key={idx} className="timeline-bullet-item">
                      <span className="bullet-indicator" aria-hidden="true">
                        —
                      </span>
                      <span className="bullet-text">{renderFormatted(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        }

        const isLead = p.startsWith("*") && p.includes(".*");
        const isQuote = p.includes("“") || p.includes("„") || p.includes("tha:");

        if (isLead || isQuote) {
          return (
            <blockquote key={i} className={`timeline-callout ${isQuote ? "quote-callout" : "lead-callout"}`}>
              <p>{renderFormatted(p)}</p>
            </blockquote>
          );
        }

        return (
          <p key={i} className="timeline-regular-paragraph">
            {renderFormatted(p)}
          </p>
        );
      })}
    </div>
  );
}

export default async function HistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const [t, allMessages, entries] = await Promise.all([
    getTranslations({ locale, namespace: "History" }),
    getMessages({ locale }),
    getLocalizedHistoryEntries(locale),
  ]);

  return (
    <div className="page-shell wrap history-page">
      <div className="page-intro">
        <p className="section-kicker">{t("pageKicker")}</p>
        <h1>{t("pageHeading")}</h1>
        <p>{t("pageDescription")}</p>
      </div>

      <section className="timeline-section">
        <h2>{t("timelineHeading")}</h2>
        {entries.length ? (
          <NextIntlClientProvider
            locale={locale}
            messages={pickMessages(allMessages, {
              History: ["zoomAria", "viewFullSize", "closeLightboxAria"],
            })}
          >
            <ol className="timeline">
            {entries.map((entry) => (
              <li key={entry.id}>
                <time lang={entry.translation_missing ? "sq" : undefined}>{entry.era_year}</time>
                <div
                  className={`timeline-entry-main ${entry.image_url ? "has-plate" : ""}`}
                  lang={entry.translation_missing ? "sq" : undefined}
                >
                  {entry.translation_missing && (
                    <p className="timeline-translation-note" lang={locale}>
                      <span className="translation-missing-pill">{t("originalLanguageBadge")}</span>{" "}
                      <span>{t("translationUnavailableNotice")}</span>
                    </p>
                  )}
                  <h3>{entry.title}</h3>
                  <div className={`timeline-entry-grid ${entry.image_url ? "with-media" : ""}`}>
                    <div className="timeline-entry-text">
                      {renderTimelineContent(entry.content)}
                      {entry.source_citation && (
                        <p className="citation">
                          {t("sourcePrefix")} {entry.source_citation}
                        </p>
                      )}
                    </div>
                    {entry.image_url && (
                      <div className="timeline-entry-media">
                        <HistoryPhotoFigure src={entry.image_url} alt={entry.title} caption={entry.source_citation} />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
            </ol>
          </NextIntlClientProvider>
        ) : (
          <p className="empty-note">{t("timelineEmpty")}</p>
        )}
      </section>

      <section className="quarters-section">
        <div>
          <p className="section-kicker">{t("quartersKicker")}</p>
          <h2>{t("quartersHeading")}</h2>
        </div>
        <div>
          <h3>{t("quartersUpperTitle")}</h3>
          <p>{t("quartersUpperP1")}</p>
          <p>{t("quartersUpperP2")}</p>
          <a
            className="citation-link"
            href="https://sam24.info/shoqata-topanica-model-i-unitetit-dhe-perkushtimit-per-vendlindjen/"
            target="_blank"
            rel="noreferrer"
          >
            {t("quartersCitation")} ↗
          </a>
          <br />
          <Link className="text-link" href="/kontribuo">
            {t("quartersContributeLink")} ↗
          </Link>
        </div>
      </section>

      <section className="oak-story">
        <Image
          className="oak-story-image"
          src="/logo.png"
          alt={t("oakImageAlt")}
          width={396}
          height={331}
          sizes="(max-width: 540px) 240px, 280px"
        />
        <div>
          <p className="section-kicker">{t("oakKicker")}</p>
          <h2>{t("oakHeading")}</h2>
          <p>{t("oakBody")}</p>
          <a
            className="citation-link"
            href="https://sam24.info/shoqata-topanica-model-i-unitetit-dhe-perkushtimit-per-vendlindjen/"
            target="_blank"
            rel="noreferrer"
          >
            {t("oakCitation")} ↗
          </a>
        </div>
      </section>

      <section className="institutions-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{t("institutionsKicker")}</p>
            <h2>{t("institutionsHeading")}</h2>
          </div>
          <p>{t("institutionsNote")}</p>
        </div>
        <div className="institutions-grid">
          <article>
            <h3>{t("schoolTitle")}</h3>
            <p>{t("schoolBody")}</p>
            <a href="https://kqz-ks.org/wp-content/uploads/2018/04/Qendrat-e-Votimit-2014.pdf" target="_blank" rel="noreferrer">
              {t("schoolCitation")} ↗
            </a>
          </article>
          <article>
            <h3>{t("mosqueTitle")}</h3>
            <p>{t("mosqueBody")}</p>
            <Link href="/kontribuo">{t("mosqueLink")} ↗</Link>
          </article>
          <article>
            <h3>{t("diasporaTitle")}</h3>
            <p>{t("diasporaBody")}</p>
            <Link href="/kontribuo">{t("diasporaLink")} ↗</Link>
          </article>
        </div>
      </section>

      <section className="history-sources">
        <h2>{t("sourcesHeading")}</h2>
        <ul>
          <li>
            <a
              href="https://askdata.rks-gov.net/pxweb/sq/ASKdata/ASKdata__Census%20population__6_Sipas%20vendbanimeve__10%20Popullsia%20e%20komun%C3%ABs%20s%C3%AB%20Kamenic%C3%ABs%20sipas%20vendbanimit/PopSex10.px/"
              target="_blank"
              rel="noreferrer"
            >
              {t("sourceAsk")} ↗
            </a>
          </li>
          <li>
            <a href="https://dtk.rks-gov.net/Objekti?heritageId=3904" target="_blank" rel="noreferrer">
              {t("sourceDtk")} ↗
            </a>
          </li>
          <li>
            <a href="https://www.mkrs-ks.org/repository/docs/5367_02.pdf" target="_blank" rel="noreferrer">
              {t("sourceMkrs")} ↗
            </a>
          </li>
          <li>
            <a
              href="https://sam24.info/shoqata-topanica-model-i-unitetit-dhe-perkushtimit-per-vendlindjen/"
              target="_blank"
              rel="noreferrer"
            >
              {t("sourceSam")} ↗
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
