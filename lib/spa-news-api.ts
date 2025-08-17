
// طباعة متغيرات البيئة للتحقق
console.log("=== SPA API Environment Variables ===");
console.log("SPA_API_URL:", process.env.SPA_API_URL);
console.log("SPA_API_KEY:", process.env.SPA_API_KEY);
console.log("SPA_CUSTOMER_KEY:", process.env.SPA_CUSTOMER_KEY);
console.log("SPA_CLIENT_NAME:", process.env.SPA_CLIENT_NAME);
console.log("=====================================");

// استخدام البيانات الحقيقية من متغيرات البيئة
const API_URL = process.env.SPA_API_URL?.replace(/\/+$/, "") || "https://nwdistapi.spa.gov.sa";
const API_KEY = process.env.SPA_API_KEY || "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP";
const CUSTOMER_KEY = process.env.SPA_CUSTOMER_KEY || "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4=";
const CLIENT_NAME = process.env.SPA_CLIENT_NAME || "SABQ";


// Headers للطلبات - استخدام X-API-KEY كما هو مطلوب
const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-API-KEY": API_KEY,
  "Accept": "application/json",
  "User-Agent": "sabq-cms/1.0",
});

// Get Baskets - جلب السلال المتاحة
export async function getSpaBaskets() {
  const endpoint = `${API_URL}/ClientAppV1/GetBaskets`;
  
  console.log("=== getSpaBaskets API Call ===");
  console.log("API_URL:", API_URL);
  console.log("Full endpoint:", endpoint);
  console.log("=========================");

  // الـ payload الصحيح حسب الاختبارات الناجحة
  const payload = {
    ClientName: CLIENT_NAME,
    ClientKey: CUSTOMER_KEY,
    LanguageId: 1  // 1 للعربية
  };

  console.log("Payload:", payload);
  console.log("Headers:", getHeaders());
  
  try {
    // استخدام GET method مع body كما هو مطلوب
    const response = await fetch(endpoint, {
      method: 'POST',
      
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log("✅ API Call succeeded!");
    console.log("Response:", JSON.stringify(data, null, 2));
    return data;
    
  } catch (error: any) {
    console.error("❌ Error fetching SPA baskets:", error);
    console.error("Response status:", error?.response?.status);
    console.error("Response data:", error?.response?.data);
    console.error("Endpoint used:", endpoint);
    throw error;
  }
}

// Get Next News - جلب الأخبار التالية
export async function getSpaNextNews({
  basket_CD,
  last_news_CD = 0,
  IS_recived = false,
  IS_load_media = true,
}: {
  basket_CD: number;
  last_news_CD?: number;
  IS_recived?: boolean;
  IS_load_media?: boolean;
}) {
  const endpoint = `${API_URL}/ClientAppV1/GetNextNews`;
  
  console.log("=== getSpaNextNews API Call ===");
  console.log("API_URL:", API_URL);
  console.log("Full endpoint:", endpoint);
  console.log("=========================");
  
  // التنسيق الصحيح لـ GetNextNews - مع Client object
  const payload = {
    Client: {
      ClientName: CLIENT_NAME,
      ClientKey: CUSTOMER_KEY,
    },
    LanguageId: 1,
    LastNewsId: last_news_CD,
    BasketId: basket_CD,
    IsRecived: IS_recived,
    IsLoadMedia: IS_load_media,
  };
  
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Headers:", getHeaders());
  
  try {
    // دعم timeout عبر AbortController
    const controller = new AbortController();
    const timeoutMs = 15000; // 15 ثانية
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err && typeof err === 'object' && 'name' in err && (err as any).name === 'AbortError') {
        throw new Error('انتهت مهلة الاتصال بجلب الأخبار من وكالة الأنباء السعودية (SPA). يرجى المحاولة لاحقاً أو زيادة المهلة.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("✅ News API Call succeeded!");
    console.log("Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error: any) {
    console.error("❌ Error fetching SPA news:", error);
    console.error("Endpoint used:", endpoint);
    throw error;
  }
}

// Get Previous News - جلب الأخبار السابقة
export async function getSpaPreviousNews({
  basket_CD,
  last_news_CD,
  IS_recived = false,
  IS_load_media = true,
}: {
  basket_CD: number;
  last_news_CD: number;
  IS_recived?: boolean;
  IS_load_media?: boolean;
}) {
  const endpoint = `${API_URL}/ClientAppV1/GetPreviousNews`;
  
  console.log("=== getSpaPreviousNews API Call ===");
  console.log("API_URL:", API_URL);
  console.log("Full endpoint:", endpoint);
  console.log("=========================");
  
  // التنسيق الصحيح لـ GetPreviousNews - مثل GetBaskets (مسطح)
  const payload = {
    ClientName: CLIENT_NAME,
    ClientKey: CUSTOMER_KEY,
    LanguageId: 1,
    LastNewsId: last_news_CD,
    BasketId: basket_CD,
    IsRecived: IS_recived,
    IsLoadMedia: IS_load_media,
  };
  
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Headers:", getHeaders());
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log("✅ Previous News API Call succeeded!");
    console.log("Response:", JSON.stringify(data, null, 2));
    return data;
    
  } catch (error: any) {
    console.error("❌ Error fetching previous SPA news:", error);
    console.error("Response status:", error?.response?.status);
    console.error("Response data:", error?.response?.data);
    console.error("Endpoint used:", endpoint);
    throw error;
  }
}

// Helper function to format SPA news for display
export function formatSpaNews(news: any) {
  return {
    id: news.news_NUM,
    title: news.title_TXT,
    story: news.story_TXT,
    date: new Date(news.news_DT),
    priority: news.news_priority_CD,
    isBreaking: news.news_priority_CD === 1,
    isReport: news.iS_Report,
    media: news.media_FL || [],
    keywords: news.keywords || [],
    royalType: news.royalType,
    relatedNewsId: news.related_news_CD,
    basketId: news.news_basket_CD,
    classId: news.news_class_CD,
  };
} 