import type { Metadata } from "next";
import { safeQuery } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import type { Article } from "@/lib/models";
import { NewsArchive } from "@/components/NewsArchive";
const title = "Lajme";
const description = "Njoftime, iniciativa dhe rrëfime nga jeta e përditshme e fshatit Topanicë dhe Komunës së Kamenicës.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/lajme" },
  openGraph: { title: `${title} — Topanicë`, description, url: "/lajme" },
};
export const dynamic = "force-dynamic";
export default async function NewsPage() {
  const [articles, isAdministrator] = await Promise.all([
    safeQuery<Article>("SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC"),
    isAdmin(),
  ]);
  return <div className="page-shell wrap"><div className="page-intro"><p className="section-kicker">Jeta e përditshme dhe zhvillimi</p><h1>Lajme nga Topanica</h1><p>Njoftime, iniciativa dhe rrëfime që lidhen me fshatin e njerëzit e tij.</p></div><NewsArchive articles={articles} isAdmin={isAdministrator} /></div>;
}
