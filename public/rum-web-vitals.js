// Web Vitals RUM (يجمع المقاييس من المستخدمين الحقيقيين)
// ملاحظة: هذا السكربت آمن؛ لا يغيّر الواجهة أو التصميم
// تضمينه مرة واحدة كـ <script src="/rum-web-vitals.js" defer></script>

(function () {
  function send(metric) {
    try {
      if (window && window.console && console.debug) {
        console.debug('[WebVitals]', metric.name, metric.value, metric.id);
      }
    } catch (_) {}
  }

  // استخدام web-vitals كـ ES module محلياً إذا توفر ضمن الباندل، وإلا تعطيل صامت
  if (typeof window !== 'undefined' && window.webVitals) {
    var wv = window.webVitals;
    wv.onCLS && wv.onCLS(send);
    wv.onFID && wv.onFID(send);
    wv.onLCP && wv.onLCP(send);
    wv.onINP && wv.onINP(send);
    wv.onTTFB && wv.onTTFB(send);
  }
})();


