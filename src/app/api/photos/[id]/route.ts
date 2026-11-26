import { NextResponse } from "next/server";
import { getPhotoFromNeon } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const photo = await getPhotoFromNeon(id);
    if (!photo) {
      return NextResponse.json({ error: "Fotografia nuk u gjet." }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(photo.data), {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType,
        "Content-Length": String(photo.data.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Error reading photo from Neon:", err);
    return NextResponse.json({ error: "Gabim gjatë leximit të fotografisë." }, { status: 500 });
  }
}
