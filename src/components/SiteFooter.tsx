import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="wrap footer-main"><div className="footer-brand"><Image className="footer-logo" src="/logo.png" alt="" width={396} height={331} /><div><strong>TOPANICA</strong><span>HISTORI · LAJME · MËRGATA</span><span>1434</span></div></div><p>Një kujtesë e përbashkët,<br />një fshat që vazhdon të jetojë.</p>
      <div className="footer-links"><Link href="/historia">Historia</Link><Link href="/galeria">Galeria</Link><Link href="/kontribuo">Dërgo një kujtim</Link></div>
    </div>
    <div className="wrap footer-bottom"><span>Topanicë · Kamenicë · Kosovë</span><Link href="/admin/login">Administrimi</Link></div>
  </footer>;
}
