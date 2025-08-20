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
        gap: '12px',
        flexDirection: 'column',
        color: 'hsl(var(--muted))',
        marginBottom: '10px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
        <span style={{ color: 'hsl(var(--fg))', fontWeight: 800, fontSize: 'clamp(22px, 3.5vw, 32px)' }}>
          {getTimeBasedGreeting(now)}{user ? ` يا ${user.name}` : ''} <span style={{ fontSize: 22 }}>👋</span>
        </span>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ color: 'hsl(var(--line))' }}>•</span>
            <Award style={{ width: '14px', height: '14px', color: '#FFA500' }} />
            <span>
              لديك <strong style={{ color: 'hsl(var(--fg))', fontWeight: 600 }}>1,250</strong> نقطة ولاء
            </span>
          </div>
        )}
        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', marginTop: '4px' }}>
          {formatDate(now)}
        </span>
      </div>
    </div>
  );
}
