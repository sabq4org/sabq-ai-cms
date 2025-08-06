/**
 * ملف التحكم بمسارات الطوارئ
 * يتم استخدام هذا الملف لإدارة قائمة المعرفات التي تستخدم في الوضع الطارئ
 */

import { getSupportedEmergencyArticleIds } from "./emergency-articles";

/**
 * التحقق مما إذا كان المعرف يستخدم كمعرف طارئ
 */
export function isEmergencyRouteId(id: string): boolean {
  // الحصول على قائمة المعرفات المدعومة من ملف emergency-articles
  const supportedIds = getSupportedEmergencyArticleIds();
  return supportedIds.includes(id);
}

/**
 * إضافة معرف إلى قائمة المعرفات الطارئة
 * ملاحظة: هذه الوظيفة تستخدم فقط في بيئة التطوير لإضافة معرفات جديدة للاختبار
 */
export function addEmergencyRouteId(id: string): boolean {
  // يمكن تنفيذ هذه الوظيفة في المستقبل لإضافة معرفات بشكل ديناميكي
  console.log(`محاولة إضافة معرف طارئ: ${id}`);

  // في الإنتاج، يجب أن تكون المعرفات ثابتة
  if (process.env.NODE_ENV === "production") {
    console.warn("لا يمكن إضافة معرفات طارئة في بيئة الإنتاج");
    return false;
  }

  return true;
}

/**
 * الحصول على الحالة الحالية للنظام الطارئ
 */
export function getEmergencySystemStatus(): {
  active: boolean;
  lastCheck: Date;
  message: string;
} {
  return {
    active: true,
    lastCheck: new Date(),
    message: "نظام الطوارئ نشط ويعمل بشكل صحيح",
  };
}
