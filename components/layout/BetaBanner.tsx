"use client";

import React from 'react';

export default function BetaBanner() {
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
        borderBottom: '1px solid rgba(59, 130, 246, 0.30)'
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


