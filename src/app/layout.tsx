import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Topanicë — histori, jetë dhe kujtesë", template: "%s — Topanicë" },
  description: "Portali i komunitetit dhe trashëgimisë së fshatit Topanicë, Komuna e Kamenicës, Kosovë.",
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sq"><body><SiteHeader /><main>{children}</main><SiteFooter /></body></html>;
}
