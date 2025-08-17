/**
 * ملف الإعدادات الرئيسي لصحيفة سبق الإلكترونية
 * يحتوي على جميع خصائص الموقع وأقسامه ووظائفه
 */

// ===================================
// 1. معلومات الموقع الأساسية
// ===================================
export const SITE_INFO = {
  name: 'صحيفة سبق الإلكترونية',
  shortName: 'سبق',
  domain: 'sabq.org',
  url: 'https://www.sabq.org',
  description: 'صحيفة سبق الإلكترونية - أول صحيفة سعودية تأسست على الإنترنت',
  slogan: 'سبق الذكية - مدعومة بالذكاء الاصطناعي',
  establishedYear: 2007,
  language: 'ar',
  country: 'SA',
  timezone: 'Asia/Riyadh',
  dateFormat: 'DD MMMM YYYY - h:mm A',
};

// ===================================
// 2. أقسام الموقع الرئيسية
// ===================================
export const SITE_SECTIONS = [
  {
    id: 'home',
    name: 'الرئيسية',
    url: '/',
    icon: '🏠',
    order: 1
  },
  {
    id: 'news',
    name: 'الأخبار',
    url: '/news',
    icon: '📰',
    order: 2,
    subcategories: [
      { id: 'local', name: 'محلي', slug: 'local' },
      { id: 'international', name: 'دولي', slug: 'international' },
      { id: 'economy', name: 'اقتصاد', slug: 'economy' },
      { id: 'sports', name: 'رياضة', slug: 'sports' },
      { id: 'tech', name: 'تقنية', slug: 'tech' },
      { id: 'culture', name: 'ثقافة', slug: 'culture' },
      { id: 'health', name: 'صحة', slug: 'health' },
      { id: 'travel', name: 'سياحة', slug: 'travel' }
    ]
  },
  {
    id: 'moment-by-moment',
    name: 'لحظة بلحظة',
    url: '/moment-by-moment',
    icon: '⏱️',
    order: 3,
    highlight: true
  },
  {
    id: 'opinion',
    name: 'الرأي',
    url: '/opinion',
    icon: '✏️',
    order: 4,
    types: ['articles', 'columns', 'analysis']
  },
  {
    id: 'multimedia',
    name: 'الوسائط',
    url: '/multimedia',
    icon: '🎥',
    order: 5,
    types: ['videos', 'images', 'infographics', 'podcasts']
  },
  {
    id: 'magazine',
    name: 'المجلة',
    url: '/magazine',
    icon: '📖',
    order: 6
  }
];

// ===================================
// 3. الميزات والوظائف الرئيسية
// ===================================
export const SITE_FEATURES = {
  // ميزات الذكاء الاصطناعي
  ai: {
    enabled: true,
    features: {
      autoSummarization: true,      // تلخيص تلقائي للمقالات
      keywordExtraction: true,      // استخراج الكلمات المفتاحية
      contentSuggestions: true,     // اقتراحات المحتوى
      trendAnalysis: true,          // تحليل الترندات
      sentimentAnalysis: true,      // تحليل المشاعر
      autoTranslation: false,       // الترجمة التلقائية
      voiceReading: true,           // قراءة صوتية للمقالات
      smartSearch: true,            // البحث الذكي
      personalizedFeed: true        // تخصيص المحتوى
    }
  },

  // ميزات التفاعل
  interaction: {
    comments: true,               // التعليقات
    likes: true,                  // الإعجابات
    shares: true,                 // المشاركة
    bookmarks: true,              // الحفظ
    reactions: true,              // ردود الفعل
    polls: true,                  // الاستطلاعات
    ratings: true                 // التقييمات
  },

  // ميزات المحتوى
  content: {
    breakingNews: true,           // الأخبار العاجلة
    liveBlogs: true,              // التغطية المباشرة
    exclusiveContent: true,       // المحتوى الحصري
    premiumContent: false,        // المحتوى المدفوع
    userGeneratedContent: true,   // محتوى المستخدمين
    guestWriting: true,           // الكتابة الضيفة
    factChecking: true,           // التحقق من الحقائق
    relatedArticles: true         // المقالات ذات الصلة
  },

  // ميزات تقنية
  technical: {
    pwa: true,                    // Progressive Web App
    amp: false,                   // Accelerated Mobile Pages
    darkMode: true,               // الوضع الليلي
    offlineReading: true,         // القراءة دون اتصال
    pushNotifications: true,      // الإشعارات الفورية
    rss: true,                    // RSS Feeds
    api: true,                    // API للمطورين
    multiLanguage: false          // دعم لغات متعددة
  }
};

