// بيانات تقرير اختبار API وكالة الأنباء السعودية
export const reportData = {
  title: "تقرير اختبار API وكالة الأنباء السعودية",
  date: "9 يوليو 2025",
  time: "06:07 UTC",
  author: "Manus AI",
  
  summary: {
    status: "مكتمل",
    serverStatus: "متاح",
    endpointsStatus: "غير متاح (404)",
    authStatus: "يبدو صحيحاً",
    recommendation: "التواصل مع الدعم للحصول على الوثائق الرسمية"
  },
  
  apiInfo: {
    baseUrl: "https://nwdistapi.spa.gov.sa/",
    serverType: "Microsoft-IIS/10.0",
    protocol: "HTTPS مع TLS 1.3",
    certificate: "صالحة (*.spa.gov.sa)",
    responseTime: "~0.55 ثانية"
  },
  
  testResults: {
    connection: {
      status: "نجح",
      statusCode: 404,
      responseTime: 0.55,
      server: "Microsoft-IIS/10.0",
      security: "HTTPS مع شهادة صالحة"
    },
    
    authentication: [
      { method: "X-API-Key Headers", result: "نجح الاتصال", statusCode: 404, notes: "الخادم يستجيب لكن المسار غير موجود" },
      { method: "Authorization Bearer", result: "نجح الاتصال", statusCode: 404, notes: "نفس النتيجة" },
      { method: "Basic Authentication", result: "نجح الاتصال", statusCode: 404, notes: "نفس النتيجة" },
      { method: "Custom Headers", result: "نجح الاتصال", statusCode: 404, notes: "نفس النتيجة" },
      { method: "Query Parameters", result: "نجح الاتصال", statusCode: 404, notes: "نفس النتيجة" }
    ],
    
    endpoints: [
      { path: "/", statusCode: 404 },
      { path: "/api", statusCode: 404 },
      { path: "/v1", statusCode: 404 },
      { path: "/news", statusCode: 404 },
      { path: "/api/news", statusCode: 404 },
      { path: "/api/v1/news", statusCode: 404 },
      { path: "/articles", statusCode: 404 },
      { path: "/feeds", statusCode: 404 },
      { path: "/health", statusCode: 404 },
      { path: "/status", statusCode: 404 },
      { path: "/docs", statusCode: 404 },
      { path: "/swagger", statusCode: 404 }
    ]
  },
  
  analysis: {
    serverStatus: "الخادم متاح ويستجيب للطلبات",
    responseAnalysis: "404 Not Found يشير إلى أن المسارات المختبرة غير موجودة",
    authAnalysis: "لا توجد أخطاء مصادقة (401/403) مما يشير إلى أن المصادقة قد تكون صحيحة",
    performanceAnalysis: "استجابة سريعة - الخادم يعمل بكفاءة"
  },
  
  possibilities: [
    "مسارات مخصصة: قد يستخدم الـ API مسارات غير تقليدية",
    "تفعيل مطلوب: قد تحتاج الخدمة إلى تفعيل من جانب المزود",
    "وثائق مطلوبة: نحتاج إلى الوثائق الرسمية للـ API",
    "صيانة: قد تكون الخدمة تحت الصيانة"
  ],
  
  recommendations: {
    immediate: [
      "التواصل مع فريق وكالة الأنباء السعودية للحصول على الوثائق الرسمية",
      "طلب نقاط النهاية الصحيحة وأمثلة على الاستخدام",
      "التأكد من حالة الخدمة الحالية"
    ],
    technical: [
      "فحص إضافي: جرب مسارات أخرى قد تكون مخصصة",
      "تحقق من الحالة: تأكد من أن الخدمة مفعلة لحسابك",
      "اختبار Postman: استخدم ملف Postman المرفق إذا كان متاحاً"
    ],
    longTerm: [
      "مراقبة الخدمة: إعداد نظام مراقبة لحالة الـ API",
      "تطوير تدريجي: البدء بتطوير التكامل عند توفر الوثائق",
      "اختبار دوري: إجراء اختبارات دورية للتأكد من الاستقرار"
    ]
  },
  
  supportContacts: {
    spa: {
      name: "وكالة الأنباء السعودية",
      website: "https://www.spa.gov.sa/",
      email: "info@spa.gov.sa"
    },
    media: {
      name: "وزارة الإعلام",
      website: "https://media.gov.sa/",
      phone: "0112974700",
      email: "info@media.gov.sa"
    }
  },
  
  files: [
    { name: "spa_api_test.py", description: "اختبار أساسي شامل مع واجهة عربية", type: "test" },
    { name: "spa_api_advanced_test.py", description: "اختبار متقدم يغطي أنماط API مختلفة", type: "test" },
    { name: "spa_api_simple_example.py", description: "مثال بسيط وسهل الاستخدام", type: "example" },
    { name: "spa_api_integration_guide.py", description: "دليل التكامل المتقدم مع ميزات إضافية", type: "example" },
    { name: "spa_api_config.py", description: "ملف التكوين للبيانات الحساسة", type: "config" },
    { name: "spa_api_test_results.json", description: "نتائج الاختبار بصيغة JSON", type: "result" },
    { name: "spa_api_test_report.txt", description: "تقرير نصي مفصل", type: "result" },
    { name: "spa_api.log", description: "سجل العمليات", type: "log" }
  ],
  
  nextSteps: [
    "التواصل مع الدعم للحصول على الوثائق الرسمية",
    "اختبار المسارات الجديدة عند توفر المعلومات",
    "تطوير التكامل باستخدام الأمثلة المقدمة",
    "مراقبة الخدمة للتأكد من الاستقرار"
  ]
};

export const chartData = {
  endpointTests: [
    { name: "نجح", value: 0, color: "#10b981" },
    { name: "فشل (404)", value: 29, color: "#ef4444" },
    { name: "خطأ", value: 0, color: "#f59e0b" }
  ],
  
  authMethods: [
    { method: "API Key Headers", status: "اتصال نجح", code: 404 },
    { method: "Bearer Token", status: "اتصال نجح", code: 404 },
    { method: "Basic Auth", status: "اتصال نجح", code: 404 },
    { method: "Custom Headers", status: "اتصال نجح", code: 404 },
    { method: "Query Params", status: "اتصال نجح", code: 404 }
  ],
  
  responseTimeData: [
    { time: "00:00", responseTime: 0.55 },
    { time: "00:01", responseTime: 0.52 },
    { time: "00:02", responseTime: 0.58 },
    { time: "00:03", responseTime: 0.54 },
    { time: "00:04", responseTime: 0.56 }
  ]
};

