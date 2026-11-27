import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { pickMessages } from "@/i18n/messages";
import { routing } from "@/i18n/routing";
import { getLocalizedGalleryPhotos } from "@/lib/db/content";
import { GalleryArchive } from "@/components/GalleryArchive";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "Gallery" });
  return buildPageMetadata({
    locale,
    route: "/galeria",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const [t, allMessages, photos] = await Promise.all([
    getTranslations({ locale, namespace: "Gallery" }),
    getMessages({ locale }),
    getLocalizedGalleryPhotos(locale),
  ]);

  return (
    <div className="page-shell wrap">
      <div className="page-intro">
        <p className="section-kicker">{t("pageKicker")}</p>
        <h1>{t("pageHeading")}</h1>
        <p>{t("pageDescription")}</p>
      </div>
      <NextIntlClientProvider
        locale={locale}
        messages={pickMessages(allMessages, {
          GalleryCategories: true,
          Gallery: [
            "filterAll",
            "filterAria",
            "openPhotoAria",
            "emptyCategoryTitle",
            "emptyCategoryBody",
            "emptyAllTitle",
            "emptyAllBody",
            "closeAria",
            "prevAria",
            "nextAria",
          ],
        })}
      >
        <GalleryArchive photos={photos} />
      </NextIntlClientProvider>
      <div className="gallery-contribute">
        <p>{t("contributePrompt")}</p>
        <Link className="text-link" href="/kontribuo">
          {t("contributeLink")} ↗
        </Link>
      </div>
    </div>
  );
}
