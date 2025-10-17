"use client";

import HeaderEnhanced from "@/components/Header.enhanced";
import {
  EnhancedButton,
} from "@/components/ui/EnhancedButton";
import {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
} from "@/components/ui/EnhancedCard";
import {
  Heart,
  Bookmark,
  Share2,
  Eye,
  Calendar,
  User,
  TrendingUp,
  Sparkles,
  Zap,
} from "lucide-react";
import Image from "next/image";

/**
 * صفحة عرض توضيحية للتصميم المحسّن
 * 
 * تعرض:
 * - الهيدر المحسّن
 * - نظام الألوان الجديد
 * - المكونات المحسّنة (Button, Card)
 * - تأثيرات الحركة
 */
export default function DesignDemoPage() {
  return (
    <div className="min-h-screen bg-brand-surface dark:bg-gray-900">
      {/* الهيدر المحسّن */}
      <HeaderEnhanced />

      {/* المحتوى الرئيسي */}
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* العنوان الرئيسي */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-primary dark:text-white mb-4">
              🎨 التصميم المحسّن لبوابة سبق الذكية
            </h1>
            <p className="text-lg text-brand-fgMuted dark:text-gray-400 max-w-2xl mx-auto">
              نظام تصميم حديث واحترافي مع ألوان موحدة وتأثيرات حركية سلسة
            </p>
          </div>

          {/* قسم نظام الألوان */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-fg dark:text-white mb-6">
              نظام الألوان الجديد
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* اللون الأساسي */}
              <EnhancedCard variant="elevated" padding="lg">
                <div className="text-center">
                  <div className="w-full h-24 bg-brand-primary rounded-lg mb-4"></div>
                  <h3 className="font-semibold text-brand-fg dark:text-white mb-2">
                    اللون الأساسي
                  </h3>
                  <p className="text-sm text-brand-fgMuted dark:text-gray-400">
                    Navy Blue (#172554)
                  </p>
                  <p className="text-xs text-brand-fgLight dark:text-gray-500 mt-2">
                    للعناوين والعناصر الرئيسية
                  </p>
                </div>
              </EnhancedCard>

              {/* اللون الثانوي */}
              <EnhancedCard variant="elevated" padding="lg">
                <div className="text-center">
                  <div className="w-full h-24 bg-brand-secondary rounded-lg mb-4 border border-brand-border"></div>
                  <h3 className="font-semibold text-brand-fg dark:text-white mb-2">
                    اللون الثانوي
                  </h3>
                  <p className="text-sm text-brand-fgMuted dark:text-gray-400">
                    Slate Gray (#f1f5f9)
                  </p>
                  <p className="text-xs text-brand-fgLight dark:text-gray-500 mt-2">
                    للخلفيات والبطاقات
                  </p>
                </div>
              </EnhancedCard>

              {/* لون التمييز */}
              <EnhancedCard variant="elevated" padding="lg">
                <div className="text-center">
                  <div className="w-full h-24 bg-brand-accent rounded-lg mb-4"></div>
                  <h3 className="font-semibold text-brand-fg dark:text-white mb-2">
                    لون التمييز
                  </h3>
                  <p className="text-sm text-brand-fgMuted dark:text-gray-400">
                    Emerald Green (#10b981)
                  </p>
                  <p className="text-xs text-brand-fgLight dark:text-gray-500 mt-2">
                    للأزرار والمؤشرات الذكية
                  </p>
                </div>
              </EnhancedCard>
            </div>
          </section>

          {/* قسم الأزرار */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-fg dark:text-white mb-6">
              الأزرار المحسّنة
            </h2>
            
            <EnhancedCard variant="elevated" padding="lg">
              <div className="space-y-6">
                {/* الأزرار الأساسية */}
                <div>
                  <h3 className="text-sm font-medium text-brand-fgMuted dark:text-gray-400 mb-3">
                    الأنواع المختلفة
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <EnhancedButton variant="primary">
                      زر أساسي
                    </EnhancedButton>
                    <EnhancedButton variant="secondary">
                      زر ثانوي
                    </EnhancedButton>
                    <EnhancedButton variant="accent">
                      زر تمييز
                    </EnhancedButton>
                    <EnhancedButton variant="danger">
                      زر خطر
                    </EnhancedButton>
                    <EnhancedButton variant="ghost">
                      زر شفاف
                    </EnhancedButton>
                    <EnhancedButton variant="outline">
                      زر بإطار
                    </EnhancedButton>
                    <EnhancedButton variant="link">
                      زر رابط
                    </EnhancedButton>
                  </div>
                </div>

                {/* الأحجام المختلفة */}
                <div>
                  <h3 className="text-sm font-medium text-brand-fgMuted dark:text-gray-400 mb-3">
                    الأحجام المختلفة
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <EnhancedButton variant="primary" size="sm">
                      صغير
                    </EnhancedButton>
                    <EnhancedButton variant="primary" size="md">
                      متوسط
                    </EnhancedButton>
                    <EnhancedButton variant="primary" size="lg">
                      كبير
                    </EnhancedButton>
                    <EnhancedButton variant="primary" size="xl">
                      كبير جداً
                    </EnhancedButton>
                  </div>
                </div>

                {/* أزرار مع أيقونات */}
                <div>
                  <h3 className="text-sm font-medium text-brand-fgMuted dark:text-gray-400 mb-3">
                    أزرار مع أيقونات
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <EnhancedButton variant="primary" leftIcon={<Heart className="w-4 h-4" />}>
                      إعجاب
                    </EnhancedButton>
                    <EnhancedButton variant="secondary" leftIcon={<Bookmark className="w-4 h-4" />}>
                      حفظ
                    </EnhancedButton>
                    <EnhancedButton variant="accent" leftIcon={<Share2 className="w-4 h-4" />}>
                      مشاركة
                    </EnhancedButton>
                    <EnhancedButton variant="primary" loading>
                      جاري التحميل...
                    </EnhancedButton>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </section>

          {/* قسم البطاقات */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-fg dark:text-white mb-6">
              البطاقات المحسّنة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* بطاقة خبر 1 */}
              <EnhancedCard variant="default" padding="none" hoverable>
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg">
                  <div className="absolute top-3 right-3">
                    <span className="bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                      عاجل
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-brand-fg dark:text-white mb-2 line-clamp-2">
                    افتتاح أول فرع لـApple في الجبيل مول بالعين
                  </h3>
                  <p className="text-sm text-brand-fgMuted dark:text-gray-400 mb-4 line-clamp-2">
                    افتتحت 'Apple' اليوم متجرها الخامس في دولة الإمارات بالجبيل مول بالعين...
                  </p>
                  <div className="flex items-center justify-between text-xs text-brand-fgLight dark:text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        506
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        25/9/2025
                      </span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              {/* بطاقة مؤشر ذكي */}
              <EnhancedCard variant="elevated" padding="lg">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-brand-accent/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-fg dark:text-white mb-1">
                      صاعد الآن
                    </h3>
                    <p className="text-sm text-brand-fgMuted dark:text-gray-400 mb-3">
                      أكثر المواضيع تداولاً في الساعة الأخيرة
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-brand-accent">
                        +234%
                      </span>
                      <span className="text-xs text-brand-fgLight dark:text-gray-500">
                        مقارنة بالأمس
                      </span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              {/* بطاقة محتوى ذكي */}
              <EnhancedCard variant="default" padding="lg">
                <EnhancedCardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-brand-accent" />
                    <EnhancedCardTitle>مختارات بالذكاء</EnhancedCardTitle>
                  </div>
                  <EnhancedCardDescription>
                    تم اختياره خصيصاً لك بناءً على اهتماماتك
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-accent rounded-full mt-2"></div>
                      <p className="text-sm text-brand-fg dark:text-white">
                        تراجع أسعار الذهب بعد بيانات التضخم
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-accent rounded-full mt-2"></div>
                      <p className="text-sm text-brand-fg dark:text-white">
                        الأرصاد: أمطار رعدية على 6 مناطق
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-accent rounded-full mt-2"></div>
                      <p className="text-sm text-brand-fg dark:text-white">
                        أكور توقع اتفاقية تطوير كبرى
                      </p>
                    </div>
                  </div>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton variant="ghost" size="sm" className="w-full mt-4">
                    عرض المزيد
                  </EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
            </div>
          </section>

          {/* قسم التفاعلات */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-fg dark:text-white mb-6">
              أزرار التفاعل
            </h2>
            
            <EnhancedCard variant="elevated" padding="lg">
              <div className="flex items-center justify-center gap-4">
                <EnhancedButton variant="ghost" size="md" leftIcon={<Heart className="w-5 h-5" />}>
                  <span className="text-brand-fgMuted dark:text-gray-400">إعجاب</span>
                  <span className="text-brand-fg dark:text-white font-semibold">· 1</span>
                </EnhancedButton>
                <EnhancedButton variant="ghost" size="md" leftIcon={<Bookmark className="w-5 h-5" />}>
                  <span className="text-brand-fgMuted dark:text-gray-400">حفظ</span>
                </EnhancedButton>
                <EnhancedButton variant="ghost" size="md" leftIcon={<Share2 className="w-5 h-5" />}>
                  <span className="text-brand-fgMuted dark:text-gray-400">مشاركة</span>
                </EnhancedButton>
              </div>
            </EnhancedCard>
          </section>

          {/* ملاحظة */}
          <div className="text-center">
            <EnhancedCard variant="outline" padding="lg">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-6 h-6 text-brand-accent" />
                <p className="text-brand-fgMuted dark:text-gray-400">
                  هذه صفحة عرض توضيحية للتصميم المحسّن. جميع المكونات تدعم الوضع الليلي والتأثيرات الحركية.
                </p>
              </div>
            </EnhancedCard>
          </div>
        </div>
      </main>
    </div>
  );
}

