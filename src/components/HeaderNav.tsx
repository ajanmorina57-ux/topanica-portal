"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Lajme", "/lajme"],
  ["Historia", "/historia"],
  ["Galeria", "/galeria"],
] as const;

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigimi kryesor">
      <ul>
        {links.map(([label, href]) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={isActive ? "active" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
