import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteTitle = "Topanicë — histori, jetë dhe kujtesë";
const siteDescription = "Portali i komunitetit dhe trashëgimisë së fshatit Topanicë, Komuna e Kamenicës, Kosovë.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: siteTitle, template: "%s — Topanicë" },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "sq_XK",
    siteName: "Topanica",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/gallery/topanica-35.webp",
        width: 604,
        height: 453,
        alt: "Fshati Topanicë — Lumi i Shtrembër",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/gallery/topanica-35.webp"],
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sq"><body><SiteHeader /><main>{children}</main><SiteFooter /></body></html>;
}
