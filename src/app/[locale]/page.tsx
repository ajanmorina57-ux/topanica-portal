import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  getLocalizedArticles,
  getLocalizedGalleryPhotos,
  getLocalizedHistoryEntries,
} from "@/lib/db/content";
import { ArticleList } from "@/components/ArticleList";
import { PlaceIllustration } from "@/components/PlaceIllustration";
import { HeroSequence } from "@/components/Motion";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const tMeta = await getTranslations({ locale, namespace: "Metadata" });
  return buildPageMetadata({
    locale,
    route: "/",
    title: tMeta("siteTitle"),
    description: tMeta("siteDescription"),
    isHome: true,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const [t, tGalleryCat, news, municipalNews, history, galleryPhotos] = await Promise.all([
    getTranslations({ locale, namespace: "Home" }),
    getTranslations({ locale, namespace: "GalleryCategories" }),
    getLocalizedArticles(locale, { status: "published", category: "topanice", limit: 4 }),
    getLocalizedArticles(locale, { status: "published", category: "komuna", limit: 3 }),
    getLocalizedHistoryEntries(locale, { title: "Lisi i Kungullarit", limit: 1 }),
    getLocalizedGalleryPhotos(locale, { homeOrder: true, limit: 6 }),
  ]);

  const feature = history[0];
  const heroPhoto = galleryPhotos[0] ?? null;
  const stripPhotos = galleryPhotos.length > 3 ? galleryPhotos.slice(1, 4) : galleryPhotos.slice(0, 3);

  return (
    <>
      <section className="hero wrap">
        <HeroSequence className="hero-copy">
          <p className="hero-place">{t("heroPlace")}</p>
          <h1>{t("heroTitle")}</h1>
          <p className="hero-deck">{t("heroDeck")}</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/historia">
              {t("heroCta")} <span aria-hidden="true">↗</span>
            </Link>
            <a
              className="text-link"
              href="https://www.openstreetmap.org/?mlat=42.52944&mlon=21.62639#map=15/42.52944/21.62639"
              target="_blank"
              rel="noreferrer"
            >
              {t("heroMapLink")} ↗
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
            <span className="hero-plate-caption" lang={heroPhoto?.translation_missing ? "sq" : undefined}>
              {heroPhoto
                ? `${heroPhoto.title}${heroPhoto.year_taken ? ` · ${heroPhoto.year_taken}` : ""}`
                : t("heroFallbackCaption")}
            </span>
            <span className="hero-plate-coord">42°31′46″N&nbsp; 21°37′35″E</span>
          </figcaption>
        </figure>
      </section>

      <section className="fact-band">
        <div className="wrap fact-grid">
          <div>
            <strong>{t("factPopulationValue")}</strong>
            <span>{t("factPopulationLabel")}</span>
          </div>
          <div>
            <strong>{t("factMunicipalityValue")}</strong>
            <span>{t("factMunicipalityLabel")}</span>
          </div>
          <div>
            <strong>{t("factArchaeologyValue")}</strong>
            <span>{t("factArchaeologyLabel")}</span>
          </div>
          <div>
            <strong>{t("factDiasporaValue")}</strong>
            <span>{t("factDiasporaLabel")}</span>
          </div>
        </div>
      </section>

      <section className="section wrap news-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{t("newsKicker")}</p>
            <h2>{t("newsHeading")}</h2>
          </div>
          <Link className="text-link" href="/lajme">
            {t("newsAllLink")} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ArticleList articles={news} />
      </section>

      <section className="municipal-strip">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{t("municipalKicker")}</p>
              <h2>{t("municipalHeading")}</h2>
            </div>
            <a className="text-link" href="https://kamenice.rks-gov.net/" target="_blank" rel="noreferrer">
              {t("municipalLink")} ↗
            </a>
          </div>
          {municipalNews.length ? (
            <ArticleList articles={municipalNews} />
          ) : (
            <p className="municipal-note">{t("municipalEmpty")}</p>
          )}
        </div>
      </section>

      <section className="history-feature">
        <div className="wrap history-feature-inner">
          <div className="history-index">
            <span>{t("historyIndexLeft")}</span>
            <span>{t("historyIndexRight")}</span>
          </div>
          <div className="history-feature-copy" lang={feature?.translation_missing ? "sq" : undefined}>
            <h2>{feature?.title ?? t("oakFallbackTitle")}</h2>
            <p>{feature?.content ?? t("oakFallbackBody")}</p>
            <Link className="text-link" href="/historia">
              {t("oakReadMore")} <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="oak-emblem-card">
            <Image
              className="home-oak-mark"
              src="/logo.png"
              alt={t("oakEmblemAlt")}
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
                <p className="section-kicker">{t("galleryKicker")}</p>
                <h2>{t("galleryHeading")}</h2>
              </div>
              <Link className="text-link" href="/galeria">
                {t("galleryLink")} <span aria-hidden="true">↗</span>
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
                    <span className="home-gallery-title" lang={photo.translation_missing ? "sq" : undefined}>
                      {photo.title}
                    </span>
                    <span className="home-gallery-sub">
                      {tGalleryCat(photo.category)}
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
          <p className="section-kicker">{t("diasporaKicker")}</p>
          <h2>
            {t("diasporaHeadingLine1")}
            <br />
            {t("diasporaHeadingLine2")}
          </h2>
        </div>
        <div className="diaspora-copy">
          <p>{t("diasporaBody")}</p>
          <Link className="button button-light" href="/kontribuo">
            {t("diasporaCta")} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="sources-note wrap">
        <p>{t("sourcesNote")}</p>
        <Link href="/historia">
          {t("sourcesLink")} <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
