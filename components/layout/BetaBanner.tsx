"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function BetaBanner() {
  const [visible, setVisible] = useState(true);
  const lastStateRef = useRef<boolean>(true);

  useEffect(() => {
    const applyOffset = (show: boolean) => {
      try {
        document.documentElement.style.setProperty('--beta-banner-offset', show ? '32px' : '0px');
      } catch {}
    };

    const onScroll = () => {
      const shouldShow = (window.scrollY || window.pageYOffset || 0) < 4;
      if (shouldShow !== lastStateRef.current) {
        lastStateRef.current = shouldShow;
        setVisible(shouldShow);
        applyOffset(shouldShow);
      }
    };

    // init
    const initialShow = (typeof window !== 'undefined') ? ((window.scrollY || 0) < 4) : true;
    lastStateRef.current = initialShow;
    setVisible(initialShow);
    applyOffset(initialShow);

    window.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => {
      window.removeEventListener('scroll', onScroll as any);
      applyOffset(false);
    };
  }, []);
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '32px',
        zIndex: 1100,
        background: 'rgba(59, 130, 246, 0.10)', // blue-500 at 10%
        color: '#1e40af', // blue-800
        borderBottom: '1px solid rgba(59, 130, 246, 0.30)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 200ms ease'
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.2px'
        }}
      >
        نسخة تجريبية — للمشاهدة والاختبار فقط
      </div>
    </div>
  );
}


