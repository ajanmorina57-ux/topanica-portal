import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { safeQuery } from "@/lib/db";
import type { Article, GalleryPhoto, HistoryEntry } from "@/lib/models";
import { GALLERY_LABELS } from "@/lib/site";
import { ArticleList } from "@/components/ArticleList";
import { PlaceIllustration } from "@/components/PlaceIllustration";
import { HeroSequence } from "@/components/Motion";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [news, municipalNews, history, galleryPhotos] = await Promise.all([
    safeQuery<Article>(
      "SELECT * FROM articles WHERE status='published' AND category='topanice' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 4",
    ),
    safeQuery<Article>(
      "SELECT * FROM articles WHERE status='published' AND category='komuna' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 3",
    ),
    safeQuery<HistoryEntry>(
      "SELECT * FROM history_entries WHERE title='Lisi i Kungullarit' ORDER BY sort_order ASC, id ASC LIMIT 1",
    ),
    safeQuery<GalleryPhoto>(
      "SELECT * FROM gallery_photos ORDER BY CASE category WHEN 'natyre' THEN 0 WHEN 'fshati' THEN 1 ELSE 2 END, year_taken DESC NULLS LAST, created_at DESC LIMIT 6",
    ),
  ]);

  const feature = history[0];
  const heroPhoto = galleryPhotos[0] ?? null;
  const stripPhotos = galleryPhotos.length > 3 ? galleryPhotos.slice(1, 4) : galleryPhotos.slice(0, 3);

  return (
    <>
      <section className="hero wrap">
        <HeroSequence className="hero-copy">
          <p className="hero-place">Fshati Topanicë · Komuna e Kamenicës · Anamoravë</p>
          <h1>Një vend. Shumë kujtime.</h1>
          <p className="hero-deck">
            Një hapësirë e përbashkët për jetën, historinë dhe njerëzit e Topanicës — kudo që janë.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/historia">
              Njihni fshatin <span aria-hidden="true">↗</span>
            </Link>
            <a
              className="text-link"
              href="https://www.openstreetmap.org/?mlat=42.52944&mlon=21.62639#map=15/42.52944/21.62639"
              target="_blank"
              rel="noreferrer"
            >
              Shikoni në hartë ↗
            </a>
          </div>
        </HeroSequence>

        <figure className="hero-plate">
          <div className="hero-plate-photo">
            {heroPhoto ? (
              <Image
                src={heroPhoto.image_url}
                alt={heroPhoto.title}
                width={1200}
                height={750}
                sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1440px) 50vw, 680px"
                className="hero-plate-img"
                priority
                fetchPriority="high"
                unoptimized={heroPhoto.image_url.startsWith("http") || heroPhoto.image_url.startsWith("/api/")}
              />
            ) : (
              <PlaceIllustration className="hero-plate-img" />
            )}
          </div>
          <div className="hero-plate-band" aria-hidden="true">
            <PlaceIllustration className="hero-plate-band-svg" decorative />
          </div>
          <figcaption className="hero-plate-ledger">
            <span className="hero-plate-caption">
              {heroPhoto
                ? `${heroPhoto.title}${heroPhoto.year_taken ? ` · ${heroPhoto.year_taken}` : ""}`
                : "Ilustrim · Anamoravë"}
            </span>
            <span className="hero-plate-coord">42°31′46″N&nbsp; 21°37′35″E</span>
          </figcaption>
        </figure>
      </section>

      <section className="fact-band">
        <div className="wrap fact-grid">
          <div>
            <strong>1 286</strong>
            <span>banorë më 2024</span>
          </div>
          <div>
            <strong>Kamenicë</strong>
            <span>komuna · Dardanë · Rajoni i Gjilanit</span>
          </div>
          <div>
            <strong>Gradec</strong>
            <span>lokalitet arkeologjik</span>
          </div>
          <div>
            <strong>Gjithandej</strong>
            <span>një lidhje me mërgatën</span>
          </div>
        </div>
      </section>

      <section className="section wrap news-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Nga fshati dhe për fshatin</p>
            <h2>Lajmet nga Topanica</h2>
          </div>
          <Link className="text-link" href="/lajme">
            Të gjitha lajmet <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ArticleList articles={news} />
      </section>

      <section className="municipal-strip">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Njoftime lokale</p>
              <h2>Nga Komuna e Kamenicës</h2>
            </div>
            <a className="text-link" href="https://kamenice.rks-gov.net/" target="_blank" rel="noreferrer">
              Faqja zyrtare e komunës ↗
            </a>
          </div>
          {municipalNews.length ? (
            <ArticleList articles={municipalNews} />
          ) : (
            <p className="municipal-note">
              Për njoftimet më të fundit komunale, vizitoni faqen zyrtare të Komunës së Kamenicës.
            </p>
          )}
        </div>
      </section>

      <section className="history-feature">
        <div className="wrap history-feature-inner">
          <div className="history-index">
            <span>Trashëgimia natyrore</span>
            <span>Simbol i Shoqatës Topanica</span>
          </div>
          <div className="history-feature-copy">
            <h2>{feature?.title ?? "Lisi i Kungullarit"}</h2>
            <p>
              {feature?.content ??
                "Në një intervistë të Shoqatës Topanica, lisi i vetmuar në logon e saj përshkruhet si mbi 100-vjeçar. Mosha përcillet si rrëfim i komunitetit."}
            </p>
            <Link className="text-link" href="/historia">
              Lexoni historinë <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="oak-emblem-card">
            <Image
              className="home-oak-mark"
              src="/logo.png"
              alt="Emblema e lisit të Shoqatës Topanica"
              width={396}
              height={331}
              sizes="(max-width: 540px) 180px, 220px"
            />
          </div>
        </div>
      </section>

      {stripPhotos.length > 0 && (
        <section className="home-gallery-strip">
          <div className="wrap">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Dritare në Arkiv</p>
                <h2>Kujtime në fotografi</h2>
              </div>
              <Link className="text-link" href="/galeria">
                Shiko galerinë <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="home-gallery-grid">
              {stripPhotos.map((photo) => (
                <Link key={photo.id} href="/galeria" className="home-gallery-card">
                  <span className="home-gallery-frame">
                    <Image
                      src={photo.image_url}
                      alt={photo.title}
                      width={800}
                      height={600}
                      sizes="(max-width: 540px) calc(100vw - 40px), (max-width: 800px) 46vw, (max-width: 1200px) 31vw, 380px"
                      unoptimized={photo.image_url.startsWith("http") || photo.image_url.startsWith("/api/")}
                    />
                  </span>
                  <span className="home-gallery-meta">
                    <span className="home-gallery-title">{photo.title}</span>
                    <span className="home-gallery-sub">
                      {GALLERY_LABELS[photo.category]}
                      {photo.year_taken ? ` · ${photo.year_taken}` : ""}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="diaspora-section wrap">
        <div>
          <p className="section-kicker">Kujtimet bëhen trashëgimi</p>
          <h2>
            Një histori juaj
            <br />
            është histori e jona.
          </h2>
        </div>
        <div className="diaspora-copy">
          <p>
            Kudo që jetoni — keni një fotografi të vjetër, një rrëfim familjar apo një lajm për fshatin? Ndihmoni që
            kujtesa e Topanicës të ruhet dhe të ndahet me të gjithë.
          </p>
          <Link className="button button-light" href="/kontribuo">
            Ndani me ne <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="sources-note wrap">
        <p>
          Të dhënat e popullsisë: ASK, regjistrimet e viteve 2011 dhe 2024. Lokaliteti arkeologjik: Regjistri i
          Trashëgimisë Kulturore të Kosovës.
        </p>
        <Link href="/historia">
          Burimet dhe shënimet <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
