CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('topanice','komuna','zhvillim','mergata')),
  cover_url TEXT,
  image_url TEXT,
  source_name TEXT,
  source_url TEXT UNIQUE,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('rss','tavily','facebook_import','manual')),
  is_auto_scraped BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bring an existing installation forward without removing the legacy flag used by the prior admin UI.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_auto_scraped BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_category_check;
UPDATE articles SET category = 'topanice' WHERE category = 'lajme';
ALTER TABLE articles ADD CONSTRAINT articles_category_check CHECK (category IN ('topanice','komuna','zhvillim','mergata'));
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_source_type_check;
UPDATE articles SET source_type = 'rss' WHERE is_auto_scraped = TRUE AND source_type = 'manual';
ALTER TABLE articles ADD CONSTRAINT articles_source_type_check CHECK (source_type IN ('rss','tavily','facebook_import','manual'));

CREATE TABLE IF NOT EXISTS history_entries (
  id SERIAL PRIMARY KEY,
  era_year TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  source_citation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE history_entries ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS gallery_photos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('arkiv','natyre','fshati')),
  image_url TEXT NOT NULL,
  year_taken INTEGER,
  credit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_contact TEXT,
  type TEXT NOT NULL CHECK (type IN ('histori','foto','lajm')),
  message TEXT NOT NULL,
  attachment_url TEXT,
  image_url TEXT,
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO site_settings (key, value) VALUES ('auto_publish_news', 'false')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/webp',
  size_bytes INTEGER NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS articles_category_published_idx ON articles(category, status, published_at DESC);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS media_assets_created_idx ON media_assets(created_at DESC);

CREATE TABLE IF NOT EXISTS article_translations (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'de')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (article_id, locale)
);

CREATE TABLE IF NOT EXISTS history_entry_translations (
  history_entry_id INTEGER NOT NULL REFERENCES history_entries(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'de')),
  era_year TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_citation TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (history_entry_id, locale)
);

CREATE TABLE IF NOT EXISTS gallery_photo_translations (
  gallery_photo_id INTEGER NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'de')),
  title TEXT NOT NULL,
  credit TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (gallery_photo_id, locale)
);
