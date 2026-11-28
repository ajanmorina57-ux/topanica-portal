import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { GLOBAL_CLIENT_MESSAGES, pickMessages } from "@/i18n/messages";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSiteUrl } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { DEFAULT_OG_IMAGE, getAlternateOgLocales, OG_LOCALES } from "@/lib/seo";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteTitle = t("siteTitle");
  const siteDescription = t("siteDescription");
  const ogAlt = t("ogAlt");

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: siteTitle, template: t("titleTemplate") },
    description: siteDescription,
    openGraph: {
      type: "website",
      locale: OG_LOCALES[locale],
      alternateLocale: getAlternateOgLocales(locale),
      siteName: "Topanica",
      title: siteTitle,
      description: siteDescription,
      images: [{ ...DEFAULT_OG_IMAGE, alt: ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [{ url: DEFAULT_OG_IMAGE.url, alt: ogAlt }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const allMessages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={pickMessages(allMessages, GLOBAL_CLIENT_MESSAGES)}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
