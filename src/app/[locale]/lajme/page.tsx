import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { pickMessages } from "@/i18n/messages";
import { routing } from "@/i18n/routing";
import { getLocalizedArticles } from "@/lib/db/content";
import { isAdmin } from "@/lib/auth";
import { NewsArchive } from "@/components/NewsArchive";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "News" });
  return buildPageMetadata({
    locale,
    route: "/lajme",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const [t, allMessages, articles, isAdministrator] = await Promise.all([
    getTranslations({ locale, namespace: "News" }),
    getMessages({ locale }),
    getLocalizedArticles(locale, { status: "published" }),
    isAdmin(),
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
          Categories: true,
          News: [
            "filterAll",
            "filterAria",
            "originalLanguageBadge",
            "editShort",
            "readArticleAria",
            "emptyCategory",
          ],
        })}
      >
        <NewsArchive articles={articles} isAdmin={isAdministrator} />
      </NextIntlClientProvider>
    </div>
  );
}
