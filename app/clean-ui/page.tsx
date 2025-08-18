/**
 * واجهة المستخدم النظيفة - الصفحة الرئيسية
 * Clean UI - Home Page
 */

"use client";

import React from "react";
import CleanHeader from "@/components/clean-ui/CleanHeader";
import CleanNewsGrid from "@/components/clean-ui/CleanNewsGrid";
import CleanSidebar from "@/components/clean-ui/CleanSidebar";
import CleanFooter from "@/components/clean-ui/CleanFooter";

export default function CleanUIPage() {
  return (
    <div className="clean-ui-container">
      {/* تحميل CSS النظيف */}
      <link rel="stylesheet" href="/clean-ui.css" />
      
      {/* الهيدر */}
      <CleanHeader />
      
      {/* المحتوى الرئيسي */}
      <div className="clean-main-container">
        <div className="clean-content-wrapper">
          {/* المحتوى الرئيسي */}
          <main className="clean-main-content">
            {/* الأخبار العاجلة */}
            <section className="clean-breaking-section">
              <div className="clean-section-header">
                <h2 className="clean-section-title">الأخبار العاجلة</h2>
                <span className="clean-section-badge">مباشر</span>
              </div>
              <div className="clean-breaking-ticker">
                <span className="clean-ticker-text">
                  عاجل: توقيع اتفاقية ثلاثية تمكن المستفيدين من التملك في 24 مشروعاً سكنياً
                </span>
              </div>
            </section>

            {/* شبكة الأخبار الرئيسية */}
            <CleanNewsGrid />
          </main>
          
          {/* الشريط الجانبي */}
          <aside className="clean-sidebar">
            <CleanSidebar />
          </aside>
        </div>
      </div>
      
      {/* الفوتر */}
      <CleanFooter />
    </div>
  );
}
