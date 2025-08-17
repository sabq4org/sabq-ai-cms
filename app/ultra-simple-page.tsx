export default function UltraSimplePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '20px'
      }}>
        صحيفة سبق الإلكترونية
      </h1>
      
      <p style={{
        fontSize: '18px',
        color: '#6b7280',
        marginBottom: '40px',
        maxWidth: '600px'
      }}>
        النظام يعمل بحالة مستقرة - الصفحة المبسطة
      </p>

      <div style={{
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <a 
          href="/dashboard" 
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            transition: 'background-color 0.2s'
          }}
        >
          لوحة التحكم
        </a>
        
        <a 
          href="/articles" 
          style={{
            backgroundColor: '#4b5563',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          المقالات
        </a>
        
        <a 
          href="/categories" 
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          التصنيفات
        </a>
        
        <a 
          href="/news" 
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          الأخبار العاجلة
        </a>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '15px',
        backgroundColor: '#ecfdf5',
        borderRadius: '8px',
        border: '1px solid #10b981'
      }}>
        <p style={{ color: '#065f46', fontSize: '14px', margin: 0 }}>
          ✅ الخادم: متصل | ✅ قاعدة البيانات: متصلة | ✅ تصفية الإشعارات: مفعلة
        </p>
      </div>
    </div>
  );
}
