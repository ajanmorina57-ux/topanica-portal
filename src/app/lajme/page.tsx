import type { Metadata } from "next";
import { safeQuery } from "@/lib/db";
import type { Article } from "@/lib/models";
import { NewsArchive } from "@/components/NewsArchive";
export const metadata: Metadata = { title: "Lajme" };
export const dynamic = "force-dynamic";
export default async function NewsPage() {
  const articles = await safeQuery<Article>("SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC");
  return <div className="page-shell wrap"><div className="page-intro"><p className="section-kicker">Jeta e përditshme dhe zhvillimi</p><h1>Lajme nga Topanica</h1><p>Njoftime, iniciativa dhe rrëfime që lidhen me fshatin e njerëzit e tij.</p></div><NewsArchive articles={articles} /></div>;
}
