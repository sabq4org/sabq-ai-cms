"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { 
  Settings, 
  Info, 
  Zap, 
  Shield, 
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";

// تحميل المكون بشكل ديناميكي لتجنب مشاكل SSR
const SidebarCustomizer = dynamic(
  () => import("@/components/admin/sidebar/SidebarCustomizer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: 'hsl(var(--accent))' }}
        ></div>
        <span 
          className="mr-2"
          style={{ color: 'hsl(var(--text-muted))' }}
        >
          جاري تحميل محرر الشريط الجانبي...
        </span>
      </div>
    ),
  }
);

export default function SidebarSettingsPage() {
  const { darkMode } = useDarkModeContext();
  const [stats, setStats] = useState({
    activeItems: 8,
    hiddenItems: 3,
    customOrder: true,
    lastUpdate: "قبل 5 دقائق"
  });

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      <div style={{ 
        backgroundColor: 'hsl(var(--bg))', 
        color: 'hsl(var(--fg))',
        minHeight: '100vh'
      }}>
      <div style={{ padding: '24px' }}>
        {/* رسالة الترحيب والإحصائيات */}
        <div className="card card-accent mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="heading-2 mb-2">مرحباً في إعدادات الشريط الجانبي! 🎨</h1>
                <p className="text-muted">
                  خصص ترتيب وظهور عناصر الشريط الجانبي حسب احتياجاتك
                </p>
              </div>
              <div 
                className="p-3 rounded-2xl shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))'
                }}
              >
                <Settings className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* الإحصائيات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {/* إحصائية 1: العناصر النشطة */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'hsla(var(--accent), 0.1)',
                  border: '1px solid hsla(var(--accent), 0.2)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                    العناصر النشطة
                  </span>
                  <ArrowUpRight className="w-4 h-4" style={{ color: 'hsl(var(--success))' }} />
                </div>
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--fg))' }}>
                  {stats.activeItems}
                </div>
              </div>

              {/* إحصائية 2: العناصر المخفية */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'hsla(var(--warning), 0.1)',
                  border: '1px solid hsla(var(--warning), 0.2)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                    العناصر المخفية
                  </span>
                  <ArrowDownRight className="w-4 h-4" style={{ color: 'hsl(var(--warning))' }} />
                </div>
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--fg))' }}>
                  {stats.hiddenItems}
                </div>
              </div>

              {/* إحصائية 3: الترتيب المخصص */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'hsla(var(--success), 0.1)',
                  border: '1px solid hsla(var(--success), 0.2)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                    ترتيب مخصص
                  </span>
                  <Zap className="w-4 h-4" style={{ color: 'hsl(var(--success))' }} />
                </div>
                <div className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>
                  {stats.customOrder ? 'مفعّل' : 'معطّل'}
                </div>
              </div>

              {/* إحصائية 4: آخر تحديث */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'hsla(var(--info), 0.1)',
                  border: '1px solid hsla(var(--info), 0.2)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                    آخر تحديث
                  </span>
                  <Clock className="w-4 h-4" style={{ color: 'hsl(var(--info))' }} />
                </div>
                <div className="text-lg font-bold" style={{ color: 'hsl(var(--fg))' }}>
                  {stats.lastUpdate}
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* شريط التنبيه */}
          <div 
            className="card mb-6"
            style={{ 
              backgroundColor: 'hsl(var(--info-bg))',
              borderColor: 'hsl(var(--info))'
            }}
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5" style={{ color: 'hsl(var(--info))' }} />
                <div className="flex-1">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'hsl(var(--fg))' }}
                  >
                    هذه الميزة متاحة للمديرين فقط
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'hsl(var(--text-muted))' }}
                  >
                    التغييرات ستؤثر على حسابك فقط وليس على المستخدمين الآخرين
                  </p>
                </div>
                <div className="chip">
                  <Zap className="w-3 h-3 ml-1" />
                  مدير النظام
                </div>
              </div>
            </div>
          </div>

        {/* المكون الرئيسي للتخصيص */}
        <div className="card mb-6">
          <div className="card-header">
            <div className="card-title">تخصيص الشريط الجانبي</div>
          </div>
          <div 
            className="p-6"
            style={{ 
              backgroundColor: 'hsl(var(--card-bg))',
              borderTop: '1px solid hsl(var(--border))'
            }}
          >
            <SidebarCustomizer />
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title flex items-center gap-2">
                <Lightbulb className="w-5 h-5" style={{ color: 'hsl(var(--warning))' }} />
                نصائح للاستخدام
              </div>
            </div>
            <div 
              className="p-6"
              style={{ 
                backgroundColor: 'hsl(var(--card-bg))',
                borderTop: '1px solid hsl(var(--border))'
              }}
            >
              <ul className="space-y-3 text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                <li className="flex items-start gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: 'hsl(var(--accent))' }}
                  >•</span>
                  <span>اسحب العناصر من الأيقونة المخططة لإعادة ترتيبها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: 'hsl(var(--success))' }}
                  >•</span>
                  <span>استخدم المفتاح لإظهار أو إخفاء العناصر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: 'hsl(var(--info))' }}
                  >•</span>
                  <span>احفظ التغييرات لتطبيقها على حسابك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: 'hsl(var(--warning))' }}
                  >•</span>
                  <span>يمكنك إعادة تعيين الإعدادات للوضع الافتراضي</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: 'hsl(var(--success))' }} />
                الخصوصية والأمان
              </div>
            </div>
            <div 
              className="p-6"
              style={{ 
                backgroundColor: 'hsl(var(--card-bg))',
                borderTop: '1px solid hsl(var(--border))'
              }}
            >
              <ul className="space-y-3 text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                <li className="flex items-start gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: 'hsl(var(--success))' }}
                  >✓</span>
                  <span>التفضيلات محفوظة بشكل آمن في الخادم</span>
                </li>
                <li className="flex items-start gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: 'hsl(var(--success))' }}
                  >✓</span>
                  <span>لا تؤثر على تجربة المستخدمين الآخرين</span>
                </li>
                <li className="flex items-start gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: 'hsl(var(--success))' }}
                  >✓</span>
                  <span>يمكن استردادها عند تسجيل الدخول من أي جهاز</span>
                </li>
                <li className="flex items-start gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: 'hsl(var(--info))' }}
                  >ℹ</span>
                  <span>تحديث الصفحة مطلوب لرؤية التغييرات</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
