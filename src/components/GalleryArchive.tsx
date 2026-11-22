"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { GalleryPhoto } from "@/lib/models";
import { GALLERY_CATEGORIES, GALLERY_LABELS } from "@/lib/site";
import { Reveal } from "@/components/Motion";

const filters = [["all", "Të gjitha"], ...GALLERY_CATEGORIES.map((category) => [category, GALLERY_LABELS[category]] as const)] as const;
const calmEase = [0.22, 1, 0.36, 1] as const;

export function GalleryArchive({ photos }: { photos: GalleryPhoto[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const isOpen = selectedIndex !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const visible = useMemo(() => photos.filter((photo) => filter === "all" || photo.category === filter), [photos, filter]);
  const selected = selectedIndex === null ? null : visible[selectedIndex] ?? null;

  useEffect(() => {
    if (!isOpen) return;
    const closeOnKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setSelectedIndex(null); }
      else if (event.key === "ArrowRight") { event.preventDefault(); setSelectedIndex((index) => index === null ? null : (index + 1) % visible.length); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); setSelectedIndex((index) => index === null ? null : (index - 1 + visible.length) % visible.length); }
    };
    window.addEventListener("keydown", closeOnKey);
    return () => window.removeEventListener("keydown", closeOnKey);
  }, [isOpen, visible.length]);

  useEffect(() => {
    if (!isOpen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = oldOverflow;
      returnFocusRef.current?.focus();
    };
  }, [isOpen]);

  function openPhoto(index: number) {
    returnFocusRef.current = document.activeElement as HTMLElement;
    setSelectedIndex(index);
  }

  return <>
    <LayoutGroup id="gallery-filters">
      <div className="filter-row" aria-label="Filtro galerinë">
        {filters.map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? "filter-button active" : "filter-button"} onClick={() => { setFilter(value); setSelectedIndex(null); }}>
          {label}{filter === value && <motion.span className="filter-indicator" layoutId="gallery-filter-indicator" transition={{ duration: 0.34, ease: calmEase }} />}
        </button>)}
      </div>
    </LayoutGroup>
    {visible.length ? <div className="gallery-grid">{visible.map((photo, index) => <Reveal className="gallery-reveal" delay={index % 6 * 0.045} key={photo.id}>
      <motion.button type="button" className="gallery-item" onClick={() => openPhoto(index)} aria-label={`Hap fotografinë ${photo.title}`} whileHover={reduce ? undefined : { color: "var(--green)" }} transition={{ duration: 0.3, ease: calmEase }}>
        <span className="gallery-image-frame"><motion.span className="gallery-image-motion" whileHover={reduce ? undefined : { scale: 1.02 }} transition={{ duration: 0.45, ease: calmEase }}><Image src={photo.image_url} alt={photo.title} width={1200} height={900} unoptimized loading="lazy" /></motion.span></span>
        <span>{photo.title}{photo.year_taken ? ` · ${photo.year_taken}` : ""}</span>
      </motion.button>
    </Reveal>)}</div> : <div className="gallery-empty"><p>Arkivi fotografik po nis me kujtimet tuaja.</p><p>Fotografi të Topanicës nga familjet, rrugët dhe peizazhi i fshatit do ta pasurojnë këtë galeri.</p></div>}

    <AnimatePresence>
      {selected && <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={selected.title} tabIndex={-1}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.01 : 0.24, ease: calmEase }}
        onClick={(event) => { if (event.target === event.currentTarget) setSelectedIndex(null); }}>
        <button ref={closeRef} type="button" className="lightbox-close" aria-label="Mbyll fotografinë" onClick={() => setSelectedIndex(null)}>×</button>
        {visible.length > 1 && <button type="button" className="lightbox-nav lightbox-prev" aria-label="Fotografia e mëparshme" onClick={() => setSelectedIndex((index) => index === null ? null : (index - 1 + visible.length) % visible.length)}>←</button>}
        <motion.div key={selected.id} className="lightbox-image" initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }} transition={{ duration: reduce ? 0.01 : 0.35, ease: calmEase }}><Image src={selected.image_url} alt={selected.title} width={1800} height={1350} unoptimized /></motion.div>
        {visible.length > 1 && <button type="button" className="lightbox-nav lightbox-next" aria-label="Fotografia tjetër" onClick={() => setSelectedIndex((index) => index === null ? null : (index + 1) % visible.length)}>→</button>}
        <p>{selected.title}{selected.year_taken ? ` · ${selected.year_taken}` : ""}{selected.credit ? ` · ${selected.credit}` : ""}</p>
      </motion.div>}
    </AnimatePresence>
  </>;
}
