import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

async function run() {
  const rootDir = process.cwd();
  const galleryDir = path.join(rootDir, "public", "gallery");
  const candidatesDirs = [
    path.join(rootDir, "Topanica photos"),
    path.join(rootDir, "Topanica Photos"),
    galleryDir
  ];

  await fs.mkdir(galleryDir, { recursive: true });

  // Gather source images
  const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".bmp"]);
  const sourceFiles = [];

  for (const dir of candidatesDirs) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        // If in galleryDir and already webp with topanica- prefix, skip re-processing
        if (dir === galleryDir && ext === ".webp" && entry.name.startsWith("topanica-")) {
          continue;
        }
        if (imageExtensions.has(ext)) {
          sourceFiles.push({
            dir,
            filename: entry.name,
            fullPath: path.join(dir, entry.name),
          });
        }
      }
    } catch {
      // directory does not exist or inaccessible, continue
    }
  }

  if (sourceFiles.length === 0) {
    console.log("No source images found to compress.");
    return;
  }

  // Sort files naturally by extracting numeric parts, then lexicographically
  sourceFiles.sort((a, b) => {
    const numA = parseInt(a.filename.replace(/\D+/g, "") || "0", 10);
    const numB = parseInt(b.filename.replace(/\D+/g, "") || "0", 10);
    if (numA !== numB) return numA - numB;
    return a.filename.localeCompare(b.filename);
  });

  console.log(`Found ${sourceFiles.length} source images to optimize.`);

  let index = 1;
  const converted = [];
  const dirsToClean = new Set();

  for (const file of sourceFiles) {
    const padIndex = String(index).padStart(2, "0");
    const targetFilename = `topanica-${padIndex}.webp`;
    const targetPath = path.join(galleryDir, targetFilename);
    const tempTargetPath = path.join(galleryDir, `__temp_${targetFilename}`);

    const statBefore = await fs.stat(file.fullPath);

    // Convert using sharp:
    // - rotate() auto-rotates based on EXIF
    // - resize({ width: 1600, withoutEnlargement: true }) max width 1600px
    // - webp({ quality: 80 })
    await sharp(file.fullPath)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(tempTargetPath);

    // Atomically move tempTargetPath to targetPath
    await fs.rename(tempTargetPath, targetPath);

    const statAfter = await fs.stat(targetPath);
    console.log(
      `✓ [${index}/${sourceFiles.length}] ${file.filename} -> ${targetFilename} ` +
      `(${(statBefore.size / 1024).toFixed(1)} KB -> ${(statAfter.size / 1024).toFixed(1)} KB)`
    );

    // Delete original file
    if (file.fullPath !== targetPath) {
      await fs.unlink(file.fullPath);
    }

    if (file.dir !== galleryDir) {
      dirsToClean.add(file.dir);
    }

    converted.push({
      original: file.filename,
      output: targetFilename,
      sizeBefore: statBefore.size,
      sizeAfter: statAfter.size,
    });

    index++;
  }

  // Clean up source directories if empty
  for (const dir of dirsToClean) {
    try {
      const remaining = await fs.readdir(dir);
      if (remaining.length === 0) {
        await fs.rmdir(dir);
        console.log(`Cleaned up empty directory: ${dir}`);
      }
    } catch (err) {
      console.warn(`Could not remove directory ${dir}:`, err.message);
    }
  }

  const totalBefore = converted.reduce((sum, c) => sum + c.sizeBefore, 0);
  const totalAfter = converted.reduce((sum, c) => sum + c.sizeAfter, 0);

  console.log("\n--- Compression Summary ---");
  console.log(`Total photos processed: ${converted.length}`);
  console.log(`Original total size: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized total size: ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Space saved: ${(100 - (totalAfter / totalBefore) * 100).toFixed(1)}%`);
}

run().catch((error) => {
  console.error("Optimization failed:", error);
  process.exit(1);
});
