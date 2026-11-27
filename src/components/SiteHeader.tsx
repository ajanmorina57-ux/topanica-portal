import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeaderNav } from "@/components/HeaderNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function SiteHeader() {
  const t = useTranslations("Header");

  return (
    <header className="site-header wrap">
      <Link className="wordmark" href="/" aria-label={t("wordmarkAria")}>
        <Image className="wordmark-logo" src="/logo.png" alt="" width={396} height={331} sizes="52px" loading="eager" />
        <span className="brand-copy">
          <strong>{t("brandName")}</strong>
          <small>{t("brandSub")}</small>
        </span>
      </Link>
      <HeaderNav />
      <div className="header-actions">
        <LanguageSwitcher />
        <Link className="nav-action" href="/kontribuo">
          {t("navContribute")} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
