import type { Metadata } from "next";
import { safeQuery } from "@/lib/db";
import type { GalleryPhoto } from "@/lib/models";
import { GalleryArchive } from "@/components/GalleryArchive";
export const metadata: Metadata = { title: "Galeria" };
export const dynamic = "force-dynamic";
export default async function GalleryPage() {
  const photos = await safeQuery<GalleryPhoto>("SELECT * FROM gallery_photos ORDER BY year_taken DESC NULLS LAST, created_at DESC");
  return <div className="page-shell wrap"><div className="page-intro"><p className="section-kicker">Një arkiv i përbashkët</p><h1>Galeria e Topanicës</h1><p>Fotografi nga arkivat familjare, natyra përreth dhe jeta e fshatit.</p></div><GalleryArchive photos={photos} /><div className="gallery-contribute"><p>Ruani një fotografi të Topanicës?</p><a className="text-link" href="/kontribuo">Dërgoni lidhjen dhe të dhënat e saj ↗</a></div></div>;
}
