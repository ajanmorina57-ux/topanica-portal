import Link from "next/link";
import Image from "next/image";
import { safeQuery } from "@/lib/db";
import type { Article, HistoryEntry } from "@/lib/models";
import { ArticleList } from "@/components/ArticleList";
import { PlaceIllustration } from "@/components/PlaceIllustration";
import { HeroSequence, Reveal } from "@/components/Motion";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const [news, municipalNews, history] = await Promise.all([
    safeQuery<Article>("SELECT * FROM articles WHERE status='published' AND category='topanice' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 4"),
    safeQuery<Article>("SELECT * FROM articles WHERE status='published' AND category='komuna' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 3"),
    safeQuery<HistoryEntry>("SELECT * FROM history_entries WHERE title='Lisi i Kungullarit' ORDER BY sort_order ASC, id ASC LIMIT 1"),
  ]);
  const feature = history[0];
  return <>
    <section className="hero wrap">
      <HeroSequence className="hero-copy"><p className="hero-place">Fshati Topanicë · Komuna e Kamenicës · Anamoravë</p><h1>Një vend. Shumë kujtime.</h1><p className="hero-deck">Një hapësirë e përbashkët për jetën, historinë dhe njerëzit e Topanicës — kudo që janë.</p><div className="hero-actions"><Link className="button button-dark" href="/historia">Njih fshatin <span aria-hidden="true">↗</span></Link><a className="text-link" href="https://www.openstreetmap.org/?mlat=42.52944&mlon=21.62639#map=15/42.52944/21.62639" target="_blank" rel="noreferrer">Shiko në hartë ↗</a></div></HeroSequence>
      <Reveal className="hero-art" delay={0.18}><PlaceIllustration /><span className="art-caption">Ilustrim · Anamoravë</span><span className="art-coordinate">42°31′46″N&nbsp; 21°37′35″E</span></Reveal>
    </section>
    <section className="fact-band"><Reveal className="wrap fact-grid" delay={0.1}><div><strong>1,286</strong><span>banorë më 2024</span></div><div><strong>Kamenicë</strong><span>komuna · Dardanë · Rajoni i Gjilanit</span></div><div><strong>Gradec</strong><span>lokalitet arkeologjik</span></div><div><strong>Gjithandej</strong><span>një lidhje me mërgatën</span></div></Reveal></section>
    <section className="section wrap news-section"><div className="section-heading"><div><p className="section-kicker">Nga fshati dhe për fshatin</p><h2>Lajmet nga Topanicë</h2></div><Link className="text-link" href="/lajme">Të gjitha lajmet <span aria-hidden="true">↗</span></Link></div><ArticleList articles={news} /></section>
    <section className="municipal-strip"><div className="wrap"><div className="section-heading"><div><p className="section-kicker">Njoftime lokale</p><h2>Nga Komuna e Kamenicës</h2></div><a className="text-link" href="https://kamenice.rks-gov.net/" target="_blank" rel="noreferrer">Faqja zyrtare e komunës ↗</a></div>{municipalNews.length ? <ArticleList articles={municipalNews} /> : <p className="municipal-note">Për njoftimet më të fundit komunale, vizitoni faqen zyrtare të Komunës së Kamenicës.</p>}</div></section>
    <section className="history-feature"><div className="wrap history-feature-inner"><div className="history-index"><span>Trashëgimia natyrore</span><span>Simbol i Shoqatës Topanica</span></div><div className="history-feature-copy"><h2>{feature?.title ?? "Lisi i Kungullarit"}</h2><p>{feature?.content ?? "Në një intervistë të Shoqatës Topanica, lisi i vetmuar që shfaqet në logon e shoqatës përshkruhet si mbi 100-vjeçar. Mosha përcillet si rrëfim i komunitetit."}</p><Link className="text-link" href="/historia">Lexo historinë <span aria-hidden="true">↗</span></Link></div><Image className="home-oak-mark" src="/logo.png" alt="Emblema e lisit të Shoqatës Topanica" width={396} height={331} /></div></section>
    <section className="diaspora-section wrap"><div><p className="section-kicker">Kujtimet bëhen trashëgimi</p><h2>Një histori juaj<br />është histori e jona.</h2></div><div className="diaspora-copy"><p>Jetoni larg? Keni një fotografi të vjetër, një rrëfim familjar apo një lajm për fshatin? Ndihmoni që kujtesa e Topanicës të ruhet dhe të ndahet me të gjithë.</p><Link className="button button-light" href="/kontribuo">Ndaj me ne <span aria-hidden="true">↗</span></Link></div></section>
    <section className="sources-note wrap"><p>Të dhënat e popullsisë: ASK, regjistrimet 2011 dhe 2024. Lokaliteti arkeologjik: Regjistri i Trashëgimisë Kulturore të Kosovës.</p><Link href="/historia">Burimet dhe shënimet <span aria-hidden="true">↗</span></Link></section>
  </>;
}
