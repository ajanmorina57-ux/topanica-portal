"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { GalleryPhoto } from "@/lib/models";
import { GALLERY_CATEGORIES } from "@/lib/site";

type GalleryItem = GalleryPhoto & { translation_missing?: boolean };

export function GalleryArchive({ photos }: { photos: GalleryItem[] }) {
  const t = useTranslations("Gallery");
  const tCat = useTranslations("GalleryCategories");
  const [filter, setFilter] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isOpen = selectedIndex !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const filters = useMemo(
    () =>
      [
        ["all", t("filterAll")],
        ...GALLERY_CATEGORIES.map((category) => [category, tCat(category)] as const),
      ] as const,
    [t, tCat],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: photos.length };
    for (const category of GALLERY_CATEGORIES) map[category] = 0;
    for (const photo of photos) {
      map[photo.category] = (map[photo.category] ?? 0) + 1;
    }
    return map;
  }, [photos]);

  const visible = useMemo(
    () => photos.filter((photo) => filter === "all" || photo.category === filter),
    [photos, filter],
  );
  const selected = selectedIndex === null ? null : (visible[selectedIndex] ?? null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedIndex(null);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedIndex((index) => (index === null ? null : (index + 1) % visible.length));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedIndex((index) => (index === null ? null : (index - 1 + visible.length) % visible.length));
      }
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

  return (
    <>
      <div className="filter-row" aria-label={t("filterAria")}>
        {filters.map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            className={filter === value ? "filter-button active" : "filter-button"}
            onClick={() => {
              setFilter(value);
              setSelectedIndex(null);
            }}
          >
            <span>{label}</span>
            <span className="filter-count">{counts[value] ?? 0}</span>
            {filter === value && <span className="filter-indicator" aria-hidden="true" />}
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="gallery-grid">
          {visible.map((photo, index) => (
            <div className="gallery-reveal" key={photo.id}>
              <button
                type="button"
                className="gallery-item"
                onClick={() => openPhoto(index)}
                aria-label={t("openPhotoAria", { title: photo.title })}
              >
                <span className="gallery-image-frame">
                  <Image
                    src={photo.image_url}
                    alt={photo.title}
                    width={1200}
                    height={900}
                    sizes="(max-width: 540px) calc(100vw - 40px), (max-width: 800px) 46vw, (max-width: 1200px) 31vw, 380px"
                    unoptimized={photo.image_url.startsWith("http") || photo.image_url.startsWith("/api/")}
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : undefined}
                    loading={index === 0 ? undefined : index < 3 ? "eager" : "lazy"}
                  />
                </span>
                <span className="gallery-card-caption">
                  <span className="gallery-card-title" lang={photo.translation_missing ? "sq" : undefined}>
                    {photo.title}
                  </span>
                  <span className="gallery-card-meta">
                    {tCat(photo.category)}
                    {photo.year_taken ? ` · ${photo.year_taken}` : ""}
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="gallery-empty">
          <p>{t("emptyCategoryTitle")}</p>
          <p>{t("emptyCategoryBody")}</p>
        </div>
      ) : (
        <div className="gallery-empty">
          <p>{t("emptyAllTitle")}</p>
          <p>{t("emptyAllBody")}</p>
        </div>
      )}

      {selected && selectedIndex !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedIndex(null);
          }}
        >
          <button
            ref={closeRef}
            type="button"
            className="lightbox-close"
            aria-label={t("closeAria")}
            onClick={() => setSelectedIndex(null)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          {visible.length > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-prev"
              aria-label={t("prevAria")}
              onClick={() => setSelectedIndex((index) => (index === null ? null : (index - 1 + visible.length) % visible.length))}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          <div key={selected.id} className="lightbox-image">
            <Image
              src={selected.image_url}
              alt={selected.title}
              width={1800}
              height={1350}
              sizes="90vw"
              unoptimized={selected.image_url.startsWith("http") || selected.image_url.startsWith("/api/")}
            />
          </div>

          {visible.length > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-next"
              aria-label={t("nextAria")}
              onClick={() => setSelectedIndex((index) => (index === null ? null : (index + 1) % visible.length))}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}

          <p className="lightbox-caption">
            <span lang={selected.translation_missing ? "sq" : undefined}>
              {selected.title}
              {selected.year_taken ? ` · ${selected.year_taken}` : ""}
              {selected.credit ? ` · ${selected.credit}` : ""}
            </span>
            <span className="lightbox-counter">
              {selectedIndex + 1} / {visible.length}
            </span>
          </p>
        </div>
      )}
    </>
  );
}