// ===================================
// 4. وسائل التواصل الاجتماعي
// ===================================
export const SOCIAL_MEDIA = {
  twitter: {
    url: 'https://twitter.com/sabqorg',
    handle: '@sabqorg',
    active: true
  },
  facebook: {
    url: 'https://facebook.com/sabqorg',
    active: true
  },
  instagram: {
    url: 'https://instagram.com/sabqorg',
    handle: '@sabqorg',
    active: true
  },
  youtube: {
    url: 'https://youtube.com/sabqorg',
    active: true
  },
  telegram: {
    url: 'https://t.me/sabqorg',
    active: true
  },
  whatsapp: {
    number: '966500000000',
    active: true
  },
  snapchat: {
    handle: 'sabqorg',
    active: true
  },
  tiktok: {
    handle: '@sabqorg',
    active: false
  }
};

// ===================================
// 5. التطبيقات
// ===================================
export const MOBILE_APPS = {
  ios: {
    url: 'https://apps.apple.com/sa/app/sabq/id123456789',
    version: '3.2.1',
    minVersion: '12.0',
    size: '45 MB',
    rating: 4.5
  },
  android: {
    url: 'https://play.google.com/store/apps/details?id=org.sabq.app',
    version: '3.2.1',
    minVersion: '5.0',
    size: '38 MB',
    rating: 4.3
  },
  huawei: {
    url: 'https://appgallery.huawei.com/app/sabq',
    version: '3.2.1',
    active: true
  }
};

// ===================================
// 6. معلومات الاتصال
// ===================================
export const CONTACT_INFO = {
  email: {
    general: 'info@sabq.org',
    newsroom: 'news@sabq.org',
    ads: 'ads@sabq.org',
    support: 'support@sabq.org',
    careers: 'careers@sabq.org'
  },
  phone: {
    main: '+966112345678',
    newsroom: '+966112345679',
    whatsapp: '+966500000000'
  },
  address: {
    street: 'طريق الملك فهد',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    postalCode: '11543',
    coordinates: {
      lat: 24.7136,
      lng: 46.6753
    }
  }
};

// ===================================
// 7. إعدادات SEO والميتا
// ===================================
export const SEO_CONFIG = {
  defaultTitle: 'صحيفة سبق الإلكترونية - آخر الأخبار السعودية والعالمية',
  titleTemplate: '%s | سبق',
  defaultDescription: 'تابع آخر الأخبار السعودية والعربية والعالمية مع صحيفة سبق الإلكترونية',
  defaultKeywords: [
    'سبق',
    'أخبار',
    'السعودية',
    'عاجل',
    'اقتصاد',
    'رياضة',
    'تقنية',
    'صحافة',
    'إعلام'
  ],
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://www.sabq.org',
    siteName: 'صحيفة سبق',
    images: [
      {
        url: 'https://www.sabq.org/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'صحيفة سبق الإلكترونية'
      }
    ]
  },
  twitter: {
    handle: '@sabqorg',
    site: '@sabqorg',
    cardType: 'summary_large_image'
  }
};

// ===================================
// 8. إعدادات الأداء والتحليلات
// ===================================
export const ANALYTICS_CONFIG = {
  googleAnalytics: {
    id: 'G-XXXXXXXXXX',
    enabled: true
  },
  googleTagManager: {
    id: 'GTM-XXXXXXX',
    enabled: true
  },
  facebookPixel: {
    id: 'XXXXXXXXXXXXXXXXX',
    enabled: true
  },
  snapchatPixel: {
    id: 'XXXXX-XXXXX-XXXXX',
    enabled: true
  },
  twitterPixel: {
    id: 'XXXXX',
    enabled: false
  }
};

// ===================================
// 9. إعدادات المحتوى
// ===================================
export const CONTENT_CONFIG = {
  articlesPerPage: 20,
  excerptLength: 150,
  readingTimeWPM: 200, // كلمة في الدقيقة
  imageQualities: {
    thumbnail: { width: 300, height: 200, quality: 80 },
    medium: { width: 800, height: 450, quality: 85 },
    large: { width: 1200, height: 675, quality: 90 },
    original: { quality: 95 }
  },
  videoProviders: ['youtube', 'vimeo', 'dailymotion', 'twitter'],
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'pdf'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  cacheTime: {
    homepage: 60, // ثانية
    articles: 300,
    categories: 600,
    static: 86400
  }
};

