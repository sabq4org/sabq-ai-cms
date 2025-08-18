/**
 * Clean Footer Component
 * الفوتر النظيف
 */

import React from "react";
import Link from "next/link";

export default function CleanFooter() {
  return (
    <footer className="clean-footer">
      <div className="clean-footer-content">
        <div className="clean-footer-grid">
          {/* عن سبق */}
          <div className="clean-footer-section">
            <h3>عن صحيفة سبق</h3>
            <p style={{ color: 'var(--clean-text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
              صحيفة إلكترونية سعودية شاملة، نعمل على مدار الساعة لننقل لكم الحقيقة كما هي، 
              ونغطي كافة الأحداث المحلية والعالمية بمصداقية واحترافية.
            </p>
          </div>
          
          {/* الأقسام */}
          <div className="clean-footer-section">
            <h3>الأقسام</h3>
            <ul className="clean-footer-links">
              <li><Link href="/clean-ui/local">محليات</Link></li>
              <li><Link href="/clean-ui/international">دولي</Link></li>
              <li><Link href="/clean-ui/sports">رياضة</Link></li>
              <li><Link href="/clean-ui/economy">اقتصاد</Link></li>
              <li><Link href="/clean-ui/tech">تقنية</Link></li>
            </ul>
          </div>
          
          {/* خدماتنا */}
          <div className="clean-footer-section">
            <h3>خدماتنا</h3>
            <ul className="clean-footer-links">
              <li><Link href="/clean-ui/newsletters">النشرة البريدية</Link></li>
              <li><Link href="/clean-ui/archive">الأرشيف</Link></li>
              <li><Link href="/clean-ui/rss">RSS</Link></li>
              <li><Link href="/clean-ui/apps">تطبيقات الجوال</Link></li>
              <li><Link href="/clean-ui/advertise">إعلن معنا</Link></li>
            </ul>
          </div>
          
          {/* معلومات قانونية */}
          <div className="clean-footer-section">
            <h3>معلومات قانونية</h3>
            <ul className="clean-footer-links">
              <li><Link href="/clean-ui/privacy">سياسة الخصوصية</Link></li>
              <li><Link href="/clean-ui/terms">شروط الاستخدام</Link></li>
              <li><Link href="/clean-ui/about">من نحن</Link></li>
              <li><Link href="/clean-ui/contact">اتصل بنا</Link></li>
              <li><Link href="/clean-ui/careers">الوظائف</Link></li>
            </ul>
          </div>
        </div>
        
        {/* حقوق النشر */}
        <div className="clean-footer-bottom">
          <p>© 2025 صحيفة سبق. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
