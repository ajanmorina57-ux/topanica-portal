"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";

interface PhotoDropzoneProps {
  name?: string;
  defaultValue?: string;
  defaultValues?: string[];
  multiple?: boolean;
  maxFiles?: number;
  onChange?: (url: string) => void;
  onChangeMultiple?: (urls: string[]) => void;
  label?: string;
  hint?: string;
}

type UploadItem = {
  id: string;
  previewUrl: string;
  uploadedUrl: string | null;
  uploading: boolean;
  error?: string;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB selected limit
const CLIENT_COMPRESS_THRESHOLD = 3.5 * 1024 * 1024; // Keep payloads well under Vercel's 4.5 MB body limit
const MAX_DIMENSION = 1920;

async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size <= CLIENT_COMPRESS_THRESHOLD) return file;

  try {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
      const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
      const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

      for (const quality of [0.85, 0.72, 0.58]) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (blob && (blob.size <= CLIENT_COMPRESS_THRESHOLD || quality === 0.58)) {
          const baseName = file.name.replace(/\.[^/.]+$/, "") || "foto";
          return new File([blob], `${baseName}.webp`, { type: "image/webp" });
        }
      }
      return file;
    } finally {
      bitmap.close();
    }
  } catch {
    // Fall back to original file (e.g. HEIC that browser canvas can't decode) so sharp handles it server-side
    return file;
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PhotoDropzone({
  name = "image_url",
  defaultValue = "",
  defaultValues,
  multiple = false,
  maxFiles = 12,
  onChange,
  onChangeMultiple,
  label = "Fotografia",
  hint,
}: PhotoDropzoneProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string>(defaultValue);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultValue);
  const [items, setItems] = useState<UploadItem[]>(() =>
    (defaultValues || []).filter(Boolean).map((url) => ({
      id: makeId(),
      previewUrl: url,
      uploadedUrl: url,
      uploading: false,
    })),
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!multiple) {
      setImageUrl(defaultValue);
      setPreviewUrl(defaultValue);
    }
  }, [defaultValue, multiple]);

  const resolvedHint =
    hint ||
    (multiple
      ? `Tërhiqni dhe lëshoni një ose më shumë fotografi këtu, ose klikoni për të zgjedhur (deri në ${maxFiles} foto, max 10 MB secila). Do të konvertohen automatikisht në WebP.`
      : "Tërhiq dhe lësho fotografinë këtu, ose kliko për të zgjedhur (.jpg, .png, .webp). Do të konvertohet automatikisht në WebP.");

  async function uploadSingleToApi(file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Skedari i zgjedhur nuk është fotografi.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error("Madhësia e fotografisë nuk duhet të kalojë 10 MB.");
    }

    const preparedFile = await prepareImageForUpload(file);
    if (preparedFile.size > 4.4 * 1024 * 1024) {
      throw new Error("Fotografia mbetet mbi 4.4 MB pas zvogëlimit. Ju lutemi zgjidhni një fotografi më të vogël.");
    }

    const formData = new FormData();
    formData.append("file", preparedFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Dështoi ngarkimi i fotografisë.");
    }
    return data.url as string;
  }

  const handleSingleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Skedari i zgjedhur nuk është fotografi.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Madhësia e fotografisë nuk duhet të kalojë 10 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const url = await uploadSingleToApi(file);
      setImageUrl(url);
      setPreviewUrl(url);
      onChange?.(url);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Ndodhi një gabim gjatë ngarkimit.");
      setPreviewUrl(imageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultipleFiles = async (fileList: FileList | File[]) => {
    setError(null);
    const incoming = Array.from(fileList);
    if (!incoming.length) return;

    const remainingSlots = maxFiles - items.length;
    if (remainingSlots <= 0) {
      setError(`Mund të ngarkoni maksimumi ${maxFiles} fotografi.`);
      return;
    }

    const selected = incoming.slice(0, remainingSlots);
    if (incoming.length > remainingSlots) {
      setError(`Vetëm ${remainingSlots} fotografi të tjera u pranuan (maksimumi ${maxFiles}).`);
    }

    const pendingItems: Array<{ file: File; item: UploadItem }> = [];
    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" nuk është fotografi e vlefshme.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" e kalon kufirin prej 10 MB.`);
        continue;
      }
      pendingItems.push({
        file,
        item: {
          id: makeId(),
          previewUrl: URL.createObjectURL(file),
          uploadedUrl: null,
          uploading: true,
        },
      });
    }

    if (!pendingItems.length) return;

    setItems((prev) => [...prev, ...pendingItems.map((entry) => entry.item)]);

    await Promise.all(
      pendingItems.map(async ({ file, item }) => {
        try {
          const url = await uploadSingleToApi(file);
          setItems((prev) => {
            const next = prev.map((existing) =>
              existing.id === item.id
                ? { ...existing, previewUrl: url, uploadedUrl: url, uploading: false }
                : existing,
            );
            const urls = next.map((x) => x.uploadedUrl).filter((u): u is string => Boolean(u));
            onChangeMultiple?.(urls);
            onChange?.(urls[0] || "");
            return next;
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Dështoi ngarkimi.";
          setError(message);
          setItems((prev) => prev.filter((existing) => existing.id !== item.id));
        }
      }),
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files?.length) return;
    if (multiple) {
      void handleMultipleFiles(e.dataTransfer.files);
    } else {
      void handleSingleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveSingle = (e: React.MouseEvent) => {
    e.preventDefault();
    setImageUrl("");
    setPreviewUrl("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange?.("");
  };

  const handleRemoveMultiItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const urls = next.map((x) => x.uploadedUrl).filter((u): u is string => Boolean(u));
      onChangeMultiple?.(urls);
      onChange?.(urls[0] || "");
      return next;
    });
  };

  if (multiple) {
    const uploadedUrls = items.map((item) => item.uploadedUrl).filter((u): u is string => Boolean(u));
    const anyUploading = items.some((item) => item.uploading);

    return (
      <div className="photo-dropzone-wrapper">
        <label htmlFor={inputId} className="photo-dropzone-label">
          {label}
        </label>

        <input type="hidden" name={name} value={JSON.stringify(uploadedUrls)} />
        {name !== "image_url" && <input type="hidden" name="image_url" value={uploadedUrls[0] || ""} />}

        <div
          className={`photo-dropzone-area ${isDragging ? "dragging" : ""} ${anyUploading ? "uploading" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"
            className="photo-dropzone-input"
            onChange={(e) => {
              if (e.target.files?.length) {
                void handleMultipleFiles(e.target.files);
                e.target.value = "";
              }
            }}
          />
          <div className="photo-dropzone-content">
            <svg
              className="photo-dropzone-icon"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="photo-dropzone-title">
              {isDragging
                ? "Lëshoni fotografitë këtu..."
                : items.length > 0
                  ? `Shto fotografi të tjera (${uploadedUrls.length}/${maxFiles} të ngarkuara)`
                  : "Zgjidh ose tërhiq fotografitë këtu"}
            </p>
            <p className="photo-dropzone-hint">{resolvedHint}</p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="photo-multi-grid" aria-live="polite">
            {items.map((item, idx) => (
              <div key={item.id} className="photo-multi-card">
                <div className="photo-preview-img-container">
                  <Image
                    src={item.previewUrl}
                    alt={`Fotografia ${idx + 1}`}
                    width={480}
                    height={320}
                    unoptimized
                    className="photo-preview-img"
                  />
                  {item.uploading && (
                    <div className="photo-preview-overlay">
                      <span className="upload-spinner" />
                      <p>Po ruhet...</p>
                    </div>
                  )}
                </div>
                <div className="photo-preview-actions">
                  <span className="photo-status-badge">
                    {item.uploadedUrl ? `✓ Foto ${idx + 1}` : "Duke u ngarkuar..."}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMultiItem(item.id)}
                    className="photo-remove-btn"
                    disabled={item.uploading}
                  >
                    Hiq
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="photo-dropzone-error" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="photo-dropzone-wrapper">
      <label htmlFor={inputId} className="photo-dropzone-label">
        {label}
      </label>

      <input type="hidden" name={name} value={imageUrl} />

      {previewUrl ? (
        <div className="photo-dropzone-preview-box">
          <div className="photo-preview-img-container">
            <Image
              src={previewUrl}
              alt="Paraqitja e fotografisë"
              width={640}
              height={360}
              unoptimized
              className="photo-preview-img"
            />
            {isUploading && (
              <div className="photo-preview-overlay">
                <span className="upload-spinner" />
                <p>Po konvertohet në WebP dhe po ruhet...</p>
              </div>
            )}
          </div>
          <div className="photo-preview-actions">
            <span className="photo-status-badge">
              {imageUrl ? "✓ Ruajtur në WebP" : isUploading ? "Duke u përpunuar..." : "E papërfunduar"}
            </span>
            <button
              type="button"
              onClick={handleRemoveSingle}
              className="photo-remove-btn"
              disabled={isUploading}
            >
              Largo fotografinë
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`photo-dropzone-area ${isDragging ? "dragging" : ""} ${isUploading ? "uploading" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"
            className="photo-dropzone-input"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                void handleSingleFile(e.target.files[0]);
              }
            }}
          />
          <div className="photo-dropzone-content">
            <svg
              className="photo-dropzone-icon"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="photo-dropzone-title">
              {isDragging ? "Lësho fotografinë këtu..." : "Zgjidh ose tërhiq një fotografi"}
            </p>
            <p className="photo-dropzone-hint">{resolvedHint}</p>
          </div>
        </div>
      )}

      {error && <p className="photo-dropzone-error" role="alert">{error}</p>}
    </div>
  );
}
