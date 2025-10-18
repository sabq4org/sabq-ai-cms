-- لإصلاح مشكلة طول URL الصور: زيادة حد الطول للحقول التي تحتوي على URLs طويلة

-- تحديث نوع عمود icon من VARCHAR(500) إلى VARCHAR(2000)
ALTER TABLE "categories" 
ALTER COLUMN "icon" TYPE VARCHAR(2000);

-- إضافة حقل جديد icon_url للتوافق مع الـ API الحالية
-- التحقق من عدم وجود الحقل أولاً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE "categories" 
    ADD COLUMN "icon_url" VARCHAR(2000);
  END IF;
END
$$;

-- نسخ البيانات من icon إلى icon_url للتوافق
UPDATE "categories" 
SET "icon_url" = "icon" 
WHERE "icon" IS NOT NULL AND "icon_url" IS NULL;
