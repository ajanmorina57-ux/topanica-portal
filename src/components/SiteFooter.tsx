import NextLink from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <Image className="footer-logo" src="/logo.png" alt="" width={396} height={331} sizes="64px" />
          <div>
            <strong>{t("brandName")}</strong>
            <span>{t("brandSub")}</span>
          </div>
        </div>
        <p>
          {t("taglineLine1")}
          <br />
          {t("taglineLine2")}
        </p>
        <div className="footer-links">
          <Link href="/historia">{t("linkHistory")}</Link>
          <Link href="/galeria">{t("linkGallery")}</Link>
          <Link href="/kontribuo">{t("linkContribute")}</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>{t("location")}</span>
        <NextLink href="/admin/login">{t("adminLink")}</NextLink>
      </div>
    </footer>
  );
}
