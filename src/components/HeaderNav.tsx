"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { key: "navNews", href: "/lajme" },
  { key: "navHistory", href: "/historia" },
  { key: "navGallery", href: "/galeria" },
] as const;

export function HeaderNav() {
  const pathname = usePathname();
  const t = useTranslations("Header");

  return (
    <nav className="main-nav" aria-label={t("navAria")}>
      <ul>
        {links.map(({ key, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={isActive ? "active" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
