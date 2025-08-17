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
      
      {/* تطبيق نفس تصميم الصفحة الرئيسية حرفياً + حل الانحشار */}
      <div className="manus-layout" style={{ background: 'hsl(var(--bg))', minHeight: '100vh' }}>
        {children}
      </div>

      {/* CSS بسيط لحل الانحشار فقط */}
      <style jsx global>{`
        /* حل مشكلة الانحشار يمين */
        .container, .max-w-7xl, .mx-auto {
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        /* تأكيد التوسيط للمحتوى */
        main, .main-content {
          display: flex !important;
          justify-content: center !important;
          width: 100% !important;
        }
        
        main > div, .main-content > div {
          width: 100% !important;
          max-width: none !important;
        }
        
        /* منع الانحشار للعناصر الكبيرة */
        section {
          width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        /* RTL fixes */
        html[dir="rtl"] .ml-auto {
          margin-left: 0 !important;
          margin-right: auto !important;
        }
        
        html[dir="rtl"] .justify-end {
          justify-content: flex-start !important;
        }
      `}</style>

    </>
  );
}