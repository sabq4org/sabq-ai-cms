"use client";

import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";

export default function WelcomeBlock() {
  const { user } = useAuth();
  
  const aiMotivationalMessages = [
    "🚀 معاً نبني مستقبل الذكاء الاصطناعي في الإعلام",
    "⚡ نحول الأفكار إلى محتوى ذكي ومؤثر", 
    "🎯 كل مقال قصة، وكل قصة تغيير",
    "💡 الإبداع يلتقي بالذكاء الاصطناعي هنا",
    "🌟 نصنع المحتوى الذي يشكل المستقبل",
    "🔮 نرى ما لا يراه الآخرون في البيانات",
    "🎨 نحول الأرقام إلى قصص ملهمة"
  ];
  
  const [currentMessage, setCurrentMessage] = useState(() => 
    aiMotivationalMessages[Math.floor(Math.random() * aiMotivationalMessages.length)]
  );

  return (
    <section style={{ marginBottom: '6px' }}>
      <div className="card card-accent" style={{ 
        textAlign: 'center',
        background: 'hsl(var(--bg))',
        border: '1px solid hsl(var(--accent) / 0.2)',
        padding: '10px',
        borderLeftWidth: '4px'
      }}>
        <div style={{ fontSize: '28px', marginBottom: '6px' }}>🤖</div>
        <div className="card-title" style={{ fontSize: '18px', marginBottom: '3px', lineHeight: '1.2' }}>
          مرحباً يا {user?.name || 'مدير النظام'} 
        </div>
        <div className="card-subtitle" style={{ 
          marginBottom: '10px', 
          fontSize: '14px', 
          color: 'hsl(var(--accent))',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => {
          const newMessage = aiMotivationalMessages[Math.floor(Math.random() * aiMotivationalMessages.length)];
          setCurrentMessage(newMessage);
        }}
        title="اضغط للحصول على رسالة جديدة"
        >
          {currentMessage}
        </div>
      </div>
    </section>
  );
}
