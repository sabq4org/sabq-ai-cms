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
      
      {/* هيكل صفحة نظيف مع Grid */}
      <div className="min-h-screen" style={{ background: 'hsl(var(--bg))' }}>
        {/* شبكة من عمودين: sidebar ثابت + محتوى يتمدد */}
        <div className="grid gap-0 grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
          
          {/* الشريط الجانبي يمين في RTL تلقائياً */}
          <aside className="sticky top-0 h-screen overflow-y-auto border-s" 
                 style={{ 
                   background: 'hsl(var(--bg-elevated))', 
                   borderColor: 'hsl(var(--line))'
                 }}>
            <div className="px-4 py-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--fg))' }}>
                  سبق الذكية
                </h2>
                <p className="text-sm" style={{ color: 'hsl(var(--muted))' }}>
                  إدارة الأخبار
                </p>
              </div>
              
              {/* قائمة سريعة للملاحة */}
              <nav className="space-y-2">
                <a href="/admin" className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-blue-500 transition-colors" 
                   style={{ color: 'hsl(var(--muted))' }}>
                  ← الرئيسية
                </a>
                <div className="p-3 rounded-lg" 
                     style={{ background: 'hsl(var(--accent) / 0.1)', color: 'hsl(var(--accent))' }}>
                  📰 الأخبار
                </div>
                <a href="/admin/users" className="block p-3 rounded-lg hover:bg-opacity-10 hover:bg-blue-500 transition-colors"
                   style={{ color: 'hsl(var(--muted))' }}>
                  👥 المستخدمين
                </a>
              </nav>
            </div>
          </aside>

          {/* منطقة المحتوى: أهم شيء min-w-0 عشان ما تنحشر */}
          <main className="min-w-0">
            <div className="mx-auto max-w-screen-2xl px-4 lg:px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* CSS مخصص للبطاقات والتصميم */}
      <style jsx global>{`
        /* إعدادات RTL أساسية لمنع الانحشار */
        html[dir="rtl"] .container { 
          margin-inline: auto; 
        }
        html[dir="rtl"] .push-start { 
          margin-inline-start: auto; 
        }
        
        /* تعريف نظام Grid للبطاقات */
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
        
        /* Responsive Grid */
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

        /* تصميم البطاقات محسن */
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
        
        /* البطاقات المختارة */
        .card.selected {
          border-color: transparent !important;
          box-shadow: 0 4px 20px 0 rgb(0 0 0 / 0.15), 0 0 0 2px hsl(var(--accent) / 0.3) !important;
          transform: translateY(-2px) !important;
        }
        
        /* أنواع البطاقات المختلفة */
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
        
        /* تحسين ألوان النصوص */
        .text-gray-900 { color: hsl(var(--fg)) !important; }
        .text-gray-600 { color: hsl(var(--muted)) !important; }
        .text-gray-400 { color: hsl(var(--muted)) !important; }
        .bg-white { background: hsl(var(--bg-card)) !important; }
        .bg-gray-50 { background: hsl(var(--bg)) !important; }
        .bg-blue-50 { background: hsl(var(--accent) / 0.1) !important; }
        .text-blue-600 { color: hsl(var(--accent)) !important; }
        .border-gray-200 { border-color: hsl(var(--line)) !important; }
        .border-gray-300 { border-color: hsl(var(--line)) !important; }
        
        /* تحسين عام للعناصر */
        section {
          margin-bottom: 32px !important;
        }
        
        input, select, textarea {
          background: hsl(var(--bg-card)) !important;
          border: 1px solid hsl(var(--line)) !important;
          color: hsl(var(--fg)) !important;
          border-radius: 8px !important;
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: hsl(var(--accent)) !important;
          box-shadow: 0 0 0 3px hsl(var(--accent) / 0.1) !important;
          outline: none !important;
        }
        
        table {
          background: hsl(var(--bg-card)) !important;
          border: 1px solid hsl(var(--line)) !important;
          border-radius: 12px !important;
        }
        
        th, td {
          border-color: hsl(var(--line)) !important;
        }
      `}</style>
    </>
  );
}