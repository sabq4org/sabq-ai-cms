/* سبك: Service Worker خفيف لتخزين الصور مؤقتاً فقط */
const CACHE_NAME = 'sabq-images-v1';

self.addEventListener('install', (event) => {
  // تفعيل فوري
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![CACHE_NAME].includes(k))
          .map((k) => caches.delete(k))
      );
      self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const dest = req.destination;
  // نخزّن الصور فقط لتفادي أي تعارض مع API/HTML/JS/CSS
  if (dest === 'image') {
    event.respondWith(cacheFirst(req));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    // نجرب تخزين نسخة إذا كانت الاستجابة صالحة
    if (res && res.status === 200) {
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    // في حال الفشل نُعيد استجابة فارغة بسيطة
    return new Response('', { status: 504 });
  }
}


