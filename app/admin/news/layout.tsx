/**
 * Layout لصفحة الأخبار مع تطبيق تصميم Manus UI
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
      
      {/* wrapper للتصميم الموحد */}
      <div style={{ 
        padding: '0', 
        background: 'transparent', 
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </>
  );
}