-- إضافة جداول الترجمات للمقالات والتصنيفات
CREATE TABLE IF NOT EXISTS "article_translations" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "article_id" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "seo_title" TEXT,
  "seo_desc" TEXT,
  "slug_local" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "article_translations_article_locale_uq"
ON "article_translations" ("article_id", "locale");

CREATE INDEX IF NOT EXISTS "article_translations_article_idx"
ON "article_translations" ("article_id");

ALTER TABLE "article_translations"
ADD CONSTRAINT "article_translations_article_fk"
FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;

-- Table: category_translations
CREATE TABLE IF NOT EXISTS "category_translations" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "category_translations_category_locale_uq"
ON "category_translations" ("category_id", "locale");

CREATE INDEX IF NOT EXISTS "category_translations_category_idx"
ON "category_translations" ("category_id");

ALTER TABLE "category_translations"
ADD CONSTRAINT "category_translations_category_fk"
FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;

