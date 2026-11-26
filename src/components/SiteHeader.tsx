import Link from "next/link";
import Image from "next/image";

const links = [["Lajme", "/lajme"], ["Historia", "/historia"], ["Galeria", "/galeria"]];
export function SiteHeader() {
  return <header className="site-header wrap">
    <Link className="wordmark" href="/" aria-label="Topanicë, ballina"><Image className="wordmark-logo" src="/logo.png" alt="" width={396} height={331} priority /><span className="brand-copy"><strong>Topanica</strong><small>Histori, lajme dhe mërgata · 1434</small></span></Link>
    <nav aria-label="Navigimi kryesor"><ul>{links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></nav>
    <Link className="nav-action" href="/kontribuo">Ndaj me ne <span aria-hidden="true">↗</span></Link>
  </header>;
}
