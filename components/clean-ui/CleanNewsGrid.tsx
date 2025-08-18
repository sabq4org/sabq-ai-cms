/**
 * Clean News Grid Component
 * شبكة الأخبار النظيفة
 */

import React from "react";
import Link from "next/link";

// بيانات تجريبية
const sampleNews = [
  {
    id: 1,
    title: "التوقيع على اتفاقية ثلاثية تمكن المستفيدين من التملك في 24 مشروعاً سكنياً",
    category: "عام",
    date: "قبل ساعة",
    views: 156,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop"
  },
  {
    id: 2,
    title: "أدير العقارية تتألق في نجاح مزاد كندة بمكة المكرمة بقيمة تجاوزت 150 مليون ريال",
    category: "اقتصاد",
    date: "قبل ساعتين",
    views: 243,
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=500&fit=crop"
  },
  {
    id: 3,
    title: "ارتفاع مشاركة المرأة السعودية بالقوى العاملة إلى 36.2%",
    category: "محليات",
    date: "قبل 3 ساعات",
    views: 512,
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=500&fit=crop"
  },
  {
    id: 4,
    title: "مزاد الصقور الدولي 2025 يستقطب عشاق الطيور من جميع أنحاء العالم",
    category: "ثقافة",
    date: "قبل 4 ساعات",
    views: 389,
    image: "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=800&h=500&fit=crop"
  },
  {
    id: 5,
    title: "انطلاق منصة عروض صيف السعودية بعروض سياحية متنوعة",
    category: "سياحة",
    date: "قبل 5 ساعات",
    views: 298,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop"
  },
  {
    id: 6,
    title: "وزير الشؤون الإسلامية يوجه بتخصيص خطبة الجمعة للحديث عن فضل العلم",
    category: "عام",
    date: "قبل 6 ساعات",
    views: 445,
    image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&h=500&fit=crop"
  }
];

export default function CleanNewsGrid() {
  return (
    <div className="clean-news-grid">
      {sampleNews.map((article) => (
        <Link key={article.id} href={`/news/${article.id}`} className="clean-news-card">
          {/* صورة الخبر */}
          <img
            src={article.image}
            alt={article.title}
            className="clean-news-image"
            loading="lazy"
          />
          
          {/* محتوى الخبر */}
          <div className="clean-news-content">
            <div className="clean-news-category">{article.category}</div>
            <h3 className="clean-news-title">{article.title}</h3>
            
            <div className="clean-news-meta">
              <span className="clean-news-date">
                <svg className="clean-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {article.date}
              </span>
              <span className="clean-news-views">
                <svg className="clean-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.views}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
