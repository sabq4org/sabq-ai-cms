import SingletonPrisma from "./singleton-prisma";

// استخدام نظام singleton محسّن لحل مشكلة كثرة الاتصالات
const prisma = SingletonPrisma.getInstance();

// دالة تنفيذ آمنة للاستعلامات
export const executeQuery = SingletonPrisma.executeQuery;

// تصدير مبسط
export { SingletonPrisma, prisma };
export default prisma;
