import { NextResponse } from 'next/server';
import axios from 'axios';

// معلومات API الصحيحة من العميل - محدثة بناءً على الاختبارات الناجحة
const SPA_API_KEY = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP";
const SPA_CUSTOMER_KEY = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4=";

// API URLs - استخدام الـ URL الصحيح من نتائج الاختبار
const BASE_URL = "https://nwdistapi.spa.gov.sa";

// تحديد endpoints بناءً على نتائج الاختبار الناجحة
const ENDPOINTS = {
  // ClientAppV1 endpoints - نجح GetStatus مع هذا المسار
  GET_STATUS: `${BASE_URL}/ClientAppV1/GetStatus`,
  GET_BASKETS: `${BASE_URL}/ClientAppV1/GetBaskets`,
  GET_NEXT_NEWS: `${BASE_URL}/ClientAppV1/GetNextNews`,
  GET_ALL_CLASSIFICATIONS: `${BASE_URL}/ClientAppV1/GetAllClassifications`,
  GET_ALL_SITE_SECTIONS: `${BASE_URL}/ClientAppV1/GetAllSiteSections`,
  GET_ALL_PRIORITIES: `${BASE_URL}/ClientAppV1/GetAllPriorities`,
  GET_ALL_REGIONS: `${BASE_URL}/ClientAppV1/GetAllRegions`,
};

interface WasNewsItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  publishDate: string;
  category?: string;
  imageUrl?: string;
  priority?: string;
  language?: string;
  region?: string;
}

