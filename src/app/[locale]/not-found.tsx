import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="not-found">
      <p className="section-kicker">{t("kicker")}</p>
      <h1>{t("heading")}</h1>
      <p>{t("body")}</p>
      <Link className="button button-dark" href="/">
        {t("backHome")} <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
