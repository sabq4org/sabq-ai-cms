// Web Vitals RUM (يجمع المقاييس من المستخدمين الحقيقيين)
// ملاحظة: هذا السكربت آمن؛ لا يغيّر الواجهة أو التصميم
// تضمينه مرة واحدة كـ <script src="/rum-web-vitals.js" defer></script>

(function () {
  function load(url, cb) {
    var s = document.createElement('script');
    s.src = url; s.async = true; s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }

  function send(metric) {
    try {
      if (window && window.console && console.debug) {
        console.debug('[WebVitals]', metric.name, metric.value, metric.id);
      }
    } catch (_) {}
  }

  if (typeof window !== 'undefined') {
    load('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js', function () {
      if (!window.webVitals) return;
      var wv = window.webVitals;
      wv.onCLS && wv.onCLS(send);
      wv.onFID && wv.onFID(send);
      wv.onLCP && wv.onLCP(send);
      wv.onINP && wv.onINP(send);
      wv.onTTFB && wv.onTTFB(send);
    });
  }
})();


