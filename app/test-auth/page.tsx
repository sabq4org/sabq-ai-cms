'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserInterests } from '@/hooks/useUserInterests';

export default function AuthTestPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { interests, loading: interestsLoading, error, getInterestNames, hasInterests } = useUserInterests();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔍 اختبار المصادقة والاهتمامات</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>حالة المصادقة:</h2>
        <p><strong>مسجل دخول:</strong> {isLoggedIn ? '✅ نعم' : '❌ لا'}</p>
        <p><strong>تحميل المصادقة:</strong> {authLoading ? '⏳ نعم' : '✅ انتهى'}</p>
        <p><strong>بيانات المستخدم:</strong></p>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {user ? JSON.stringify(user, null, 2) : 'لا يوجد مستخدم'}
        </pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>حالة الاهتمامات:</h2>
        <p><strong>تحميل الاهتمامات:</strong> {interestsLoading ? '⏳ نعم' : '✅ انتهى'}</p>
        <p><strong>يوجد اهتمامات:</strong> {hasInterests ? '✅ نعم' : '❌ لا'}</p>
        <p><strong>خطأ:</strong> {error || 'لا يوجد خطأ'}</p>
        <p><strong>عدد الاهتمامات:</strong> {interests.length}</p>
        <p><strong>أسماء الاهتمامات:</strong> {getInterestNames()}</p>
        <p><strong>بيانات الاهتمامات:</strong></p>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(interests, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 تحديث الصفحة
        </button>
      </div>
    </div>
  );
}
