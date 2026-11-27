"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

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

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const CLIENT_COMPRESS_THRESHOLD = 3.5 * 1024 * 1024;
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
  label,
  hint,
}: PhotoDropzoneProps) {
  const t = useTranslations("Dropzone");
  const inputId = useId();
  const labelId = useId();
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

  const resolvedLabel = label ?? t("defaultLabel");
  const resolvedHint = hint || (multiple ? t("hintMultiple", { maxFiles }) : t("hintSingle"));

  async function uploadSingleToApi(file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error(t("errorNotImage"));
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(t("errorTooLarge"));
    }

    const preparedFile = await prepareImageForUpload(file);
    if (preparedFile.size > 4.4 * 1024 * 1024) {
      throw new Error(t("errorCompressedTooLarge"));
    }

    const formData = new FormData();
    formData.append("file", preparedFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || t("errorUploadFailed"));
    }
    return data.url as string;
  }

  const handleSingleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError(t("errorNotImage"));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(t("errorTooLarge"));
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
      setError(err instanceof Error ? err.message : t("errorGeneric"));
      setPreviewUrl(imageUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsUploading(false);
    }
  };

  const handleMultipleFiles = async (fileList: FileList | File[]) => {
    setError(null);
    const incoming = Array.from(fileList);
    if (!incoming.length) return;

    const remainingSlots = maxFiles - items.length;
    if (remainingSlots <= 0) {
      setError(t("errorMaxFiles", { maxFiles }));
      return;
    }

    const selected = incoming.slice(0, remainingSlots);
    if (incoming.length > remainingSlots) {
      setError(t("errorPartialLimit", { remainingSlots, maxFiles }));
    }

    const pendingItems: Array<{ file: File; item: UploadItem }> = [];
    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setError(t("errorFileInvalid", { name: file.name }));
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setError(t("errorFileTooLarge", { name: file.name }));
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
          URL.revokeObjectURL(item.previewUrl);
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
          URL.revokeObjectURL(item.previewUrl);
          const message = err instanceof Error ? err.message : t("errorUploadShort");
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

  const handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
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
        <label id={labelId} htmlFor={inputId} className="photo-dropzone-label">
          {resolvedLabel}
        </label>

        <input type="hidden" name={name} value={JSON.stringify(uploadedUrls)} />
        {name !== "image_url" && <input type="hidden" name="image_url" value={uploadedUrls[0] || ""} />}

        <div
          role="button"
          tabIndex={0}
          aria-labelledby={labelId}
          className={`photo-dropzone-area ${isDragging ? "dragging" : ""} ${anyUploading ? "uploading" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleDropzoneKeyDown}
        >
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            multiple
            tabIndex={-1}
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
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="photo-dropzone-title">
              {isDragging
                ? t("dropMultiple")
                : items.length > 0
                  ? t("addMoreMultiple", { count: uploadedUrls.length, maxFiles })
                  : t("chooseMultiple")}
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
                    alt={t("photoAlt", { index: idx + 1 })}
                    width={480}
                    height={320}
                    unoptimized
                    className="photo-preview-img"
                  />
                  {item.uploading && (
                    <div className="photo-preview-overlay">
                      <span className="upload-spinner" />
                      <p>{t("saving")}</p>
                    </div>
                  )}
                </div>
                <div className="photo-preview-actions">
                  <span className="photo-status-badge">
                    {item.uploadedUrl ? t("photoBadge", { index: idx + 1 }) : t("uploading")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMultiItem(item.id)}
                    className="photo-remove-btn"
                    disabled={item.uploading}
                  >
                    {t("removeShort")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="photo-dropzone-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="photo-dropzone-wrapper">
      <label id={labelId} htmlFor={inputId} className="photo-dropzone-label">
        {resolvedLabel}
      </label>

      <input type="hidden" name={name} value={imageUrl} />

      {previewUrl ? (
        <div className="photo-dropzone-preview-box">
          <div className="photo-preview-img-container">
            <Image
              src={previewUrl}
              alt={t("previewAlt")}
              width={640}
              height={360}
              unoptimized
              className="photo-preview-img"
            />
            {isUploading && (
              <div className="photo-preview-overlay">
                <span className="upload-spinner" />
                <p>{t("convertingAndSaving")}</p>
              </div>
            )}
          </div>
          <div className="photo-preview-actions">
            <span className="photo-status-badge">
              {imageUrl ? t("savedWebp") : isUploading ? t("processing") : t("incomplete")}
            </span>
            <button
              type="button"
              onClick={handleRemoveSingle}
              className="photo-remove-btn"
              disabled={isUploading}
            >
              {t("removeSingle")}
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-labelledby={labelId}
          className={`photo-dropzone-area ${isDragging ? "dragging" : ""} ${isUploading ? "uploading" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleDropzoneKeyDown}
        >
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            tabIndex={-1}
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
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="photo-dropzone-title">{isDragging ? t("dropSingle") : t("chooseSingle")}</p>
            <p className="photo-dropzone-hint">{resolvedHint}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="photo-dropzone-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
