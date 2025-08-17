"use client";

/**
 * Layout قوي جداً لحل مشكلة الانحشار نهائياً
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
      
      {/* wrapper */}
      <div className="manus-layout news-page-fix">
        {children}
      </div>

      {/* CSS قوي جداً لإجبار التوسيط */}
      <style jsx global>{`
        /* إعادة تعيين كاملة للصفحة */
        .news-page-fix,
        .news-page-fix * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        
        /* إعادة padding للعناصر التي تحتاجه */
        .news-page-fix .card,
        .news-page-fix button,
        .news-page-fix input {
          padding: 16px !important;
        }
        
        /* حل جذري - إجبار كل شيء على التوسط */
        body main {
          margin-right: 0 !important;
          padding-right: 0 !important;
        }
        
        /* استهداف الـ fade-in div مباشرة */
        .fade-in {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* استهداف المحتوى الأساسي */
        .fade-in > div:first-child {
          width: 100% !important;
          max-width: 1600px !important;
          margin: 0 auto !important;
          padding: 0 24px !important;
        }
        
        /* إجبار sections على التوسط */
        section {
          width: 100% !important;
          max-width: 1600px !important;
          margin: 0 auto 24px auto !important;
          padding: 0 !important;
        }
        
        /* Grid system */
        .grid {
          display: grid !important;
          width: 100% !important;
          gap: 20px !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        
        .grid-4 {
          grid-template-columns: repeat(4, 1fr) !important;
        }
        
        @media (max-width: 1200px) {
          .grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .grid-4 {
            grid-template-columns: 1fr !important;
          }
          
          /* للموبايل - تأكد من عدم وجود margin */
          body main {
            margin: 0 !important;
          }
        }
        
        /* حل نووي - استهداف كل العناصر الممكنة */
        [class*="dashboard"],
        [class*="admin"],
        [class*="content"],
        [class*="container"] {
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        /* تأكيد على البطاقات */
        .card {
          margin: 0 !important;
        }
        
        /* إزالة أي تأثير من الـ sidebar */
        main[style*="marginRight"],
        main[style*="margin-right"] {
          margin-right: 0 !important;
        }
      `}</style>
    </>
  );
}