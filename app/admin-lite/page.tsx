"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  FileText, 
  Eye, 
  Clock,
  Plus,
  ArrowUp
} from "lucide-react";

export default function AdminLitePage() {
  const [stats, setStats] = useState({
    todayArticles: 0,
    totalViews: 0,
    publishedCount: 0,
    draftCount: 0
  });

  useEffect(() => {
    // جلب الإحصائيات
    fetch("/api/stats/summary")
      .then(res => res.json())
      .then(data => {
        setStats({
          todayArticles: data.todayArticles || 0,
          totalViews: data.totalViews || 0,
          publishedCount: data.publishedCount || 0,
          draftCount: data.draftCount || 0
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      {/* رسالة الترحيب */}
      <div style={{
        background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))",
        color: "white",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px"
      }}>
        <h1 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
          مرحباً في النسخة الخفيفة
        </h1>
        <p style={{ fontSize: "14px", opacity: 0.9 }}>
          إدارة سريعة ومبسطة للمحتوى
        </p>
      </div>

      {/* الإحصائيات */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)", 
        gap: "12px",
        marginBottom: "20px"
      }}>
        <StatCard
          title="أخبار اليوم"
          value={stats.todayArticles}
          icon={FileText}
          color="#3B82F6"
        />
        <StatCard
          title="المشاهدات"
          value={stats.totalViews}
          icon={Eye}
          color="#10B981"
        />
        <StatCard
          title="منشور"
          value={stats.publishedCount}
          icon={TrendingUp}
          color="#8B5CF6"
        />
        <StatCard
          title="مسودات"
          value={stats.draftCount}
          icon={Clock}
          color="#F59E0B"
        />
      </div>

      {/* الإجراءات السريعة */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
          إجراءات سريعة
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link
            href="/admin/news/unified"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              background: "hsl(var(--accent))",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            <Plus size={20} />
            إنشاء خبر جديد
          </Link>
          
          <Link
            href="/admin-lite/news"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              background: "hsl(var(--bg-card))",
              color: "hsl(var(--fg))",
              border: "1px solid hsl(var(--line))",
              borderRadius: "8px",
              textDecoration: "none"
            }}
          >
            <FileText size={20} />
            إدارة الأخبار
          </Link>
        </div>
      </div>

      {/* نصائح */}
      <div style={{
        background: "hsl(var(--bg-card))",
        border: "1px solid hsl(var(--line))",
        borderRadius: "8px",
        padding: "16px"
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
          💡 نصيحة اليوم
        </h3>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", lineHeight: "1.6" }}>
          استخدم الاختصارات في لوحة المفاتيح لتسريع عملك. 
          اضغط على Ctrl+N لإنشاء خبر جديد.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div style={{
      background: "hsl(var(--bg-card))",
      border: "1px solid hsl(var(--line))",
      borderRadius: "8px",
      padding: "16px"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <Icon size={20} style={{ color }} />
        <ArrowUp size={14} style={{ color: "#10B981" }} />
      </div>
      <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: "12px", color: "hsl(var(--muted))" }}>
        {title}
      </div>
    </div>
  );
}
