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

  return (
    <div
      className="welcome-meta-strip"
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: 'hsl(var(--muted))',
        marginBottom: '10px',
        flexWrap: 'wrap',
      }}
    >
      <span>{formatDate(now)}</span>
      {user && (
        <>
          <span style={{ color: 'hsl(var(--line))' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award style={{ width: '14px', height: '14px', color: '#FFA500' }} />
            لديك <strong style={{ color: 'hsl(var(--fg))', fontWeight: 600 }}>1,250</strong> نقطة ولاء
          </span>
        </>
      )}
    </div>
  );
}
