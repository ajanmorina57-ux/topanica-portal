"use client";

import { Fragment } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/lib/models";

const LOCALE_OPTIONS: ReadonlyArray<{
  locale: Locale;
  labelKey: "sqLabel" | "enLabel" | "deLabel";
  nameKey: "sqName" | "enName" | "deName";
}> = [
  { locale: "sq", labelKey: "sqLabel", nameKey: "sqName" },
  { locale: "en", labelKey: "enLabel", nameKey: "enName" },
  { locale: "de", labelKey: "deLabel", nameKey: "deName" },
];

const STATIC_LOCALIZED_ROUTES = new Set(["/", "/lajme", "/historia", "/galeria", "/kontribuo"]);

type StaticLocalizedRoute = "/" | "/lajme" | "/historia" | "/galeria" | "/kontribuo";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("LanguageSwitcher");
  const pathname = usePathname();
  const params = useParams<{ slug?: string | string[] }>();

  const slug = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : undefined;

  const targetHref =
    pathname === "/lajme/[slug]" && slug
      ? ({ pathname: "/lajme/[slug]", params: { slug } } as const)
      : STATIC_LOCALIZED_ROUTES.has(pathname)
        ? (pathname as StaticLocalizedRoute)
        : ("/" as const);

  return (
    <nav className="lang-switcher" aria-label={t("ariaLabel")}>
      {LOCALE_OPTIONS.map((item, idx) => {
        const isActive = item.locale === locale;
        return (
          <Fragment key={item.locale}>
            {idx > 0 && (
              <span className="lang-sep" aria-hidden="true">
                |
              </span>
            )}
            <Link
              href={targetHref}
              locale={item.locale}
              lang={item.locale}
              hrefLang={item.locale}
              title={t(item.nameKey)}
              aria-current={isActive ? "true" : undefined}
              className={isActive ? "lang-option active" : "lang-option"}
            >
              {t(item.labelKey)}
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
