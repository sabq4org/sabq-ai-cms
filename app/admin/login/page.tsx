"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from './login.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.token && typeof document !== 'undefined') {
            document.cookie = `auth-token=${data.token}; path=/; max-age=${60 * 60}; SameSite=Lax`;
          }
          router.replace("/admin");
        } else {
          alert(data.error || "فشل تسجيل الدخول");
        }
      } else {
        alert(`خطأ: ${res.status}`);
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #2563eb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '20px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0',
                letterSpacing: '2px'
              }}>
                سبق الذكية
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.9)',
                margin: '8px 0 0 0',
                fontSize: '14px'
              }}>
                منصة الصحافة الذكية
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                تسجيل دخول الإداريين
              </h2>
              <p style={{
                color: '#6b7280',
                margin: '0',
                fontSize: '16px'
              }}>
                ادخل بياناتك للوصول إلى لوحة التحكم
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'right'
                }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sabq.io"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    textAlign: 'right',
                    boxSizing: 'border-box',
                    direction: 'ltr'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'right'
                }}>
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    textAlign: 'right',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  transform: loading ? 'none' : 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div className={styles.spinner}></div>
                    جاري الدخول...
                  </div>
                ) : (
                  'دخول إلى لوحة التحكم'
                )}
              </button>
            </form>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 8px 0',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                للاختبار والتجربة:
              </p>
              <div style={{ fontSize: '13px', color: '#475569', textAlign: 'center' }}>
                <div>البريد: admin@sabq.io</div>
                <div style={{ marginTop: '4px' }}>كلمة المرور: admin123</div>
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '30px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '14px'
          }}>
            <p style={{ margin: '0' }}>
              محمي بأحدث تقنيات الأمان والتشفير
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}