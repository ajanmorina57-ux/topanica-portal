import type { Locale } from "@/lib/models";

export const CATEGORIES = ["topanice", "komuna", "zhvillim", "mergata"] as const;
export const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  topanice: "Topanicë",
  zhvillim: "Zhvillim",
  komuna: "Komuna",
  mergata: "Mërgata",
};

export const GALLERY_CATEGORIES = ["arkiv", "natyre", "fshati"] as const;
export const GALLERY_LABELS: Record<(typeof GALLERY_CATEGORIES)[number], string> = {
  arkiv: "Arkiv",
  natyre: "Natyrë",
  fshati: "Fshati",
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  manual: "Manual",
  rss: "Burim RSS",
  tavily: "Kërkim lajmesh",
  facebook_import: "Facebook",
};

export const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  histori: "Histori",
  foto: "Fotografi",
  lajm: "Lajm",
};

const MONTHS_BY_LOCALE: Record<Locale, readonly string[]> = {
  sq: [
    "janar",
    "shkurt",
    "mars",
    "prill",
    "maj",
    "qershor",
    "korrik",
    "gusht",
    "shtator",
    "tetor",
    "nëntor",
    "dhjetor",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  de: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
};

const NUMERIC_DATE_PARTS = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "Europe/Belgrade",
});

/** Formats a date deterministically in Albanian, English, or German across SSR and browser ICU locales. */
export function formatDate(value: string | Date | null, locale: Locale = "sq") {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = NUMERIC_DATE_PARTS.formatToParts(date);
  const day = Number(parts.find((p) => p.type === "day")?.value || "0");
  const month = Number(parts.find((p) => p.type === "month")?.value || "0");
  const year = parts.find((p) => p.type === "year")?.value || "";
  const months = MONTHS_BY_LOCALE[locale] ?? MONTHS_BY_LOCALE.sq;
  const monthName = months[month - 1];
  if (!day || !monthName || !year) return "";

  return locale === "de" ? `${day}. ${monthName} ${year}` : `${day} ${monthName} ${year}`;
}

const GENERIC_COVER_PATTERNS = [
  /news\.google\.com/i,
  /lh3\.googleusercontent\.com\/J6_coFbogxhRI9iM864NL_liGXvsQp2/i,
  /gstatic\.com/i,
  /favicon\.(ico|png|svg)/i,
];

/** Returns true only when an article cover URL points to a real article photo rather than an aggregator logo. */
export function isValidArticleCover(url?: string | null): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return !GENERIC_COVER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("sq-XK")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}
