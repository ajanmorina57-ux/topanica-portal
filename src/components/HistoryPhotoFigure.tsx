"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface HistoryPhotoFigureProps {
  src: string;
  alt: string;
  caption?: string | null;
}

/** Displays an uncropped historical plate with an accessible click-to-zoom lightbox. */
export function HistoryPhotoFigure({ src, alt, caption }: HistoryPhotoFigureProps) {
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
          aria-label={`Zmadho dokumentin: ${alt}`}
        >
          <Image
            src={src}
            alt={alt}
            width={900}
            height={1200}
            className="history-plate-img"
            unoptimized={unoptimized}
          />
          <span className="history-plate-hint">Shiko në madhësi të plotë</span>
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
            aria-label="Mbyll dokumentin"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
          <div className="lightbox-image">
            <Image
              src={src}
              alt={alt}
              width={1400}
              height={1800}
              unoptimized={unoptimized}
            />
          </div>
          <p>{alt}{caption ? ` · ${caption}` : ""}</p>
        </div>
      )}
    </>
  );
}
