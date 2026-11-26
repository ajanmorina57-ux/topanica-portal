import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

const SAFE_PHOTO_ID = /^[a-zA-Z0-9._-]{1,120}$/;

let mediaTableReady: Promise<void> | null = null;

/** Ensures the `media_assets` table exists in Neon before reads/writes. */
export async function ensureMediaTable(): Promise<void> {
  if (!mediaTableReady) {
    mediaTableReady = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS media_assets (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          mime_type TEXT NOT NULL DEFAULT 'image/webp',
          size_bytes INTEGER NOT NULL,
          data BYTEA NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await query(
        "CREATE INDEX IF NOT EXISTS media_assets_created_idx ON media_assets(created_at DESC)",
      );
    })().catch((err) => {
      mediaTableReady = null;
      throw err;
    });
  }
  return mediaTableReady;
}

function sanitizeBaseName(rawName: string): string {
  return (
    rawName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 36) || "foto"
  );
}

function toByteBuffer(raw: unknown): Buffer | null {
  if (Buffer.isBuffer(raw)) return raw;
  if (raw instanceof Uint8Array) return Buffer.from(raw);
  if (raw instanceof ArrayBuffer) return Buffer.from(raw);
  if (typeof raw === "string") {
    if (raw.startsWith("\\x")) return Buffer.from(raw.slice(2), "hex");
    return Buffer.from(raw, "base64");
  }
  return null;
}

/** Stores a processed image buffer in Neon Postgres and returns its public API path. */
export async function savePhotoToNeon(
  originalFilename: string,
  data: Buffer,
  mimeType = "image/webp",
): Promise<{ id: string; url: string; size: number }> {
  await ensureMediaTable();

  const cleanBaseName = sanitizeBaseName(originalFilename);
  const shortUuid = randomUUID().replace(/-/g, "").slice(0, 12);
  const ext = mimeType === "image/webp" ? "webp" : "bin";
  const id = `${cleanBaseName}-${shortUuid}.${ext}`;

  await query(
    `INSERT INTO media_assets (id, filename, mime_type, size_bytes, data)
     VALUES ($1, $2, $3, $4, $5::bytea)`,
    [id, originalFilename.slice(0, 255) || id, mimeType, data.byteLength, data],
  );

  return {
    id,
    url: `/api/photos/${id}`,
    size: data.byteLength,
  };
}

/** Fetches a stored image buffer and MIME type from Neon Postgres by photo ID. */
export async function getPhotoFromNeon(
  id: string,
): Promise<{ id: string; filename: string; mimeType: string; data: Buffer } | null> {
  if (!SAFE_PHOTO_ID.test(id)) return null;

  await ensureMediaTable();

  const rows = await query<{
    id: string;
    filename: string;
    mime_type: string;
    data: unknown;
  }>("SELECT id, filename, mime_type, data FROM media_assets WHERE id = $1 LIMIT 1", [id]);

  const row = rows[0];
  if (!row) return null;

  const buffer = toByteBuffer(row.data);
  if (!buffer) return null;

  return {
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type || "image/webp",
    data: buffer,
  };
}