// ===================================
// 10. إعدادات الإعلانات
// ===================================
export const ADS_CONFIG = {
  enabled: true,
  providers: {
    googleAdsense: {
      enabled: true,
      publisherId: 'ca-pub-XXXXXXXXXXXXXXXX'
    },
    taboola: {
      enabled: true,
      publisherId: 'sabqorg-main'
    },
    outbrain: {
      enabled: false,
      widgetId: 'AR_1'
    }
  },
  positions: {
    header: { enabled: true, size: '728x90' },
    sidebar: { enabled: true, size: '300x250' },
    inArticle: { enabled: true, frequency: 3 }, // كل 3 فقرات
    footer: { enabled: true, size: '970x90' },
    mobile: { enabled: true, size: '320x50' }
  }
};

// ===================================
// 11. فريق العمل والأدوار
// ===================================
export const TEAM_ROLES = {
  'editor-in-chief': { 
    name: 'رئيس التحرير',
    permissions: ['all']
  },
  'deputy-editor': {
    name: 'نائب رئيس التحرير',
    permissions: ['publish', 'edit', 'delete', 'moderate']
  },
  'section-head': {
    name: 'رئيس قسم',
    permissions: ['publish', 'edit', 'moderate']
  },
  'editor': {
    name: 'محرر',
    permissions: ['write', 'edit', 'publish']
  },
  'reporter': {
    name: 'مراسل',
    permissions: ['write', 'edit']
  },
  'contributor': {
    name: 'كاتب',
    permissions: ['write']
  },
  'moderator': {
    name: 'مشرف',
    permissions: ['moderate', 'delete_comments']
  }
};

// ===================================
// 12. إعدادات الأمان
// ===================================
export const SECURITY_CONFIG = {
  sessionTimeout: 30 * 60 * 1000, // 30 دقيقة
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireStrongPassword: true,
  twoFactorAuth: true,
  ipWhitelist: [],
  ipBlacklist: [],
  contentModeration: true,
  spamProtection: true,
  captcha: {
    enabled: true,
    provider: 'recaptcha',
    siteKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  }
};

// ===================================
// 13. خدمات خارجية
// ===================================
export const EXTERNAL_SERVICES = {
  cdn: {
    provider: 'cloudflare',
    url: 'https://cdn.sabq.org'
  },
  imageStorage: {
    provider: 'cloudinary',
    cloudName: 'sabqorg',
    apiKey: process.env.CLOUDINARY_API_KEY
  },
  email: {
    provider: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: 'noreply@sabq.org'
  },
  sms: {
    provider: 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  },
  payment: {
    provider: 'stripe',
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY
  }
};

// ===================================
// 14. إعدادات واجهة برمجة التطبيقات (API)
// ===================================
export const API_CONFIG = {
  version: 'v1',
  baseUrl: 'https://api.sabq.org',
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 100
  },
  authentication: {
    type: 'jwt',
    expiresIn: '7d'
  },
  endpoints: {
    articles: '/articles',
    categories: '/categories',
    authors: '/authors',
    comments: '/comments',
    search: '/search',
    trending: '/trending',
    stats: '/stats'
  }
};

// ===================================
// 15. جدول المهام والوظائف المجدولة
// ===================================
export const CRON_JOBS = {
  sitemap: {
    schedule: '0 2 * * *', // يومياً في الساعة 2 صباحاً
    enabled: true
  },
  backup: {
    schedule: '0 3 * * *', // يومياً في الساعة 3 صباحاً
    enabled: true
  },
  cleanup: {
    schedule: '0 4 * * 0', // أسبوعياً يوم الأحد الساعة 4 صباحاً
    enabled: true
  },
  analytics: {
    schedule: '0 */6 * * *', // كل 6 ساعات
    enabled: true
  },
  newsletter: {
    schedule: '0 8 * * *', // يومياً في الساعة 8 صباحاً
    enabled: true
  }
};

// دالة مساعدة للحصول على الإعدادات الكاملة
export function getSiteConfig() {
  return {
    info: SITE_INFO,
    sections: SITE_SECTIONS,
    features: SITE_FEATURES,
    social: SOCIAL_MEDIA,
    apps: MOBILE_APPS,
    contact: CONTACT_INFO,
    seo: SEO_CONFIG,
    analytics: ANALYTICS_CONFIG,
    content: CONTENT_CONFIG,
    ads: ADS_CONFIG,
    roles: TEAM_ROLES,
    security: SECURITY_CONFIG,
    services: EXTERNAL_SERVICES,
    api: API_CONFIG,
    cron: CRON_JOBS
  };
}

// تصدير الإعدادات الافتراضية
export default getSiteConfig();
