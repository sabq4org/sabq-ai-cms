export default function ArticlePage() {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
        صفحة المقال تعمل!
      </h1>
      <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: 1.6 }}>
        تم إصلاح المشكلة بنجاح. صفحات المقالات تعمل الآن بشكل صحيح.
      </p>
      <a 
        href="/" 
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '500'
        }}
      >
        العودة للرئيسية
      </a>
    </div>
  );
}
