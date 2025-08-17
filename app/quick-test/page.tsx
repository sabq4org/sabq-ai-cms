export default function QuickTest() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F7',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        background: '#FFFFFF',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #E5E5EA',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#007AFF',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '40px',
          fontWeight: '700',
          margin: '0 auto 20px'
        }}>
          س
        </div>
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1D1D1F',
          marginBottom: '12px'
        }}>
          اختبار سريع
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#86868B',
          marginBottom: '30px'
        }}>
          إذا كنت ترى هذه الصفحة بوضوح، فإن السيرفر يعمل بشكل صحيح
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a 
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#007AFF',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '24px',
              fontWeight: '600'
            }}
          >
            📊 لوحة التحكم
          </a>
          
          <a 
            href="/sabq-admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'transparent',
              color: '#007AFF',
              textDecoration: 'none',
              border: '1px solid #007AFF',
              borderRadius: '24px',
              fontWeight: '600'
            }}
          >
            🎯 النسخة المضمونة
          </a>
          
          <a 
            href="/test-manus"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'transparent',
              color: '#86868B',
              textDecoration: 'none',
              border: '1px solid #E5E5EA',
              borderRadius: '24px',
              fontWeight: '600'
            }}
          >
            🧪 اختبار متقدم
          </a>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0369A1',
            marginBottom: '8px'
          }}>
            ✅ حالة النظام
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#0F766E',
            margin: 0
          }}>
            السيرفر يعمل • CSS محمل • JavaScript نشط
          </p>
        </div>
      </div>
    </div>
  );
}
