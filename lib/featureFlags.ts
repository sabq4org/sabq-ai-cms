// lib/featureFlags.ts
// نظام تفعيل الميزات الذكية (feature flags)

export type FeatureFlag =
  | 'ai_news_copilot'
  | 'ai_summaries'
  | 'ai_sentiment_analysis'
  | 'ai_interactive_data'
  | 'ai_voice_summary';

// يمكن ربطها بقاعدة بيانات أو إعدادات المستخدم لاحقاً
const enabledFlags: FeatureFlag[] = [
  'ai_news_copilot', // تم تفعيل المساعد الذكي للأخبار
];

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return enabledFlags.includes(flag);
}

// لإدارة الميزات من لوحة تحكم أو من config
export function enableFeature(flag: FeatureFlag) {
  if (!enabledFlags.includes(flag)) enabledFlags.push(flag);
}

export function disableFeature(flag: FeatureFlag) {
  const idx = enabledFlags.indexOf(flag);
  if (idx !== -1) enabledFlags.splice(idx, 1);
}
