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
          /* تعريف نظام Grid للبطاقات محسن */
          .grid {
            display: grid !important;
            gap: 20px !important;
            width: 100% !important;
            margin-bottom: 24px !important;
          }
          
          .grid-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .grid-3 {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .grid-4 {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          
          /* Responsive Grid محسن */
          @media (max-width: 1400px) {
            .grid-4 {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
          
          @media (max-width: 1024px) {
            .grid-4 {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          
          @media (max-width: 640px) {
            .grid-4, .grid-3, .grid-2 {
              grid-template-columns: 1fr !important;
            }
          }

          /* تطبيق تصميم Manus UI على البطاقات الموجودة */
          .card, [class*="StandardCard"] {
            background: hsl(var(--bg-card)) !important;
            border: 1px solid hsl(var(--line)) !important;
            border-radius: 16px !important;
            box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.08), 0 1px 4px -1px rgb(0 0 0 / 0.06) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            padding: 24px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            min-height: 140px !important;
            position: relative !important;
            overflow: hidden !important;
          }
          
          .card:hover, [class*="StandardCard"]:hover {
            transform: translateY(-4px) scale(1.02) !important;
            box-shadow: 0 10px 25px 0 rgb(0 0 0 / 0.1), 0 4px 12px -2px rgb(0 0 0 / 0.05) !important;
          }
          
          /* البطاقات المختارة مع تأثيرات أفضل */
          .card.selected {
            border-color: transparent !important;
            box-shadow: 0 4px 20px 0 rgb(0 0 0 / 0.15), 0 0 0 2px hsl(var(--accent) / 0.3) !important;
            transform: translateY(-2px) !important;
          }
          
          /* أنواع البطاقات المختلفة مع gradients */
          .card-success.selected {
            background: linear-gradient(135deg, hsl(var(--accent-3)) 0%, hsl(var(--accent-3) / 0.8) 100%) !important;
            color: white !important;
          }
          
          .card-warning.selected {
            background: linear-gradient(135deg, hsl(var(--accent-4)) 0%, hsl(var(--accent-4) / 0.8) 100%) !important;
            color: white !important;
          }
          
          .card-info.selected {
            background: linear-gradient(135deg, hsl(var(--accent-2)) 0%, hsl(var(--accent-2) / 0.8) 100%) !important;
            color: white !important;
          }
          
          .card-danger.selected {
            background: linear-gradient(135deg, hsl(var(--accent-5)) 0%, hsl(var(--accent-5) / 0.8) 100%) !important;
            color: white !important;
          }
          
          /* تحسين النصوص داخل البطاقات */
          .card .heading-2 {
            font-size: 28px !important;
            font-weight: 700 !important;
            margin: 8px 0 !important;
            line-height: 1.2 !important;
          }
          
          .card .chip {
            font-size: 11px !important;
            font-weight: 600 !important;
            padding: 6px 12px !important;
            border-radius: 20px !important;
            backdrop-filter: blur(10px) !important;
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
          
          /* تحسين المساحات والتخطيط العام */
          section {
            margin-bottom: 32px !important;
          }
          
          /* Input fields محسنة */
          input, select, textarea {
            background: hsl(var(--bg-card)) !important;
            border: 1px solid hsl(var(--line)) !important;
            color: hsl(var(--fg)) !important;
            border-radius: 8px !important;
            padding: 12px 16px !important;
            transition: all 0.2s ease !important;
          }
          
          input:focus, select:focus, textarea:focus {
            border-color: hsl(var(--accent)) !important;
            box-shadow: 0 0 0 3px hsl(var(--accent) / 0.1) !important;
            outline: none !important;
          }
          
          /* الجداول محسنة */
          table {
            background: hsl(var(--bg-card)) !important;
            border: 1px solid hsl(var(--line)) !important;
            border-radius: 12px !important;
            overflow: hidden !important;
          }
          
          th, td {
            border-color: hsl(var(--line)) !important;
            padding: 12px 16px !important;
          }
          
          th {
            background: hsl(var(--bg-elevated)) !important;
            font-weight: 600 !important;
          }
          
          /* وضع الظلام محسن */
          .dark .card, .dark [class*="StandardCard"] {
            background: hsl(var(--bg-card)) !important;
            border-color: hsl(var(--line)) !important;
          }
          
          /* تحسين الأزرار */
          button {
            border-radius: 8px !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
          }
          
          button:hover {
            transform: translateY(-1px) !important;
          }
        `}</style>
        
        {children}
      </div>
    </>
  );
} 