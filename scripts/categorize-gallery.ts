import { neon } from "@neondatabase/serverless";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

interface VisionResult {
  category: "arkiv" | "natyre" | "fshati";
  title: string;
}

// Curated & verified descriptions matching the real context of each photo in Topanica
const VERIFIED_PHOTOS: Record<string, VisionResult> = {
  "topanica-01.webp": {
    category: "arkiv",
    title: "Pleqësia dhe burrat e fshatit me plisa",
  },
  "topanica-02.webp": {
    category: "arkiv",
    title: "Bashkësia e fshatit gjatë ndërtimit të xhamisë (1969)",
  },
  "topanica-03.webp": {
    category: "fshati",
    title: "Oficeri i FSK-së R. Rexha nga Topanica",
  },
  "topanica-04.webp": {
    category: "fshati",
    title: "Mirënjohje për Shoqatën Topanica nga shkolla",
  },
  "topanica-05.webp": {
    category: "fshati",
    title: "Tubimi i xhematit në xhaminë e fshatit",
  },
  "topanica-06.webp": {
    category: "fshati",
    title: "Zgjedhja e Kryesisë së Shoqatës Topanica",
  },
  "topanica-07.webp": {
    category: "fshati",
    title: "Mërgata e Topanicës në kuvendin e shoqatës",
  },
  "topanica-08.webp": {
    category: "arkiv",
    title: "Ndërtimi i Xhamisë së Topanicës më 1969",
  },
  "topanica-09.webp": {
    category: "natyre",
    title: "Rruga dredhuese drejt fshatit në perëndim",
  },
  "topanica-10.webp": {
    category: "fshati",
    title: "Xhamia e re dhe qendra e fshatit",
  },
  "topanica-11.webp": {
    category: "natyre",
    title: "Lugina e Topanicës nga ajri",
  },
  "topanica-12.webp": {
    category: "natyre",
    title: "Mëngjes me brymë dhe mjegull mbi fshat",
  },
  "topanica-13.webp": {
    category: "fshati",
    title: "Pamje e gjerë e Topanicës nën qiell të kthjellët",
  },
  "topanica-14.webp": {
    category: "fshati",
    title: "Festim goli në turneun e futbollit",
  },
  "topanica-15.webp": {
    category: "fshati",
    title: "Rruga qendrore dhe lagjet e Topanicës",
  },
  "topanica-16.webp": {
    category: "fshati",
    title: "Të rinjtë e fshatit me fanellat kuqezi",
  },
  "topanica-17.webp": {
    category: "fshati",
    title: "Pjesëmarrësit e turneut të futbollit të rinisë",
  },
  "topanica-18.webp": {
    category: "fshati",
    title: "Aksion loje në fushën e mbyllur",
  },
  "topanica-19.webp": {
    category: "fshati",
    title: "Duel futbolli mes ekipeve të fshatit",
  },
  "topanica-20.webp": {
    category: "fshati",
    title: "Buzëqeshje pas ndeshjes së futbollit",
  },
  "topanica-21.webp": {
    category: "fshati",
    title: "Ndriçimi publik përgjatë rrugës së fshatit",
  },
  "topanica-22.webp": {
    category: "fshati",
    title: "Mihrabi i ndriçuar i xhamisë së re",
  },
  "topanica-23.webp": {
    category: "fshati",
    title: "Ceremoni festive në Xhaminë e Topanicës",
  },
  "topanica-24.webp": {
    category: "fshati",
    title: "Salla e madhe e lutjeve në xhami",
  },
  "topanica-25.webp": {
    category: "fshati",
    title: "Modeli i avionit Air Kosova nga rinia e fshatit",
  },
  "topanica-26.webp": {
    category: "fshati",
    title: "Ekspozimi i avionit model në pistën e shkollës",
  },
  "topanica-27.webp": {
    category: "fshati",
    title: "Skuadra e futbollit e fshatit Topanicë",
  },
  "topanica-28.webp": {
    category: "fshati",
    title: "Ndërtime dhe shtëpi të reja në fshat",
  },
  "topanica-29.webp": {
    category: "fshati",
    title: "Pamje e natës me xhaminë e ndriçuar",
  },
  "topanica-30.webp": {
    category: "natyre",
    title: "Mjegull e mëngjesit mbi fushat e Topanicës",
  },
  "topanica-31.webp": {
    category: "natyre",
    title: "Duaj bari në agim buzë përroit",
  },
  "topanica-32.webp": {
    category: "fshati",
    title: "Muzgu mbi kupolën e ndriçuar të xhamisë",
  },
  "topanica-33.webp": {
    category: "natyre",
    title: "Perëndim i zjarrtë mbi luginën e fshatit",
  },
  "topanica-34.webp": {
    category: "natyre",
    title: "Rrugë fshati nën hijen e pemëve",
  },
  "topanica-35.webp": {
    category: "natyre",
    title: "Lumi i Shtrembër pranë fshatit",
  },
  "topanica-36.webp": {
    category: "arkiv",
    title: "Pamja historike e brendësisë së xhamisë",
  },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function inspectPhotoWithVision(
  filePath: string,
  apiKey: string,
  apiUrl: string,
  model: string
): Promise<VisionResult> {
  const thumbBuffer = await sharp(filePath)
    .resize({ width: 640, height: 640, fit: "inside" })
    .webp({ quality: 75 })
    .toBuffer();

  const base64 = thumbBuffer.toString("base64");
  const dataUrl = `data:image/webp;base64,${base64}`;

  const prompt = `Je kurator i arkivit fotografik të portalit të fshatit Topanicë (Komuna e Kamenicës, Kosovë).
Shiko këtë fotografi dhe përcakto kategorinë dhe titullin e saj të saktë.

1. KATEGORIA (zgjidh VETËM një nga këto të tria):
- "arkiv": Fotografi të vjetra historike, vintage, bardhë e zi, ngjyrë sepia, fotografi të skanuara ose të zbehura nga koha.
- "natyre": Peizazhe natyrore, fusha, pemë, Lisi i Kungullarit, kodra, perëndim dielli, borë, natyrë rreth fshatit.
- "fshati": Pamje të jetës bashkëkohore të fshatit, rrugë të shtruara, shtëpi moderne, shkolla SHFMU Rexhep Mala, xhamia, aktivitete sportive ose komunitare.

2. TITULLI:
- Shkruaj një titull të saktë, të natyrshëm dhe dinjitoz në shqip (3 deri në 6 fjalë).
- MOS përdor thonjëza, mos përdor emoji.

Kthe VETËM një JSON:
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
  const apiUrl = process.env.LLM_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  let model = process.env.VISION_MODEL || "qwen/qwen3.8-27b";

  if (apiUrl.includes("api.openai.com")) {
    model = process.env.VISION_MODEL || "gpt-4o-mini";
  }

  const sql = neon(databaseUrl);
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  const files = (await fs.readdir(galleryDir)).filter((f) => f.endsWith(".webp"));

  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  console.log(`Starting gallery categorization & title enhancement for ${files.length} photos...\n`);

  let updatedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const imageUrl = `/gallery/${filename}`;
    const filePath = path.join(galleryDir, filename);

    const progress = `[${String(i + 1).padStart(2, "0")}/${files.length}]`;
    process.stdout.write(`${progress} Processing ${filename}... `);

    let result: VisionResult;

    if (VERIFIED_PHOTOS[filename]) {
      result = VERIFIED_PHOTOS[filename];
      console.log(`✓ [${result.category.toUpperCase()}] "${result.title}" (verified)`);
    } else if (apiKey) {
      try {
        result = await inspectPhotoWithVision(filePath, apiKey, apiUrl, model);
        console.log(`✓ [${result.category.toUpperCase()}] "${result.title}" (AI vision)`);
        await sleep(3000);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.log(`✗ AI vision failed: ${errMsg}`);
        result = { category: "fshati", title: "Pamje nga Topanica" };
      }
    } else {
      result = { category: "fshati", title: "Pamje nga Topanica" };
      console.log(`✓ [${result.category.toUpperCase()}] "${result.title}" (default)`);
    }

    // Update in Neon Postgres
    await sql.query(
      "UPDATE gallery_photos SET category = $1, title = $2 WHERE image_url = $3",
      [result.category, result.title, imageUrl]
    );

    updatedCount++;
  }

  console.log("\n=================================");
  console.log(`Successfully updated: ${updatedCount}/${files.length} photos in Neon Postgres.`);

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
