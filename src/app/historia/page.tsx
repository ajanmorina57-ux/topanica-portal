import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { safeQuery } from "@/lib/db";
import type { HistoryEntry } from "@/lib/models";
import { HistoryPhotoFigure } from "@/components/HistoryPhotoFigure";

const title = "Historia dhe trashëgimia";
const description =
  "Kronologjia historike, mëhallët, Lisi i Kungullarit dhe burimet e dokumentuara për fshatin Topanicë.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/historia" },
  openGraph: { title: `${title} — Topanicë`, description, url: "/historia" },
};
export const dynamic = "force-dynamic";

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

export default async function HistoryPage() {
  const entries = await safeQuery<HistoryEntry>("SELECT * FROM history_entries ORDER BY sort_order ASC, id ASC");

  return (
    <div className="page-shell wrap history-page">
      <div className="page-intro">
        <p className="section-kicker">Gjurmë, kujtime, burime</p>
        <h1>Historia e Topanicës</h1>
        <p>Një rrëfim që ndërtohet mbi të dhëna të dokumentuara dhe kujtesën e banorëve.</p>
      </div>

      <section className="timeline-section">
        <h2>Kronologjia</h2>
        {entries.length ? (
          <ol className="timeline">
            {entries.map((entry) => (
              <li key={entry.id}>
                <time>{entry.era_year}</time>
                <div className={`timeline-entry-main ${entry.image_url ? "has-plate" : ""}`}>
                  <h3>{entry.title}</h3>
                  <div className={`timeline-entry-grid ${entry.image_url ? "with-media" : ""}`}>
                    <div className="timeline-entry-text">
                      {renderTimelineContent(entry.content)}
                      {entry.source_citation && <p className="citation">Burimi: {entry.source_citation}</p>}
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
        ) : (
          <p className="empty-note">Shënimet historike do të shtohen pasi të dokumentohen me burime.</p>
        )}
      </section>

      <section className="quarters-section">
        <div>
          <p className="section-kicker">Kujtesa e lagjeve</p>
          <h2>Mëhallët</h2>
        </div>
        <div>
          <h3>Lagjja e Epërme</h3>
          <p>
            Në një intervistë të Shoqatës Topanica përmendet “Lagjja e Epërme”, e lidhur me familje të ardhura nga
            Malësia e Kamenicës. Emrat dhe kufijtë e mëhallëve të tjera do të shtohen kur të dokumentohen me banorët.
          </p>
          <p>Na shkruani emrin e mëhallës, një kujtim që e lidhni me të dhe kush mund ta plotësojë rrëfimin.</p>
          <a
            className="citation-link"
            href="https://sam24.info/shoqata-topanica-model-i-unitetit-dhe-perkushtimit-per-vendlindjen/"
            target="_blank"
            rel="noreferrer"
          >
            Burimi: SAM24.info, Intervistë e Shoqatës Topanica, 30 maj 2025 ↗
          </a>
          <br />
          <Link className="text-link" href="/kontribuo">
            Ndani një rrëfim për mëhallën tuaj ↗
          </Link>
        </div>
      </section>

      <section className="oak-story">
        <Image
          className="oak-story-image"
          src="/logo.png"
          alt="Emblema e Lisit të Kungullarit në logon e Shoqatës Topanica"
          width={396}
          height={331}
          sizes="(max-width: 540px) 240px, 280px"
        />
        <div>
          <p className="section-kicker">Simbol i vendlindjes</p>
          <h2>Lisi i Kungullarit</h2>
          <p>
            Lisi i vetmuar që shfaqet në logon e Shoqatës Topanica njihet si “Lisi i Kungullarit”. Në intervistën e
            vitit 2025, kryetari i shoqatës e përshkruan si lis mbi 100-vjeçar, pa pemë të tjera pranë. Mosha
            përcillet si rrëfim i komunitetit, jo si matje shkencore.
          </p>
          <a
            className="citation-link"
            href="https://sam24.info/shoqata-topanica-model-i-unitetit-dhe-perkushtimit-per-vendlindjen/"
            target="_blank"
            rel="noreferrer"
          >
            Burimi: SAM24.info, 30 maj 2025 ↗
          </a>
        </div>
      </section>

      <section className="institutions-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Jeta e fshatit</p>
            <h2>Vendet që na lidhin</h2>
          </div>
          <p>Emrat dhe historitë këtu mund të plotësohen nga banorët.</p>
        </div>
        <div className="institutions-grid">
          <article>
            <h3>Shkolla e fshatit</h3>
            <p>
              Shkolla fillore dhe e mesme e ulët mban emrin SHFMU “Rexhep Mala”. Në listën arkivore të qendrave të
              votimit të KQZ-së më 2014, shkolla në Topanicë figuron me emrin “Rexhep Malaj”.
            </p>
            <a href="https://kqz-ks.org/wp-content/uploads/2018/04/Qendrat-e-Votimit-2014.pdf" target="_blank" rel="noreferrer">
              Burimi: KQZ, 2014 ↗
            </a>
          </article>
          <article>
            <h3>Xhamia e fshatit</h3>
            <p>
              Një vend i rëndësishëm i jetës dhe kujtesës së komunitetit. Rrëfimet për ndërtimin dhe historinë e saj
              presin të dokumentohen.
            </p>
            <Link href="/kontribuo">Shtoni një kujtim ↗</Link>
          </article>
          <article>
            <h3>Topanica dhe mërgata</h3>
            <p>
              Lidhjet familjare me mërgatën janë pjesë e përditshmërisë së fshatit. Ndani kujtime, fotografi dhe nisma
              që lidhin brezat e vendet.
            </p>
            <Link href="/kontribuo">Ndani me ne ↗</Link>
          </article>
        </div>
      </section>

      <section className="history-sources">
        <h2>Burime të verifikueshme</h2>
        <ul>
          <li>
            <a
              href="https://askdata.rks-gov.net/pxweb/sq/ASKdata/ASKdata__Census%20population__6_Sipas%20vendbanimeve__10%20Popullsia%20e%20komun%C3%ABs%20s%C3%AB%20Kamenic%C3%ABs%20sipas%20vendbanimit/PopSex10.px/"
              target="_blank"
              rel="noreferrer"
            >
              Agjencia e Statistikave të Kosovës · Popullsia sipas vendbanimit, 2011 dhe 2024 ↗
            </a>
          </li>
          <li>
            <a href="https://dtk.rks-gov.net/Objekti?heritageId=3904" target="_blank" rel="noreferrer">
              Databaza e Trashëgimisë Kulturore · Kalaja e antikitetit të vonë në Topanicë ↗
            </a>
          </li>
          <li>
            <a href="https://www.mkrs-ks.org/repository/docs/5367_02.pdf" target="_blank" rel="noreferrer">
              MKRS · Lista e trashëgimisë kulturore për mbrojtje të përhershme · nr. unik 1197 ↗
            </a>
          </li>
          <li>
            <a
              href="https://sam24.info/shoqata-topanica-model-i-unitetit-dhe-perkushtimit-per-vendlindjen/"
              target="_blank"
              rel="noreferrer"
            >
              SAM24.info, Intervistë e Shoqatës Topanica, 30 maj 2025 ↗
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
