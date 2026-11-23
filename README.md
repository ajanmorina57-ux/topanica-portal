# Topanicë — portal i komunitetit

Portal komunitar në shqip për lajmet, historinë, fotografitë dhe kujtimet e fshatit Topanicë, Komuna e Kamenicës.

## Kërkesat

- Node.js 20.6 ose më i ri
- Baza Neon Postgres
- Çelës LLM me API të përputhshme me formatin OpenAI Chat Completions, nëse përdoret scraper-i

## Zhvillimi lokal

```sh
npm install
cp .env.example .env
# Plotësoni DATABASE_URL dhe sekretet në .env
npm run db:seed
npm run dev
```

Hapni `http://localhost:3000`. Paneli admin është te `/admin/login`.

`schema.sql` krijon tabelat, indekset dhe cilësimin fillestar `auto_publish_news=false`. `npm run db:seed` zbaton skemën në Neon dhe shton hyrjet fillestare me burimet e tyre. Skripti i seed-it është i sigurt për t’u ekzekutuar përsëri.

## Variablat e mjedisit

| Emri | Qëllimi |
| --- | --- |
| `DATABASE_URL` | Lidhja Neon Postgres (me SSL) |
| `ADMIN_PASSWORD` | Fjalëkalimi i vetëm për hyrjen admin |
| `SESSION_SECRET` | Sekret HMAC, të paktën 32 karaktere, për cookie-n e sesionit |
| `CRON_SECRET` | Bearer token për cron-in e lajmeve |
| `LLM_API_KEY` | Çelësi API për filtrimin dhe përmbledhjen e artikujve |
| `TAVILY_API_KEY` | Çelësi opsional për kërkime Tavily në fazën e automatizimit |
| `LLM_API_URL` | (Opsionale) Endpoint Chat Completions; parazgjedhja OpenAI |
| `LLM_MODEL` | (Opsionale) Emri i modelit; parazgjedhja `gpt-4o-mini` |
| `NEXT_PUBLIC_SITE_URL` | (Opsionale) URL-ja publike për metadata absolute |

Gjeneroni sekrete të veçanta e të rastësishme për `SESSION_SECRET` dhe `CRON_SECRET`. Mos i vendosni në Git.

## Publikimi

1. Krijoni bazën Neon, vendosni variablat e mjedisit dhe ekzekutoni `npm run db:seed` një herë.
2. Publikoni aplikacionin në Vercel ose në një host që mbështet Next.js App Router dhe funksione Node.js.
3. Sigurohuni që `CRON_SECRET` të jetë vendosur në mjedisin e cron-it. `vercel.json` planifikon `/api/cron/scrape` një herë në ditë (08:00 UTC, i përshtatshëm për planin Vercel Hobby).
4. Lëreni `auto_publish_news` të fikur derisa redaksia t’i ketë shqyrtuar rezultatet e scraper-it. Cilësimi fillestar është draft.

## Burimet dhe përmbajtja

- Popullsia 2024: ASK, tabela sipas vendbanimeve. Popullsia 2011: Komuna e Kamenicës, të dhëna të marra nga ASK.
- Lokaliteti arkeologjik: Regjistri i Trashëgimisë Kulturore i Kosovës, nr. unik 1197; Databaza e Trashëgimisë Kulturore, objekti 3904.
- Shkolla përmendet me shënimin e KQZ-së të vitit 2014 për qendrën e votimit në Topanicë; emri arkivor në dokument është „Rexhep Malaj“.
- Mëhallët, rrëfimet për xhaminë dhe fotografitë janë lënë për kontribut e verifikim nga banorët. Galeria nis bosh që të mos paraqesë pamje të huaja si fotografi të fshatit.

## Kontrolli teknik

```sh
npm run build
```
