// مفاتيح متطابقة مع معرفات العناصر الفعلية في ModernSidebar
export const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "لوحة التحكم" },
  { key: "news-management", label: "إدارة الأخبار" },
  { key: "analytics", label: "التحليلات المتقدمة" },
  { key: "ai-systems", label: "الأنظمة الذكية" },
  { key: "content-management", label: "إدارة المحتوى" },
  { key: "muqtarab-module", label: "نظام مُقترب" },
  { key: "audio-systems", label: "النظم الصوتية" },
  { key: "loyalty-program", label: "برنامج الولاء" },
  { key: "notifications", label: "التنبيهات" },
  { key: "performance", label: "تحسين الأداء" },
  { key: "themes", label: "السمات التكيفية" },
  { key: "external-data", label: "البيانات الخارجية" },
  { key: "users", label: "المستخدمين" },
  { key: "media", label: "مكتبة الوسائط" },
  { key: "comments", label: "التعليقات" },
  { key: "settings", label: "الإعدادات" },
] as const;

export type SidebarKey = typeof SIDEBAR_ITEMS[number]["key"];


