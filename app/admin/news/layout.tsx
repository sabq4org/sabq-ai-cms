"use client";

/**
 * Layout نظيف لصفحة الأخبار - حل مركز على مشكلة الانحشار
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
      
      {/* wrapper بسيط */}
      <div className="manus-layout news-page-wrapper">
        {children}
      </div>

      {/* CSS مركز فقط على حل الانحشار */}
      <style jsx global>{`
        /* إعادة تعيين الهوامش للمحتوى الرئيسي */
        .news-page-wrapper {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* استهداف المحتوى المباشر داخل main */
        main > div > div,
        main > div > section,
        .fade-in > div,
        .fade-in > section {
          margin-left: auto !important;
          margin-right: auto !important;
          padding-left: 24px !important;
          padding-right: 24px !important;
        }
        
        /* إزالة أي margin-right زائد من العناصر */
        .news-page-wrapper *[style*="margin-right"],
        .news-page-wrapper *[style*="marginRight"] {
          margin-right: 0 !important;
        }
        
        /* التأكد من توسيط sections */
        .news-page-wrapper section {
          display: block !important;
          width: calc(100% - 48px) !important;
          max-width: 1400px !important;
          margin: 0 auto 24px auto !important;
        }
        
        /* توسيط grid البطاقات */
        .grid {
          display: grid !important;
          width: 100% !important;
          margin: 0 auto !important;
        }
        
        .grid-4 {
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 20px !important;
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
        }
      `}</style>
    </>
  );
}