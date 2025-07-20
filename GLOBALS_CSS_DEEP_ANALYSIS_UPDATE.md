/* تحديث ملف globals.css لدعم Safari لقسم التحليل العميق */

/* إضافة CSS في نهاية الملف */

/* تحسينات التحليل العميق لـ Safari */
.deep-analysis-title {
  color: var(--text-primary) !important;
  font-weight: 700 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.dark .deep-analysis-title {
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.deep-analysis-summary {
  color: var(--text-secondary) !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.dark .deep-analysis-summary {
  color: #e2e8f0 !important;
}

.analysis-category-tag {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.analysis-category-tag.purple {
  background-color: #faf5ff !important;
  color: #553c9a !important;
  border: 1px solid #d6bcfa !important;
}

.dark .analysis-category-tag.purple {
  background-color: #44337a !important;
  color: #e9d5ff !important;
  border: 1px solid #7c3aed !important;
}

/* تحسين النصوص العربية */
.arabic-text {
  font-family: 'Noto Sans Arabic', 'Apple Color Emoji', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  direction: rtl;
  text-align: right;
}

/* إصلاح خاص لـ Safari */
@supports (-webkit-touch-callout: none) {
  .deep-analysis-title {
    color: #000000 !important;
  }
  
  .dark .deep-analysis-title {
    color: #ffffff !important;
  }
  
  .deep-analysis-summary {
    color: #666666 !important;
  }
  
  .dark .deep-analysis-summary {
    color: #cccccc !important;
  }
}

/* تحسين الأداء */
.deep-analysis-card {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}
