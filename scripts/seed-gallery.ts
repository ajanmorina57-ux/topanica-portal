import { neon } from "@neondatabase/serverless";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined in environment variables (.env or .env.local).");
  }

  const sql = neon(databaseUrl);
  const galleryDir = path.join(process.cwd(), "public", "gallery");

  const files = await fs.readdir(galleryDir);
  const webpFiles = files.filter((f) => f.endsWith(".webp"));

  // Sort files naturally (e.g. topanica-01.webp, topanica-02.webp, ...)
  webpFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  console.log(`Found ${webpFiles.length} WebP images in public/gallery/`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const filename of webpFiles) {
    const imageUrl = `/gallery/${filename}`;
    const category = "fshati";
    const title = "Pamje nga Topanica";
    const credit = "Arkivi i fshatit / Facebook";

    // Skip any photo whose image_url already exists
    const existing = await sql.query(
      "SELECT id FROM gallery_photos WHERE image_url = $1 LIMIT 1",
      [imageUrl]
    );

    if (existing.length > 0) {
      skippedCount++;
      console.log(`- Skipping ${imageUrl} (already exists in database)`);
      continue;
    }

    await sql.query(
      "INSERT INTO gallery_photos (title, category, image_url, credit) VALUES ($1, $2, $3, $4)",
      [title, category, imageUrl, credit]
    );
    insertedCount++;
    console.log(`+ Inserted ${imageUrl}`);
  }

  console.log("\n--- Seeding Summary ---");
  console.log(`Total scanned: ${webpFiles.length}`);
  console.log(`Inserted: ${insertedCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

main().catch((err) => {
  console.error("Gallery seeding failed:", err);
  process.exit(1);
});
