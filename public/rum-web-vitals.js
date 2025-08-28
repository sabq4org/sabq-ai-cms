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

  if (typeof window !== 'undefined') {
    try {
      var wv = require('web-vitals');
      wv.onCLS && wv.onCLS(send);
      wv.onFID && wv.onFID(send);
      wv.onLCP && wv.onLCP(send);
      wv.onINP && wv.onINP(send);
      wv.onTTFB && wv.onTTFB(send);
    } catch (e) {
      // صامت إذا لم تتوفر الحزمة
    }
  }
})();


