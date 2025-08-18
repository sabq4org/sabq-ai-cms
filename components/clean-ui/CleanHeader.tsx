/**
 * Clean Header Component
 * هيدر نظيف وبسيط
 */

import React from "react";
import Link from "next/link";

export default function CleanHeader() {
  return (
    <header className="clean-header">
      <div className="clean-header-content">
        {/* الشعار */}
        <Link href="/clean-ui" className="clean-logo">
          صحيفة سبق
        </Link>
        
        {/* القائمة الرئيسية */}
        <nav className="clean-nav">
          <Link href="/clean-ui" className="clean-nav-link">الرئيسية</Link>
          <Link href="/clean-ui/local" className="clean-nav-link">محليات</Link>
          <Link href="/clean-ui/international" className="clean-nav-link">دولي</Link>
          <Link href="/clean-ui/sports" className="clean-nav-link">رياضة</Link>
          <Link href="/clean-ui/economy" className="clean-nav-link">اقتصاد</Link>
          <Link href="/clean-ui/tech" className="clean-nav-link">تقنية</Link>
        </nav>
        
        {/* أزرار البحث والدخول */}
        <div className="clean-nav">
          <button className="clean-nav-link" aria-label="بحث">
            <svg className="clean-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <Link href="/login" className="clean-nav-link">تسجيل الدخول</Link>
        </div>
      </div>
    </header>
  );
}
