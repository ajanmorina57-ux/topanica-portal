import { NextResponse } from "next/server";
import sharp from "sharp";
import { savePhotoToNeon } from "@/lib/media";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Nuk u gjet asnjë skedar fotografie." }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "Skedari i fotografisë është bosh." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Fotografia nuk duhet të kalojë 10 MB." }, { status: 400 });
    }

    if (file.type && !file.type.startsWith("image/") && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formati i skedarit duhet të jetë fotografi (.jpg, .png, .webp, etj.)." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const webpBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const saved = await savePhotoToNeon(file.name || "foto", webpBuffer, "image/webp");

    return NextResponse.json({
      success: true,
      id: saved.id,
      url: saved.url,
      filename: saved.id,
      size: saved.size,
      storage: "neon",
    });
  } catch (err) {
    console.error("Error processing photo upload:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Dështoi ngarkimi dhe përpunimi i fotografisë." },
      { status: 500 },
    );
  }
}