export async function GET(request: Request) {
  try {
    console.log('🔄 بدء جلب الأخبار من واس...');
    console.log('📍 استخدام ClientAppV1 endpoints');
    console.log('🔑 API Key و Customer Key متوفران');

    // أولاً: التحقق من حالة الاتصال
    try {
      console.log('🔍 فحص حالة الاتصال...');
      const statusResponse = await axios({
        method: 'GET',
        url: ENDPOINTS.GET_STATUS,
        headers: {
          "X-API-Key": SPA_API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "SABQ-CMS/1.0"
        },
        timeout: 30000
      });

      console.log('✅ حالة الاتصال:', statusResponse.data);
      
      if (!statusResponse.data.isActiveClient) {
        throw new Error('العميل غير نشط: ' + statusResponse.data.message);
      }
    } catch (statusError) {
      console.error('❌ فشل فحص الحالة:', statusError);
    }

    // محاولة جلب الأخبار
    let response;
    let endpointUsed = '';
    let errorDetails = [];
    
    // محاولة 1: GetNextNews مع معاملات مختلفة
    const newsRequestVariants = [
      {
        // محاولة 1: بدون body (GET فقط)
        method: 'GET',
        params: {
          lastNewsId: 0,
          basketId: 1,
          loadMedia: true
        }
      },
      {
        // محاولة 2: مع body بسيط
        method: 'POST',
        data: {
          LastNewsId: 0,
          BasketId: 1,
          IsRecived: false,
          LoadMedia: true
        }
      },
      {
        // محاولة 3: مع Client object
        method: 'POST',
        data: {
          Client: {
            ClientName: "SABQ",
            ClientKey: SPA_CUSTOMER_KEY,
            LanguageId: 1
          },
          LastNewsId: 0,
          BasketId: 1,
          IsRecived: false,
          LoadMedia: true
        }
      }
    ];

    for (let i = 0; i < newsRequestVariants.length; i++) {
      const variant = newsRequestVariants[i];
      try {
        console.log(`📍 محاولة ${i + 1}: ${variant.method} ${ENDPOINTS.GET_NEXT_NEWS}`);
        
        const requestConfig: any = {
          method: variant.method,
          url: ENDPOINTS.GET_NEXT_NEWS,
          headers: {
            "X-API-Key": SPA_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 30000
        };

        if (variant.params) {
          requestConfig.params = variant.params;
        }
        if (variant.data) {
          requestConfig.data = variant.data;
        }

        response = await axios(requestConfig);
        endpointUsed = `GetNextNews - محاولة ${i + 1}`;
        console.log('✅ نجحت المحاولة!');
        break;
      } catch (error: any) {
        console.log(`❌ فشلت المحاولة ${i + 1}:`, error.response?.status || error.message);
        errorDetails.push({
          attempt: i + 1,
          status: error.response?.status,
          message: error.response?.data || error.message
        });
      }
    }

    // إذا فشلت جميع المحاولات مع GetNextNews، نحاول GetBaskets
    if (!response) {
      try {
        console.log('📍 محاولة GetBaskets كبديل...');
        response = await axios({
          method: 'GET',
          url: ENDPOINTS.GET_BASKETS,
          headers: {
            "X-API-Key": SPA_API_KEY,
            "Content-Type": "application/json"
          },
          timeout: 30000
        });
        endpointUsed = 'GetBaskets';
      } catch (error: any) {
        console.log('❌ فشل GetBaskets أيضاً:', error.response?.status);
        errorDetails.push({
          endpoint: 'GetBaskets',
          status: error.response?.status,
          message: error.response?.data || error.message
        });
      }
    }

    if (!response) {
      // إذا فشلت جميع المحاولات
      throw new Error('فشلت جميع محاولات جلب الأخبار');
    }

    console.log('✅ تم جلب البيانات من واس بنجاح');
    console.log('📊 استخدام endpoint:', endpointUsed);
    console.log('📊 نوع البيانات:', typeof response.data);
    console.log('📊 البيانات:', JSON.stringify(response.data).substring(0, 200));
    
    // معالجة البيانات وتحويلها لصيغة موحدة
    const processedNews: WasNewsItem[] = [];
    
    if (response.data) {
      // تحقق من شكل البيانات
      let newsArray = [];
      
      if (Array.isArray(response.data)) {
        newsArray = response.data;
      } else if (response.data.news && Array.isArray(response.data.news)) {
        newsArray = response.data.news;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        newsArray = response.data.data;
      } else if (response.data.News && Array.isArray(response.data.News)) {
        newsArray = response.data.News;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        newsArray = response.data.items;
      } else if (typeof response.data === 'object') {
        // قد تكون البيانات كائن واحد أو يحتوي على خبر واحد
        if (response.data.news_CD || response.data.NewsId || response.data.news_id || response.data.id) {
          newsArray = [response.data];
        }
      }
      
      console.log('📊 عدد الأخبار:', newsArray.length);
      
      newsArray.forEach((item: any) => {
        try {
          // معالجة مرنة للحقول المختلفة المحتملة
          const newsItem: WasNewsItem = {
            id: item.news_CD || item.NewsId || item.news_id || item.id || Math.random().toString(),
            title: item.news_title || item.NewsTitle || item.Title || item.title || item.headline || 'عنوان غير متوفر',
            summary: item.news_brief || item.NewsBrief || item.Brief || item.Summary || item.summary || item.excerpt || '',
            content: item.news_body || item.NewsBody || item.Body || item.Content || item.content || item.fullText || '',
            publishDate: item.news_date || item.NewsDate || item.Date || item.PublishDate || item.publishDate || new Date().toISOString(),
            category: item.classification_name || item.ClassificationName || item.Category || item.category || item.section || 'عام',
            imageUrl: item.media_url || item.MediaUrl || item.ImageUrl || item.image || item.imageUrl || '',
            priority: item.priority_name || item.PriorityName || item.Priority || item.priority || 'normal',
            language: item.language || item.Language || item.lang || 'ar',
            region: item.region_name || item.RegionName || item.Region || item.region || ''
          };
          
          processedNews.push(newsItem);
          console.log('✅ تمت معالجة خبر:', newsItem.title.substring(0, 50));
        } catch (error) {
          console.warn('⚠️ تخطي خبر بسبب خطأ في البيانات:', error);
        }
      });
    }

    // إذا لم نحصل على أخبار، نعيد رسالة توضيحية مع معلومات الحالة
    if (processedNews.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        data: [],
        message: 'الحساب نشط ولكن لا توجد أخبار متاحة حالياً. قد يحتاج الحساب إلى تفعيل كامل من قبل وكالة الأنباء السعودية.',
        status: {
          isActiveClient: true,
          message: "الحساب نشط ولكن يحتاج إلى تفعيل الخدمات"
        },
        endpoint: endpointUsed,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      count: processedNews.length,
      data: processedNews,
      message: `تم جلب ${processedNews.length} خبر من واس بنجاح`,
      endpoint: endpointUsed,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('🔴 خطأ في جلب أخبار واس:', error);

    let errorMessage = 'حدث خطأ في جلب الأخبار من واس';
    let statusCode = 500;
    let details = {};

    if (error.response) {
      console.error('🔴 فشل API واس - تفاصيل:', error.response.data);
      console.error('🔴 Status:', error.response.status);
      console.error('🔴 Headers:', error.response.headers);
      
      errorMessage = `خطأ API: ${error.response.status} - ${error.response.statusText}`;
      statusCode = error.response.status;
      details = error.response.data || {};
      
      // رسائل خطأ مفصلة حسب الكود
      if (error.response.status === 401) {
        errorMessage = 'مفتاح API غير صحيح أو غير مصرح بالوصول';
      } else if (error.response.status === 400) {
        errorMessage = 'خطأ في صيغة البيانات المرسلة';
      } else if (error.response.status === 403) {
        errorMessage = 'ليس لديك صلاحية للوصول لهذه الخدمة';
      } else if (error.response.status === 404) {
        errorMessage = 'رابط API غير موجود - يُرجى التحقق من endpoint';
      } else if (error.response.status === 500) {
        errorMessage = 'خطأ في خادم واس - يُرجى المحاولة لاحقاً';
      }
    } else if (error.request) {
      console.error('🔴 لا يوجد رد من API واس');
      errorMessage = 'لا يمكن الوصول إلى خدمة واس حالياً';
      statusCode = 503;
    } else {
      console.error('🔴 خطأ في إعداد الطلب:', error.message);
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: details,
      debug: {
        endpoints_tried: [ENDPOINTS.GET_NEXT_NEWS, ENDPOINTS.GET_BASKETS],
        api_key_length: SPA_API_KEY.length,
        customer_key_length: SPA_CUSTOMER_KEY.length,
        error_type: error.response ? 'api_error' : error.request ? 'network_error' : 'setup_error'
      },
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }
}

// دالة مساعدة لجلب حالة الاتصال - محدثة للمسار الصحيح
export async function checkStatus() {
  try {
    const response = await axios({
      method: 'GET',
      url: ENDPOINTS.GET_STATUS,
      headers: {
        "X-API-Key": SPA_API_KEY,
        "Content-Type": "application/json"
      },
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    console.error('خطأ في فحص الحالة:', error);
    return null;
  }
}

// دالة مساعدة لجلب التصنيفات - محدثة للمسار الصحيح
export async function getClassifications() {
  try {
    const response = await axios({
      method: 'GET',
      url: ENDPOINTS.GET_ALL_CLASSIFICATIONS,
      headers: {
        "X-API-Key": SPA_API_KEY,
        "Content-Type": "application/json"
      },
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
    return [];
  }
}

// دالة مساعدة لجلب الأولويات - محدثة للمسار الصحيح
export async function getPriorities() {
  try {
    const response = await axios({
      method: 'GET',
      url: ENDPOINTS.GET_ALL_PRIORITIES,
      headers: {
        "X-API-Key": SPA_API_KEY,
        "Content-Type": "application/json"
      },
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب الأولويات:', error);
    return [];
  }
}

// دالة مساعدة لجلب المناطق - محدثة للمسار الصحيح
export async function getRegions() {
  try {
    const response = await axios({
      method: 'GET',
      url: ENDPOINTS.GET_ALL_REGIONS,
      headers: {
        "X-API-Key": SPA_API_KEY,
        "Content-Type": "application/json"
      },
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب المناطق:', error);
    return [];
  }
} 