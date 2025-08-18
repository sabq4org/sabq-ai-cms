/**
 * Clean Sidebar Component
 * الشريط الجانبي النظيف
 */

import React from "react";
import Link from "next/link";

export default function CleanSidebar() {
  return (
    <>
      {/* الأكثر قراءة */}
      <div className="clean-sidebar-section">
        <h3 className="clean-sidebar-title">الأكثر قراءة</h3>
        <ul className="clean-sidebar-list">
          <li className="clean-sidebar-item">
            <Link href="/news/1" className="clean-sidebar-link">
              <span>تغييرات ملكية تطال كبار المسؤولين</span>
              <span className="clean-sidebar-count">2.5k</span>
            </Link>
          </li>
          <li className="clean-sidebar-item">
            <Link href="/news/2" className="clean-sidebar-link">
              <span>ارتفاع مشاركة المرأة السعودية بالقوى العاملة</span>
              <span className="clean-sidebar-count">1.8k</span>
            </Link>
          </li>
          <li className="clean-sidebar-item">
            <Link href="/news/3" className="clean-sidebar-link">
              <span>مزاد الصقور الدولي يستقطب العائلات الأجنبية</span>
              <span className="clean-sidebar-count">1.2k</span>
            </Link>
          </li>
          <li className="clean-sidebar-item">
            <Link href="/news/4" className="clean-sidebar-link">
              <span>انطلاق منصة عروض صيف السعودية</span>
              <span className="clean-sidebar-count">987</span>
            </Link>
          </li>
          <li className="clean-sidebar-item">
            <Link href="/news/5" className="clean-sidebar-link">
              <span>جدة: وجهة سياحية عائلية تجمع بين التراث والحداثة</span>
              <span className="clean-sidebar-count">756</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* الأقسام */}
      <div className="clean-sidebar-section">
        <h3 className="clean-sidebar-title">الأقسام</h3>
        <ul className="clean-sidebar-list">
          <li className="clean-sidebar-item">
            <Link href="/clean-ui/local" className="clean-sidebar-link">
              <span>محليات</span>
              <span className="clean-sidebar-count">156</span>
            </Link>
          </li>
          <li className="clean-sidebar-item">
            <Link href="/clean-ui/international" className="clean-sidebar-link">
              <span>دولي</span>
              <span className="clean-sidebar-count">89</span>
            </Link>
          </li>
          <li className="clean-sidebar-item">
            <Link href="/clean-ui/sports" className="clean-sidebar-link">
              <span>رياضة</span>
              <span className="clean-sidebar-count">234</span>
            </Link>
          </li>
          <li className="clean-sidebar-item">
            <Link href="/clean-ui/economy" className="clean-sidebar-link">
              <span>اقتصاد</span>
              <span className="clean-sidebar-count">127</span>
            </Link>
          </li>
          <li className="clean-sidebar-item">
            <Link href="/clean-ui/tech" className="clean-sidebar-link">
              <span>تقنية</span>
              <span className="clean-sidebar-count">95</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* العلامات الشائعة */}
      <div className="clean-sidebar-section">
        <h3 className="clean-sidebar-title">العلامات الشائعة</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Link href="/tag/vision-2030" className="clean-tag">رؤية 2030</Link>
          <Link href="/tag/neom" className="clean-tag">نيوم</Link>
          <Link href="/tag/tourism" className="clean-tag">السياحة</Link>
          <Link href="/tag/economy" className="clean-tag">الاقتصاد</Link>
          <Link href="/tag/sports" className="clean-tag">الرياضة</Link>
          <Link href="/tag/education" className="clean-tag">التعليم</Link>
          <Link href="/tag/health" className="clean-tag">الصحة</Link>
          <Link href="/tag/tech" className="clean-tag">التقنية</Link>
        </div>
      </div>
    </>
  );
}
