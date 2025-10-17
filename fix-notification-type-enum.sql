-- إصلاح NotificationType enum في قاعدة البيانات
-- تاريخ: 2025-10-17
-- المشكلة: Value 'article_recommendation' not found in enum 'NotificationType'

-- الحل: إضافة جميع القيم المفقودة إلى enum

-- خطوة 1: إضافة القيم الجديدة إلى enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'article_recommendation';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'new_article';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'new_comment';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'daily_digest';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'author_follow';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'article_published';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'article_breaking';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'article_featured';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'comments_spike';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'reads_top';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'user_reply';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'system_announcement';

-- خطوة 2: التحقق من القيم الموجودة
SELECT 
    enumlabel as notification_type
FROM 
    pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
WHERE 
    t.typname = 'NotificationType'
ORDER BY 
    e.enumsortorder;

-- خطوة 3: عرض إحصائيات الإشعارات حسب النوع
SELECT 
    type,
    COUNT(*) as count,
    COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread_count
FROM 
    "SmartNotifications"
GROUP BY 
    type
ORDER BY 
    count DESC;

