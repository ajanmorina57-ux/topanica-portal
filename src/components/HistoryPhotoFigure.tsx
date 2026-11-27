"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface HistoryPhotoFigureProps {
  src: string;
  alt: string;
  caption?: string | null;
}

/** Displays an uncropped historical plate with an accessible click-to-zoom lightbox. */
export function HistoryPhotoFigure({ src, alt, caption }: HistoryPhotoFigureProps) {
  const t = useTranslations("History");
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [open]);

  const unoptimized = src.startsWith("http") || src.startsWith("/api/");

  return (
    <>
      <figure className="history-plate">
        <button
          type="button"
          className="history-plate-trigger"
          onClick={(event) => {
            returnFocusRef.current = event.currentTarget;
            setOpen(true);
          }}
          aria-label={t("zoomAria", { alt })}
        >
          <Image
            src={src}
            alt={alt}
            width={900}
            height={1200}
            sizes="(max-width: 900px) 100vw, 310px"
            className="history-plate-img"
            unoptimized={unoptimized}
          />
          <span className="history-plate-hint">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
              <path d="M11 8v6M8 11h6" />
            </svg>
            {t("viewFullSize")}
          </span>
        </button>
        {caption && <figcaption className="history-plate-caption">{caption}</figcaption>}
      </figure>

      {open && (
        <div
          className="lightbox history-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <button
            ref={closeRef}
            type="button"
            className="lightbox-close"
            aria-label={t("closeLightboxAria")}
            onClick={() => setOpen(false)}
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
          <div className="lightbox-image">
            <Image src={src} alt={alt} width={1400} height={1800} sizes="90vw" unoptimized={unoptimized} />
          </div>
          <p className="lightbox-caption">
            <span>
              {alt}
              {caption ? ` · ${caption}` : ""}
            </span>
          </p>
        </div>
      )}
    </>
  );
}
