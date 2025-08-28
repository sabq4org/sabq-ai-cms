// Web Vitals محلي - بدون اعتماد خارجي
(function () {
  if (typeof window === 'undefined') return;

  function send(metric) {
    try {
      if (window.console && window.console.debug) {
        console.debug('[WebVitals]', metric.name, metric.value, metric.id);
      }
      // TODO: إرسال البيانات لنظام التحليلات
    } catch (_) {}
  }

  // تحميل web-vitals من الحزمة المحلية عبر import() الديناميكي
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    try {
      import('web-vitals').then(function(webVitals) {
        if (!webVitals) return;
        webVitals.onCLS && webVitals.onCLS(send);
        webVitals.onFID && webVitals.onFID(send);
        webVitals.onLCP && webVitals.onLCP(send);
        webVitals.onINP && webVitals.onINP(send);
        webVitals.onTTFB && webVitals.onTTFB(send);
      }).catch(function() {
        // صامت إذا فشل التحميل
      });
    } catch (e) {
      // صامت في المتصفحات القديمة
    }
  }
})();
