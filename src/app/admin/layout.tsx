import type { Metadata } from "next";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ADMIN_CLIENT_MESSAGES, pickMessages } from "@/i18n/messages";
import { getSiteUrl } from "@/lib/site";
import sqMessages from "../../../messages/sq.json";
import "../globals.css";

const siteTitle = "Topanicë — histori, jetë dhe kujtesë";
const siteDescription = "Portali i komunitetit dhe trashëgimisë së fshatit Topanicë, Komuna e Kamenicës, Kosovë.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: siteTitle, template: "%s — Topanicë" },
  description: siteDescription,
  robots: { index: false, follow: false },
};

const adminMessages = pickMessages(sqMessages as AbstractIntlMessages, ADMIN_CLIENT_MESSAGES);

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq">
      <body>
        <NextIntlClientProvider locale="sq" messages={adminMessages}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
