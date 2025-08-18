"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { Info, Settings, Zap } from "lucide-react";
import dynamic from "next/dynamic";

// تحميل المكون بشكل ديناميكي لتجنب مشاكل SSR
const SidebarCustomizer = dynamic(
  () => import("@/components/admin/sidebar/SidebarCustomizer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="mr-2">جاري تحميل محرر الشريط الجانبي...</span>
      </div>
    ),
  }
);

export default function SidebarSettingsPage() {
  const { darkMode } = useDarkModeContext();

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      <div style={{ 
        minHeight: '100vh', 
        background: 'hsl(var(--bg))', 
        padding: '24px',
        color: 'hsl(var(--fg))'
      }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent) / 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--accent))'
            }}>
              <Settings style={{ width: '24px', height: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="heading-2" style={{ marginBottom: '8px' }}>
                إعدادات الشريط الجانبي
              </h2>
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                خصص ترتيب وظهور عناصر الشريط الجانبي في لوحة التحكم
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="chip">
                  🎛️ تخصيص متقدم
                </div>
                <div className="chip chip-muted">
                  ⚡ تطبيق فوري
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* شريط التنبيه */}
        <div className="card" style={{ 
          marginBottom: '24px',
          background: 'hsl(var(--accent) / 0.05)',
          border: '1px solid hsl(var(--accent) / 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info style={{ width: '20px', height: '20px', color: 'hsl(var(--accent))' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'hsl(var(--accent))', marginBottom: '4px' }}>
                هذه الميزة متاحة للمديرين فقط
              </p>
              <p className="text-xs text-muted">
                التغييرات ستؤثر على حسابك فقط وليس على المستخدمين الآخرين
              </p>
            </div>
            <div className="chip" style={{ background: 'hsl(var(--accent) / 0.1)', color: 'hsl(var(--accent))' }}>
              <Zap style={{ width: '12px', height: '12px', marginLeft: '4px' }} />
              مدير النظام
            </div>
          </div>
        </div>

        {/* المكون الرئيسي للتخصيص */}
        <SidebarCustomizer />

        {/* معلومات إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginTop: '32px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💡 نصائح للاستخدام</h3>
              <p className="text-muted">
                نصائح لتحسين تجربة استخدام الشريط الجانبي
              </p>
            </div>
            <div style={{ padding: '0 24px 24px 24px' }}>
              <ul style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'hsl(var(--accent))', fontWeight: 'bold' }}>•</span>
                  اسحب العناصر من الأيقونة المخططة لإعادة ترتيبها
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'hsl(var(--accent-3))', fontWeight: 'bold' }}>•</span>
                  استخدم المفتاح لإظهار أو إخفاء العناصر
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'hsl(var(--accent-2))', fontWeight: 'bold' }}>•</span>
                  احفظ التغييرات لتطبيقها على حسابك
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'hsl(var(--accent-4))', fontWeight: 'bold' }}>•</span>
                  يمكنك إعادة تعيين الإعدادات للوضع الافتراضي
                </li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🔒 الخصوصية والأمان</h3>
              <p className="text-muted">
                معلومات حول أمان وخصوصية إعداداتك
              </p>
            </div>
            <div style={{ padding: '0 24px 24px 24px' }}>
              <ul style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'hsl(var(--accent-3))', fontWeight: 'bold' }}>✓</span>
                  التفضيلات محفوظة بشكل آمن في الخادم
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'hsl(var(--accent-3))', fontWeight: 'bold' }}>✓</span>
                  لا تؤثر على تجربة المستخدمين الآخرين
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'hsl(var(--accent-3))', fontWeight: 'bold' }}>✓</span>
                  يمكن استردادها عند تسجيل الدخول من أي جهاز
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'hsl(var(--accent))', fontWeight: 'bold' }}>ℹ</span>
                  تحديث الصفحة مطلوب لرؤية التغييرات
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>)
  );
}
