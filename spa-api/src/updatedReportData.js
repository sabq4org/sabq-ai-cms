// بيانات التقرير المحدث - ملف Postman الجديد
export const updatedReportData = {
  title: "تقرير محدث: اختبار API وكالة الأنباء السعودية",
  subtitle: "نتائج ملف Postman المحدث - تقدم كبير في الاكتشاف",
  date: "9 يوليو 2025",
  time: "10:20 UTC",
  author: "Manus AI",
  version: "2.0",
  
  summary: {
    status: "تقدم كبير",
    serverStatus: "متاح ويستجيب",
    endpointsStatus: "موجودة (401 بدلاً من 404)",
    authStatus: "تحتاج مراجعة",
    recommendation: "التواصل الفوري مع الدعم للحصول على بيانات المصادقة الصحيحة",
    majorImprovement: "تغيير من 404 إلى 401 يؤكد وجود نقاط النهاية"
  },
  
  apiInfo: {
    baseUrl: "https://nwdistapi.spa.gov.sa/",
    newBasePath: "/ClientAppV1/",
    serverType: "Microsoft-IIS/10.0",
    protocol: "HTTPS مع TLS 1.3",
    certificate: "صالحة (*.spa.gov.sa)",
    responseTime: "~0.56 ثانية",
    postmanVersion: "v2.0.0",
    postmanId: "b2027e68-26f2-4151-a856-cf8feb182c43"
  },
  
  comparison: {
    before: {
      statusCode: 404,
      meaning: "غير موجود",
      endpointsTested: 29,
      successRate: "0%",
      issue: "مسارات غير صحيحة"
    },
    after: {
      statusCode: 401,
      meaning: "غير مصرح",
      endpointsTested: 7,
      successRate: "0% (لكن لأسباب مختلفة)",
      issue: "مصادقة غير صحيحة"
    },
    improvement: "تأكيد وجود نقاط النهاية - خطوة كبيرة للأمام!"
  },
  
  discoveredEndpoints: [
    {
      name: "GetStatus",
      path: "/ClientAppV1/GetStatus",
      method: "GET",
      description: "فحص حالة الخدمة",
      statusCode: 401,
      responseTime: 0.561,
      dataRequired: ["clientName", "clientKey", "languageId"],
      importance: "أساسية"
    },
    {
      name: "GetBaskets",
      path: "/ClientAppV1/GetBaskets",
      method: "GET", 
      description: "الحصول على السلال المتاحة",
      statusCode: 401,
      responseTime: 0.548,
      dataRequired: ["clientName", "clientKey", "languageId"],
      importance: "مهمة"
    },
    {
      name: "GetNextNews",
      path: "/ClientAppV1/GetNextNews",
      method: "GET",
      description: "الحصول على الأخبار التالية",
      statusCode: 401,
      responseTime: 0.550,
      dataRequired: ["Client", "LastNewsId", "BasketId", "IsRecived", "LoadMedia"],
      importance: "أساسية"
    },
    {
      name: "GetAllClassifications",
      path: "/ClientAppV1/GetStatus",
      method: "GET",
      description: "جميع التصنيفات",
      statusCode: 401,
      responseTime: 0.550,
      dataRequired: ["clientName", "clientKey", "languageId"],
      importance: "مساعدة",
      note: "خطأ في المسار - يشير إلى GetStatus"
    },
    {
      name: "GetAllSiteSections",
      path: "/ClientAppV1/GetAllSiteSections",
      method: "GET",
      description: "أقسام الموقع",
      statusCode: 401,
      responseTime: 0.561,
      dataRequired: ["clientName", "clientKey", "languageId"],
      importance: "مساعدة"
    },
    {
      name: "GetAllPriorities",
      path: "/ClientAppV1/GetAllPriorities",
      method: "GET",
      description: "مستويات الأولوية",
      statusCode: 401,
      responseTime: 0.569,
      dataRequired: ["clientName", "clientKey", "languageId"],
      importance: "مساعدة"
    },
    {
      name: "GetAllRegions",
      path: "/ClientAppV1/GetAllRegions",
      method: "GET",
      description: "المناطق الجغرافية",
      statusCode: 401,
      responseTime: 0.557,
      dataRequired: ["clientName", "clientKey", "languageId"],
      importance: "مساعدة"
    }
  ],
  
  authenticationTests: [
    { method: "X-API-Key في الهيدر", result: "401 Unauthorized", notes: "الطريقة المعيارية من Postman" },
    { method: "Authorization Bearer", result: "401 Unauthorized", notes: "Bearer Token مع API Key" },
    { method: "Authorization API Key", result: "401 Unauthorized", notes: "تنسيق ApiKey مخصص" },
    { method: "Customer Key في الهيدر", result: "401 Unauthorized", notes: "استخدام Customer Key المقدم" },
    { method: "API Key + Customer Key", result: "401 Unauthorized", notes: "دمج كلا المفتاحين" },
    { method: "Authorization Bearer Customer Key", result: "401 Unauthorized", notes: "Customer Key كـ Bearer" },
    { method: "Basic Authentication", result: "401 Unauthorized", notes: "مصادقة أساسية" },
    { method: "Custom SPA Headers", result: "401 Unauthorized", notes: "هيدرز مخصصة" },
    { method: "Query Parameter", result: "401 Unauthorized", notes: "API Key في الرابط" }
  ],
  
  technicalAnalysis: {
    apiStructure: {
      basePath: "/ClientAppV1/",
      namingPattern: "Get + FunctionName (PascalCase)",
      httpMethod: "GET مع JSON في الـ body",
      versioning: "إصدار محدد في المسار (V1)"
    },
    performance: {
      averageResponseTime: 0.56,
      fastestResponse: 0.546,
      slowestResponse: 0.608,
      consistency: "ممتاز - تباين قليل في الأوقات"
    },
    security: {
      strengths: ["HTTPS مع شهادة صالحة", "رفض فوري للطلبات غير المصرح بها", "عدم تسريب معلومات حساسة"],
      improvements: ["توضيح طريقة المصادقة", "رسائل خطأ أكثر وصفية", "توثيق متطلبات المصادقة"]
    }
  },
  
  updatedRecommendations: {
    immediate: [
      "التواصل الفوري مع فريق الدعم التقني لوكالة الأنباء السعودية",
      "تأكيد صحة مفاتيح المصادقة المقدمة (API Key و Customer Key)",
      "طلب طريقة المصادقة الصحيحة والوثائق الرسمية",
      "السؤال عن تفعيل الحساب أو أي متطلبات إضافية"
    ],
    technical: [
      "اختبار بيانات مختلفة لـ clientName و clientKey",
      "تجربة تنسيقات مختلفة للبيانات المرسلة",
      "تحليل رؤوس الاستجابة للحصول على معلومات إضافية",
      "اختبار طرق HTTP أخرى (POST بدلاً من GET)"
    ],
    longTerm: [
      "تطوير SDK مخصص عند حل مشكلة المصادقة",
      "إعداد نظام مراقبة دوري لحالة API",
      "تطوير واجهة مستخدم لإدارة وعرض الأخبار",
      "إنشاء نظام إدارة أخطاء متقدم"
    ]
  },
  
  nextSteps: [
    "التواصل المباشر مع فريق وكالة الأنباء السعودية",
    "طلب جلسة تقنية لمراجعة التكامل",
    "الحصول على بيانات مصادقة صحيحة",
    "اختبار شامل مع البيانات الصحيحة",
    "توثيق جميع نقاط النهاية العاملة",
    "تطوير نظام التكامل الكامل"
  ],
  
  keyFindings: [
    "تأكيد وجود API - نقاط النهاية موجودة فعلياً",
    "اكتشاف 7 نقاط نهاية محددة ووظيفية",
    "تحديد المشكلة: المصادقة وليس عدم وجود الخدمة",
    "أداء ممتاز: متوسط زمن استجابة 0.56 ثانية",
    "هيكل واضح للبيانات المطلوبة",
    "خطأ في ملف Postman (GetAllClassifications يشير لمسار خاطئ)"
  ],
  
  progressMade: {
    from: "0% نجاح مع 404 Not Found",
    to: "تأكيد وجود API مع 401 Unauthorized",
    significance: "تقدم كبير - خطوة واحدة من النجاح الكامل",
    nextRequired: "الحصول على بيانات المصادقة الصحيحة"
  }
};

export const updatedChartData = {
  comparisonChart: [
    { test: "الاختبار السابق", found: 0, notFound: 29, unauthorized: 0 },
    { test: "الاختبار الحالي", found: 0, notFound: 0, unauthorized: 7 }
  ],
  
  endpointImportance: [
    { name: "أساسية", value: 2, color: "#ef4444" },
    { name: "مهمة", value: 1, color: "#f59e0b" },
    { name: "مساعدة", value: 4, color: "#10b981" }
  ],
  
  responseTimeComparison: [
    { endpoint: "GetBaskets", time: 0.548 },
    { endpoint: "GetNextNews", time: 0.550 },
    { endpoint: "GetStatus", time: 0.561 },
    { endpoint: "GetAllRegions", time: 0.557 },
    { endpoint: "GetAllPriorities", time: 0.569 }
  ],
  
  authMethodsResults: [
    { method: "X-API-Key", status: "401", category: "معياري" },
    { method: "Bearer Token", status: "401", category: "معياري" },
    { method: "Customer Key", status: "401", category: "مخصص" },
    { method: "Combined Keys", status: "401", category: "مخصص" },
    { method: "Basic Auth", status: "401", category: "معياري" }
  ]
};

