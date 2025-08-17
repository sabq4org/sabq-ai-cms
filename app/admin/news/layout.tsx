"use client";

/**
 * Layout نظيف لصفحة الأخبار مع تطبيق Manus UI وحل مشكلة الانحشار
 */

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* تحميل CSS Manus UI */}
      <link rel="stylesheet" href="/manus-ui.css" />
      
      {/* تطبيق نفس تصميم الصفحة الرئيسية حرفياً */}
      <div className="manus-layout" style={{ background: 'hsl(var(--bg))', minHeight: '100vh' }}>
        {children}
      </div>

    </>
  );
}