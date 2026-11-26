import type { Metadata } from "next";
import Link from "next/link";
import { safeQuery } from "@/lib/db";
import type { GalleryPhoto } from "@/lib/models";
import { GalleryArchive } from "@/components/GalleryArchive";

const title = "Galeria";
const description = "Arkivi fotografik i Topanicës — fotografi nga arkivat familjare, natyra dhe jeta e fshatit.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/galeria" },
  openGraph: { title: `${title} — Topanicë`, description, url: "/galeria" },
};
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const photos = await safeQuery<GalleryPhoto>(
    "SELECT * FROM gallery_photos ORDER BY year_taken DESC NULLS LAST, created_at DESC",
  );
  return (
    <div className="page-shell wrap">
      <div className="page-intro">
        <p className="section-kicker">Një arkiv i përbashkët</p>
        <h1>Galeria e Topanicës</h1>
        <p>Fotografi nga arkivat familjare, natyra përreth dhe jeta e fshatit.</p>
      </div>
      <GalleryArchive photos={photos} />
      <div className="gallery-contribute">
        <p>Ruani një fotografi të Topanicës?</p>
        <Link className="text-link" href="/kontribuo">
          Ngarkoni fotografinë dhe tregoni historinë e saj ↗
        </Link>
      </div>
    </div>
  );
}
