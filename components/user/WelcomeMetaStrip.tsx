import React from 'react';
import { Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function WelcomeMetaStrip() {
  const { user } = useAuth();
  const [now, setNow] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const getTimeBasedGreeting = (d: Date) => {
    const hour = d.getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <div
      className="welcome-meta-strip"
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '8px',
        flexDirection: 'column',
        color: 'hsl(var(--muted))',
        marginBottom: '6px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
        <span style={{ color: 'hsl(var(--fg))', fontWeight: 700, fontSize: 'clamp(16px, 2.8vw, 20px)' }}>
          {getTimeBasedGreeting(now)}{user ? ` يا ${user.name}` : ''} <span style={{ fontSize: 18 }}>👋</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Award style={{ width: '12px', height: '12px', color: '#FFA500' }} />
              <span style={{ fontSize: 'clamp(11px, 2.2vw, 12px)' }}>
                لديك <strong style={{ color: 'hsl(var(--fg))', fontWeight: 600 }}>1,250</strong> نقطة ولاء
              </span>
            </div>
          )}
          <span style={{ fontSize: 'clamp(11px, 2.2vw, 12px)' }}>
            {formatDate(now)}
          </span>
        </div>
      </div>
    </div>
  );
}
