import { neon } from "@neondatabase/serverless";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

interface VisionResult {
  category: "arkiv" | "natyre" | "fshati";
  title: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function inspectPhotoWithVision(
  filePath: string,
  apiKey: string,
  apiUrl: string,
  model: string
): Promise<VisionResult> {
  // Create an optimized thumbnail in memory for the vision API (to keep tokens well within TPM limits)
  const thumbBuffer = await sharp(filePath)
    .resize({ width: 640, height: 640, fit: "inside" })
    .webp({ quality: 75 })
    .toBuffer();

  const base64 = thumbBuffer.toString("base64");
  const dataUrl = `data:image/webp;base64,${base64}`;

  const prompt = `Je kurator i arkivit fotografik të portalit të fshatit Topanicë (Komuna e Kamenicës, Kosovë).
Shiko këtë fotografi dhe përcakto kategorinë dhe titullin e saj.

1. KATEGORIA (zgjidh VETËM një nga këto të tria):
- "arkiv": Fotografi të vjetra historike, vintage, bardhë e zi, ngjyrë sepia, fotografi të skanuara ose të zbehura nga koha (oda tradicionale, banorë të vjetër, ngjarje historike, pamje të dekadave të kaluara).
- "natyre": Peizazhe natyrore, fusha, Lisi i Kungullarit (lisi i madh i vetmuar në fushë, simboli i fshatit), male, kodra, perëndim dielli, borë/dimër, natyrë rreth fshatit.
- "fshati": Pamje të jetës bashkëkohore të fshatit, rrugë të shtruara/asfaltuara, shtëpi moderne, shkolla (SHFMU Rexhep Mala), xhamia e fshatit, qendra, lagjet e Topanicës.

2. TITULLI:
- Shkruaj një titull të shkurtër, të natyrshëm dhe dinjitoz në gjuhën shqipe (3 deri në 6 fjalë).
- P.sh.: "Pamje dimërore mbi Topanicë", "Lisi i Kungullarit në fushë", "Rruga kryesore e fshatit", "Xhamia e fshatit Topanicë", "Lagjja e Epërme", "Pamje nga lartësitë e fshatit".
- MOS përdor thonjëza, mos përdor emoji, pa fjalë të kota reklamuese.

Kthe VETËM një JSON me formatin:
{
  "category": "arkiv" | "natyre" | "fshati",
  "title": "Titulli në shqip"
}`;

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          temperature: 0.2,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("retry-after");
        const waitSec = retryAfterHeader ? Math.max(parseFloat(retryAfterHeader), 5) : 8;
        console.warn(`  ⚠️ Rate limit (429) reached. Waiting ${Math.ceil(waitSec)}s before retry ${attempts}/${maxAttempts}...`);
        await sleep(waitSec * 1000 + 500);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No response content from vision API");

      const parsed = JSON.parse(content);
      let category: "arkiv" | "natyre" | "fshati" = "fshati";
      if (["arkiv", "natyre", "fshati"].includes(parsed.category?.toLowerCase())) {
        category = parsed.category.toLowerCase() as "arkiv" | "natyre" | "fshati";
      }

      let title = String(parsed.title || "Pamje nga Topanica").trim();
      title = title.replace(/^["'«]+|["'»]+$/g, "").trim();
      if (!title || title.length < 3) title = "Pamje nga Topanica";

      return { category, title };
    } catch (err: unknown) {
      if (attempts >= maxAttempts) throw err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`  Retry attempt ${attempts} after error: ${errMsg}`);
      await sleep(4000);
    }
  }

  return { category: "fshati", title: "Pamje nga Topanica" };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set.");

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM_API_KEY is not set in environment.");

  const apiUrl = process.env.LLM_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  let model = process.env.VISION_MODEL || "qwen/qwen3.8-27b";

  // If using OpenAI, default to gpt-4o-mini
  if (apiUrl.includes("api.openai.com")) {
    model = process.env.VISION_MODEL || "gpt-4o-mini";
  }

  console.log(`Using Vision Model: ${model} via ${apiUrl}`);

  const sql = neon(databaseUrl);
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  const files = (await fs.readdir(galleryDir)).filter((f) => f.endsWith(".webp"));

  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  console.log(`Starting AI vision categorization for ${files.length} photos...\n`);

  let updatedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const imageUrl = `/gallery/${filename}`;
    const filePath = path.join(galleryDir, filename);

    const progress = `[${String(i + 1).padStart(2, "0")}/${files.length}]`;
    process.stdout.write(`${progress} Analyzing ${filename}... `);

    try {
      const result = await inspectPhotoWithVision(filePath, apiKey, apiUrl, model);

      // Update in Neon Postgres
      await sql.query(
        "UPDATE gallery_photos SET category = $1, title = $2 WHERE image_url = $3",
        [result.category, result.title, imageUrl]
      );

      console.log(`✓ [${result.category.toUpperCase()}] "${result.title}"`);
      updatedCount++;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.log(`✗ Failed: ${errMsg}`);
    }

    // Delay between photos to comfortably stay under Groq free tier TPM limits
    if (i < files.length - 1) {
      await sleep(7500);
    }
  }

  console.log("\n=================================");
  console.log(`Successfully categorized & updated: ${updatedCount}/${files.length} photos.`);

  const stats = (await sql.query(
    "SELECT category, count(*)::text as count FROM gallery_photos GROUP BY category ORDER BY category ASC"
  )) as unknown as Array<{ category: string; count: string }>;

  console.log("\nCurrent Category Breakdown in Database:");
  for (const row of stats) {
    console.log(`  - ${row.category}: ${row.count} photos`);
  }
}

main().catch((err) => {
  console.error("\nFatal error during categorization:", err);
  process.exit(1);
});
