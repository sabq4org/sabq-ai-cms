'use client';

export default function SimpleTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          اختبار React
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          إذا كنت ترى هذه الصفحة، فإن React يعمل!
        </p>
        <button 
          onClick={() => alert('React يعمل بشكل صحيح!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          اضغط هنا للاختبار
        </button>
      </div>
    </div>
  );
} 