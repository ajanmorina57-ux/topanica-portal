import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before seeding.");
  const sql = neon(process.env.DATABASE_URL);
  const schema = (await readFile(new URL("../schema.sql", import.meta.url), "utf8"))
    .split(/;\s*(?:\n|$)/).map((statement) => statement.trim()).filter(Boolean);
  for (const statement of schema) await sql.query(statement);

const history = [
  ["Vendndodhja", "Topanicë në Anamoravë", "Fshati Topanicë ndodhet në Komunën e Kamenicës (Dardanë), në Rajonin e Gjilanit, në rrafshin e Anamoravës. Koordinatat e dhëna për qendrën e vendbanimit janë 42°31′46″N 21°37′35″E.", "Koordinata orientuese e vendbanimit"],
  ["Antikitet i vonë", "Vendbanimi shumë-shtresor i Topanicës", "Regjistri i trashëgimisë kulturore e përfshin vendbanimin shumë-shtresor të Topanicës në listën për mbrojtje të përhershme (nr. unik 1197). Databaza e Trashëgimisë Kulturore e regjistron lokalitetin në Gradec si kala të antikitetit të vonë dhe përshkruan gjetje sipërfaqësore e sondazhe arkeologjike.", "Regjistri i Trashëgimisë Kulturore, nr. unik 1197; Databaza e Trashëgimisë Kulturore, objekti 3904"],
  ["2011", "Regjistrimi i popullsisë", "Regjistrimi i popullsisë i vitit 2011 shënonte 2,061 banorë në Topanicë. Shifra i përket atij regjistrimi dhe nuk përshkruan popullsinë e sotme.", "Komuna e Kamenicës, të dhëna nga Agjencia e Statistikave të Kosovës"],
  ["2024", "Regjistrimi i popullsisë", "Regjistrimi i vitit 2024 numëroi 1,286 banorë në Topanicë. Të dhënat për vendbanimet publikohen nga Agjencia e Statistikave të Kosovës.", "ASK, Popullsia e komunës së Kamenicës sipas vendbanimit dhe gjinisë, 2011 dhe 2024"],
  ["Kujtesë e komunitetit", "Lisi i Kungullarit", "Në një intervistë të vitit 2025, përfaqësuesi i Shoqatës Topanica e identifikon lisin e vetmuar në logon e shoqatës si “Lisi i Kungullarit”. Sipas rrëfimit të tij, lisi është mbi 100 vjeç dhe ka qëndruar pa pemë të tjera pranë. Mosha është vlerësim i përcjellë nga komuniteti në intervistë; nuk paraqitet si matje shkencore.", "Intervistë me kryetarin e Shoqatës Topanica, SAM24.info, 30 maj 2025"],
  ["Kujtesë e komunitetit", "Mëhallët dhe Lagjja e Epërme", "Emrat dhe rrëfimet për mëhallët duhen mbledhur nga banorët. Në intervistën e Shoqatës Topanica përmendet “Lagjja e Epërme”, e lidhur me familje të ardhura nga Malësia e Kamenicës. Ky është një emër i dokumentuar në atë rrëfim; lista e mëhallëve të fshatit mbetet për t’u plotësuar e verifikuar bashkë me komunitetin.", "Intervistë me kryetarin e Shoqatës Topanica, SAM24.info, 30 maj 2025"],
  ["Arsimi", "SHFMU „Rexhep Mala“", "Shoqata Topanica përmend mbështetjen e arsimit në shkollën e fshatit, SHFMU „Rexhep Mala“. Në listën arkivore të KQZ-së për qendrën e votimit në Topanicë, shkolla figuron me shkrimin „Rexhep Malaj“.", "Intervistë e Shoqatës Topanica, SAM24.info, 30 maj 2025; KQZ, qendrat e votimit 2014"],
];
  for (let i = 0; i < history.length; i++) {
    const [eraYear, title, content, sourceCitation] = history[i];
    await sql.query("INSERT INTO history_entries (era_year,title,content,source_citation,sort_order) SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS (SELECT 1 FROM history_entries WHERE era_year=$1 AND title=$2)", [eraYear, title, content, sourceCitation, i]);
  }
  console.log("Schema applied and verified baseline history seeded.");
}

main().catch((error) => {
  console.error("Database seed failed:", error);
  process.exitCode = 1;
});
