import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { pickMessages } from "@/i18n/messages";
import { routing } from "@/i18n/routing";
import { PhotoDropzone } from "@/components/PhotoDropzone";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "Contribute" });
  return buildPageMetadata({
    locale,
    route: "/kontribuo",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function ContributePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const [t, allMessages, { sent, error }] = await Promise.all([
    getTranslations({ locale, namespace: "Contribute" }),
    getMessages({ locale }),
    searchParams,
  ]);

  return (
    <div className="page-shell wrap contribute-page">
      <div className="page-intro">
        <p className="section-kicker">{t("pageKicker")}</p>
        <h1>{t("pageHeading")}</h1>
        <p>{t("pageDescription")}</p>
      </div>

      {sent === "1" && (
        <p className="success-note" role="status">
          {t("sentSuccess")}
        </p>
      )}
      {error && (
        <p className="admin-error" role="alert">
          {error === "invalid" ? t("errorInvalid") : t("errorUnavailable")}
        </p>
      )}

      <div className="contribution-card">
        <form className="contribution-form" action="/api/submissions" method="post">
          <input type="hidden" name="locale" value={locale} />
          <label>
            {t("nameLabel")}
            <input name="sender_name" autoComplete="name" required maxLength={120} />
          </label>
          <label>
            {t("contactLabel")} <span>{t("optional")}</span>
            <input name="sender_contact" autoComplete="email" maxLength={240} placeholder={t("contactPlaceholder")} />
          </label>
          <label>
            {t("typeLabel")}
            <select name="type" required defaultValue="histori">
              <option value="histori">{t("typeHistory")}</option>
              <option value="foto">{t("typePhoto")}</option>
              <option value="lajm">{t("typeNews")}</option>
            </select>
          </label>
          <label>
            {t("messageLabel")}
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={6000}
              rows={7}
              placeholder={t("messagePlaceholder")}
            />
          </label>
          <NextIntlClientProvider
            locale={locale}
            messages={pickMessages(allMessages, { Dropzone: true })}
          >
            <PhotoDropzone name="image_urls" multiple label={t("photosLabel")} />
          </NextIntlClientProvider>
          <label>
            {t("attachmentLabel")} <span>{t("attachmentHint")}</span>
            <input name="attachment_url" type="url" maxLength={2000} placeholder="https://" />
          </label>
          <label className="honeypot" aria-hidden="true">
            {t("honeypotLabel")}
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <p className="form-note">{t("formNote")}</p>
          <button className="button button-dark" type="submit">
            {t("submitButton")} <span aria-hidden="true">↗</span>
          </button>
        </form>
      </div>
    </div>
  );
}
