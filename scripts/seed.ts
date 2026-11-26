import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before seeding.");
  const sql = neon(process.env.DATABASE_URL);
  const schema = (await readFile(new URL("../schema.sql", import.meta.url), "utf8"))
    .split(/;\s*(?:\n|$)/).map((statement) => statement.trim()).filter(Boolean);
  for (const statement of schema) await sql.query(statement);

const history = [
  ["Vendndodhja", "Topanicë në Anamoravë", "Fshati Topanicë ndodhet në Komunën e Kamenicës (Dardanë), në Rajonin e Gjilanit, në rrafshin e Anamoravës. Koordinatat e dhëna për qendrën e vendbanimit janë 42°31′46″N 21°37′35″E.", "Koordinata orientuese e vendbanimit", null],
  ["Antikitet i vonë", "Vendbanimi shumë-shtresor i Topanicës", "Regjistri i trashëgimisë kulturore e përfshin vendbanimin shumë-shtresor të Topanicës në listën për mbrojtje të përhershme (nr. unik 1197). Databaza e Trashëgimisë Kulturore e regjistron lokalitetin në Gradec si kala të antikitetit të vonë dhe përshkruan gjetje sipërfaqësore e sondazhe arkeologjike.", "Regjistri i Trashëgimisë Kulturore, nr. unik 1197; Databaza e Trashëgimisë Kulturore, objekti 3904", null],
  [
    "4 shkurt 1910",
    "Bajram Beg Curri në Topanicë",
    "**4 shkurt 1910 – Kuvendi në Muçivërc:**\n- Më 4 shkurt 1910, në shtëpinë e Avdi Agës në Muçivërc u mbajt kuvendi historik i udhëhequr nga kryetari Shemë Dajkoci.\n- Në kuvend morën pjesë rreth 120–150 burra dhe patriotë të dalluar nga e gjithë krahina.\n\n**Qëllimi i kuvendit:**\n- Përgatitja e burrave për qëndresë dhe rezistencë të armatosur kundër pushtuesve xhonturq.\n- Organizimi i lëvizjes popullore për ngritjen e flamurit kombëtar në Shkup.\n- Hasan Prishtinën e kishin arrestuar dhe dërguar në burgun e Beogradit, ndërsa rusët nuk lejonin ngritjen e flamurit në Shkup.\n\n**Pjesëmarrësit nga Topanica:**\n- Asllan Topanica (i Tahirit)\n- Bajram Bani\n- Cenë Veseli\n\n**4 shkurt 1910 – Bujtja në Topanicë:**\n- Pas përfundimit të kuvendit, Bajram Beg Curri u përcoll deri në Topanicë me urdhër të Emin Blalatës, ndërsa sigurinë e garantoi Ajet Blalata.\n- Më 4 shkurt 1910, Bajram Beg Curri bujti natën në shtëpinë dhe odën bujare të Bajram Banit në Topanicë.\n\n**Nisja drejt Novobërdës:**\n- Bajram Beg Curri kërkoi nga Cenë Veseli i Topanicës që të shkonte në Koretin për të ftuar dy tregtarët, Emin Canën dhe Shefki Avdylin.\n- Të nesërmen, me pajisjet dhe përgatitjet e duhura, u nisën drejt Kalasë së Novobërdës, ku do t’i prisnin kryengritësit novobërdalinë dhe gjilanas.\n\n**Rrugëtimi historik:**\n- Kamenicë → Hogosht → Muçivërc → Topanicë → Koretin → Novobërdë",
    "Dëshmi dhe kujtesë historike e fshatit",
    "/history/bajram-curri-topanice.webp"
  ],
  [
    "1910–1956",
    "Asllan Topanica (i Tahirit)",
    "*Asllan do të thotë luan.* Ky burrë fisnik, i urtë, i pasëm dhe i qetë, por i dashur, kur ishte fjala për atdheun, bëhej luan: trim i pushkës, i fjalës dhe i lapsit.\n\n**4 shkurt 1910 – Kuvendi i Muçivërcit:**\n- Asllan Topanica mori pjesë në Kuvendin e Muçivërcit, të mbajtur më 4 shkurt 1910 në shtëpinë e Avdi Agë Muçivërcit, nën udhëheqjen e Shemë Daikocit.\n- Kuvendi u mbajt me pjesëmarrjen e Bajram Currit dhe mbi 120 burrave, me vendim për rezistencë dhe luftë për çlirim nga Xhonturqit dhe shpalljen e pavarësisë, me Hasan Prishtinën në Shkup.\n\n**1941–1944 – Kryetar i Komunës së Ropotovës:**\n- Asllan Topanica shërbeu si kryetar i Komunës së Ropotovës gjatë kohës së Shqipërisë së lirë (1941–1944).\n- Në territorin e kësaj komune përfshiheshin katundet: Perlepnicë, Kmetovc, Topanicë, Koretin dhe Berivojcë.\n\n**13 nëntor 1944 – Kuvendi i Roganës:**\n- Mori pjesë në Kuvendin e Roganës, të mbajtur më 13 nëntor 1944 në odën e Sulejman Ibrahim Kallabës.\n- Kuvendi u kryesua nga myderrizi Haki dhe Mulla Idriz Gjilani (Velekinca).\n- Morën pjesë kryetari i Komunës së Hogoshtit, Osmon Aga; përfaqësues të Roganës; Sylë Daikoci i Ropotovës; Asllan Topanica dhe Mehmet Topanica.\n\n**Shkurt 1956 – Aksioni i pushkëve në kohën e Rankoviçit:**\n- Në kohën e aksionit të egër të armëve në shkurt të vitit 1956 gjatë regjimit të Rankoviçit, Topanica u vu nën rrethim ushtarako-policor.\n- Forcat policore u vendosën në një odë të fshatit dhe i kërkuan parisë së katundit dorëzimin e 10 pushkëve me premtimin se nuk do t'i rrahnin.\n- Pas kuvendimit të fshatit, mixha Asllan u shpreh hapur: *„O burra, nuk u besohet këtyre. Nëse na pyesin se ku janë dhe ku i kemi marrë armët, unë nuk do të kisha thënë. Por çfarë kanë për të bërë, le ta bëjnë; nuk do t'i veçoj katundarët.“*\n- Pas këtij refuzimi heroik për të mos i lënduar bashkëfshatarët, filluan maltretimet e rënda në shkollën e fshatit.",
    "Kujtesa popullore dhe dëshmi të fshatit",
    "/history/asllan-topanica.webp"
  ],
  [
    "Zanatet e vjetra",
    "Berberhanja e Hasanit — Berber Hasani",
    "Dikur berberët si mjete pune kishin vetëm gërshërët dhe krehrin, dhe me to kryenin punë. Nuk kishte ndonjë stil të veçantë, veçse rruarja apo shkurtimi i flokëve tek moshat më të shtyra, ndërsa prerja ishte e njëjtë për të gjithë dhe flokët para në ballë u bëheshin me vijë.\n\nHasan Brica quhej aso kohe dhe ka qenë një mjeshtër i vërtetë i kohës. Një personalitet me humor të mirë dhe mikpritje, veçanërisht për fëmijët që prisnin në radhë — edhe pse prerja ishte uniforme dhe e njëjtë për të gjithë.\n\nMë pas erdhi makina manuale me dorë e me krehër, jo mekanizëm me rrymë. Pritjet shtoheshin sidomos në raste festash dhe për Bajram, kur radha te berberhanja bëhej e madhe. Berber Hasani mbetet një emër i respektuar në kujtesën e Topanicës.",
    "Kujtesë e komunitetit të Topanicës",
    "/history/berber-hasani.webp"
  ],
  ["2011", "Regjistrimi i popullsisë", "Regjistrimi i popullsisë i vitit 2011 shënonte 2,061 banorë në Topanicë. Shifra i përket atij regjistrimi dhe nuk përshkruan popullsinë e sotme.", "Komuna e Kamenicës, të dhëna nga Agjencia e Statistikave të Kosovës", null],
  ["2024", "Regjistrimi i popullsisë", "Regjistrimi i vitit 2024 numëroi 1,286 banorë në Topanicë. Të dhënat për vendbanimet publikohen nga Agjencia e Statistikave të Kosovës.", "ASK, Popullsia e komunës së Kamenicës sipas vendbanimit dhe gjinisë, 2011 dhe 2024", null],
  ["Kujtesë e komunitetit", "Lisi i Kungullarit", "Në një intervistë të vitit 2025, përfaqësuesi i Shoqatës Topanica e identifikon lisin e vetmuar në logon e shoqatës si “Lisi i Kungullarit”. Sipas rrëfimit të tij, lisi është mbi 100 vjeç dhe ka qëndruar pa pemë të tjera pranë. Mosha është vlerësim i përcjellë nga komuniteti në intervistë; nuk paraqitet si matje shkencore.", "Intervistë me kryetarin e Shoqatës Topanica, SAM24.info, 30 maj 2025", null],
  ["Kujtesë e komunitetit", "Mëhallët dhe Lagjja e Epërme", "Emrat dhe rrëfimet për mëhallët duhen mbledhur nga banorët. Në intervistën e Shoqatës Topanica përmendet “Lagjja e Epërme”, e lidhur me familje të ardhura nga Malësia e Kamenicës. Ky është një emër i dokumentuar në atë rrëfim; lista e mëhallëve të fshatit mbetet për t’u plotësuar e verifikuar bashkë me komunitetin.", "Intervistë me kryetarin e Shoqatës Topanica, SAM24.info, 30 maj 2025", null],
  ["Arsimi", "SHFMU „Rexhep Mala“", "Shoqata Topanica përmend mbështetjen e arsimit në shkollën e fshatit, SHFMU „Rexhep Mala“. Në listën arkivore të KQZ-së për qendrën e votimit në Topanicë, shkolla figuron me shkrimin „Rexhep Malaj“.", "Intervistë e Shoqatës Topanica, SAM24.info, 30 maj 2025; KQZ, qendrat e votimit 2014", null],
];
  for (let i = 0; i < history.length; i++) {
    const [eraYear, title, content, sourceCitation, imageUrl] = history[i];
    await sql.query(
      `INSERT INTO history_entries (era_year,title,content,source_citation,image_url,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      [eraYear, title, content, sourceCitation, imageUrl, i]
    );
  }
  console.log("Schema applied and verified baseline history seeded.");
}

main().catch((error) => {
  console.error("Database seed failed:", error);
  process.exitCode = 1;
});
