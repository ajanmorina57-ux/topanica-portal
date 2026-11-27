import NextLink from "next/link";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GLOBAL_CLIENT_MESSAGES, pickMessages } from "@/i18n/messages";
import sqMessages from "../../messages/sq.json";
import "./globals.css";

const notFoundClientMessages = pickMessages(sqMessages as AbstractIntlMessages, GLOBAL_CLIENT_MESSAGES);

export default function RootNotFound() {
  const t = sqMessages.NotFound;

  return (
    <html lang="sq">
      <body>
        <NextIntlClientProvider locale="sq" messages={notFoundClientMessages}>
          <SiteHeader />
          <main>
            <div className="not-found">
              <p className="section-kicker">{t.kicker}</p>
              <h1>{t.heading}</h1>
              <p>{t.body}</p>
              <NextLink className="button button-dark" href="/sq">
                {t.backHome} <span aria-hidden="true">↗</span>
              </NextLink>
            </div>
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
