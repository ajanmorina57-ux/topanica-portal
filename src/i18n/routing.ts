import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sq", "en", "de"] as const,
  defaultLocale: "sq",
  localePrefix: "always",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/lajme": {
      sq: "/lajme",
      en: "/news",
      de: "/nachrichten",
    },
    "/lajme/[slug]": {
      sq: "/lajme/[slug]",
      en: "/news/[slug]",
      de: "/nachrichten/[slug]",
    },
    "/historia": {
      sq: "/historia",
      en: "/history",
      de: "/geschichte",
    },
    "/galeria": {
      sq: "/galeria",
      en: "/gallery",
      de: "/galerie",
    },
    "/kontribuo": {
      sq: "/kontribuo",
      en: "/contribute",
      de: "/mitmachen",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
