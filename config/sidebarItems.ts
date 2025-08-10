export const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "لوحة التحكم", icon: "LayoutDashboard" },
  { key: "analytics", label: "التحليلات", icon: "Activity" },
  { key: "ads_manager", label: "الإعلانات", icon: "BadgeDollarSign" },
  { key: "ai_insights", label: "ذكاء تحريري", icon: "Brain" },
  { key: "deep_analysis", label: "التحليل العميق", icon: "Sigma" },
  { key: "settings", label: "الإعدادات", icon: "Settings" },
  // يمكن إضافة مفاتيح أخرى لاحقاً
] as const;

export type SidebarKey = typeof SIDEBAR_ITEMS[number]["key"];


