// سكربت لمراقبة أخطاء 404
const http = require('http');

console.log('🔍 مراقبة أخطاء 404 على المنفذ 3001...\n');

// إنشاء proxy server بسيط
const server = http.createServer((req, res) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  
  // تمرير الطلب إلى Next.js
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxy = http.request(options, (proxyRes) => {
    if (proxyRes.statusCode === 404) {
      console.log(`❌ 404: ${req.url}`);
    }
    
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  req.pipe(proxy);
});

server.listen(3003, () => {
  console.log('Proxy server running on http://localhost:3003');
  console.log('افتح المتصفح على http://localhost:3003 بدلاً من 3001\n');
});
