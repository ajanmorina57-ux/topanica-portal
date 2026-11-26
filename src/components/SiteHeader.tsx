import Link from "next/link";
import Image from "next/image";
import { HeaderNav } from "@/components/HeaderNav";

export function SiteHeader() {
  return (
    <header className="site-header wrap">
      <Link className="wordmark" href="/" aria-label="Topanica, ballina">
        <Image className="wordmark-logo" src="/logo.png" alt="" width={396} height={331} sizes="52px" loading="eager" />
        <span className="brand-copy">
          <strong>Topanica</strong>
          <small>Anamoravë · Kamenicë</small>
        </span>
      </Link>
      <HeaderNav />
      <Link className="nav-action" href="/kontribuo">
        Ndani me ne <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}
