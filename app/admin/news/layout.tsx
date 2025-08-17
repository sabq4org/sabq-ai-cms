"use client";

/**
 * Layout لصفحة الأخبار مع تطبيق تصميم Manus UI بالكامل
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
      
      {/* تطبيق تصميم Manus UI على كامل الصفحة */}
      <div 
        className="manus-layout"
        style={{ 
          background: 'hsl(var(--bg))',
          minHeight: '100vh',
          color: 'hsl(var(--fg))',
          padding: '0'
        }}
      >
        <style jsx global>{`
          /* تطبيق تصميم Manus UI على البطاقات الموجودة */
          .card, [class*="StandardCard"] {
            background: hsl(var(--bg-card)) !important;
            border: 1px solid hsl(var(--line)) !important;
            border-radius: 12px !important;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
            transition: all 0.2s ease !important;
          }
          
          .card:hover, [class*="StandardCard"]:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          }
          
          /* تطبيق ألوان Manus UI على النصوص */
          .text-gray-900 { color: hsl(var(--fg)) !important; }
          .text-gray-600 { color: hsl(var(--muted)) !important; }
          .text-gray-400 { color: hsl(var(--muted)) !important; }
          
          /* تطبيق ألوان الخلفية */
          .bg-white { background: hsl(var(--bg-card)) !important; }
          .bg-gray-50 { background: hsl(var(--bg)) !important; }
          
          /* الأزرار والعناصر التفاعلية */
          .bg-blue-50 { background: hsl(var(--accent) / 0.1) !important; }
          .text-blue-600 { color: hsl(var(--accent)) !important; }
          
          /* الحدود */
          .border-gray-200 { border-color: hsl(var(--line)) !important; }
          .border-gray-300 { border-color: hsl(var(--line)) !important; }
          
          /* Input fields */
          input, select, textarea {
            background: hsl(var(--bg-card)) !important;
            border: 1px solid hsl(var(--line)) !important;
            color: hsl(var(--fg)) !important;
          }
          
          input:focus, select:focus, textarea:focus {
            border-color: hsl(var(--accent)) !important;
            box-shadow: 0 0 0 3px hsl(var(--accent) / 0.1) !important;
          }
          
          /* الجداول */
          table {
            background: hsl(var(--bg-card)) !important;
            border: 1px solid hsl(var(--line)) !important;
          }
          
          th, td {
            border-color: hsl(var(--line)) !important;
          }
          
          /* وضع الظلام */
          .dark .card, .dark [class*="StandardCard"] {
            background: hsl(var(--bg-card)) !important;
            border-color: hsl(var(--line)) !important;
          }
        `}</style>
        
        {children}
      </div>
    </>
  );
}