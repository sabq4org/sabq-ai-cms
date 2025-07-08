import { NextResponse } from 'next/server';
import axios from 'axios';

// متغيرات البيئة - مطابقة للبرومبت الرسمي
const SPA_API_KEY = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP";
const SPA_CLIENT_KEY = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4=";
const SPA_CLIENT_NAME = "SABQ"; // اسم العميل حسب العقد

// API URLs - استخدام الـ endpoint الذي يعمل
const BASE_URL = "https://nwDistAPI.spa.gov.sa/api/ClientAppSDAIA";
const ENDPOINTS = {
  GET_STATUS: `${BASE_URL}/Get_Status`,
  GET_NEXT_NEWS: `${BASE_URL}/Get_Next_News`,
  GET_BASKETS: `${BASE_URL}/Get_Baskets`
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
}

export async function GET(request: Request) {
  try {
    console.log('🔄 بدء جلب الأخبار من واس...');
    console.log('📍 استخدام endpoint:', ENDPOINTS.GET_NEXT_NEWS);
    console.log('👤 Client:', SPA_CLIENT_NAME);

    // محاولة جلب الأخبار باستخدام GET مع body في data
    const response = await axios({
      method: 'GET',
      url: ENDPOINTS.GET_NEXT_NEWS,
      headers: {
        "X-API-Key": SPA_API_KEY,
        "Content-Type": "application/json"
      },
      data: {
        "Client": {
          "client_name_TXT": SPA_CLIENT_NAME,
          "client_key_TXT": SPA_CLIENT_KEY
        },
        "last_news_CD": 0,
        "basket_CD": 1, // استخدم 1 كما في البرومبت
        "IS_recived": true, // تغيير إلى true كما في البرومبت
        "IS_load_media": true
      },
      timeout: 30000
    });

    console.log('✅ تم جلب البيانات من واس بنجاح');
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
      } else if (typeof response.data === 'object' && response.data.news_CD) {
        // قد تكون البيانات كائن واحد (خبر واحد)
        newsArray = [response.data];
      }
      
      console.log('📊 عدد الأخبار:', newsArray.length);
      
      newsArray.forEach((item: any) => {
        try {
          // معالجة مرنة للحقول المختلفة المحتملة
          const newsItem: WasNewsItem = {
            id: item.news_CD || item.newsCD || item.news_id || item.id || Math.random().toString(),
            title: item.news_title || item.newsTitle || item.title || item.headline || 'عنوان غير متوفر',
            summary: item.news_brief || item.newsBrief || item.brief || item.summary || item.excerpt || '',
            content: item.news_body || item.newsBody || item.body || item.content || item.fullText || '',
            publishDate: item.news_date || item.newsDate || item.date || item.publishDate || new Date().toISOString(),
            category: item.classification_name || item.classificationName || item.category || item.section || 'عام',
            imageUrl: item.media_url || item.mediaUrl || item.image || item.imageUrl || '',
            priority: item.priority_name || item.priorityName || item.priority || 'normal',
            language: item.language || item.lang || 'ar'
          };
          
          processedNews.push(newsItem);
          console.log('✅ تمت معالجة خبر:', newsItem.title.substring(0, 50));
        } catch (error) {
          console.warn('⚠️ تخطي خبر بسبب خطأ في البيانات:', error);
        }
      });
    }

    return NextResponse.json({
      success: true,
      count: processedNews.length,
      data: processedNews,
      message: processedNews.length > 0 
        ? `تم جلب ${processedNews.length} خبر من واس بنجاح`
        : 'لا توجد أخبار متاحة حالياً من واس',
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
      
      errorMessage = `خطأ API: ${error.response.status} - ${error.response.statusText}`;
      statusCode = error.response.status;
      details = error.response.data || {};
      
      // إذا كان الخطأ 400، ربما يحتاج صيغة مختلفة للبيانات
      if (error.response.status === 400) {
        errorMessage += ' - تحقق من صيغة البيانات المرسلة';
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
        endpoint: ENDPOINTS.GET_NEXT_NEWS,
        client_name: SPA_CLIENT_NAME,
        api_key_length: SPA_API_KEY.length,
        client_key_length: SPA_CLIENT_KEY.length
      },
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      last_news_CD = 0, 
      basket_CD = 1,
      IS_load_media = true 
    } = body;

    console.log('🔄 جلب الأخبار مع معاملات مخصصة:', { last_news_CD, basket_CD });

    const response = await axios({
      method: 'GET',
      url: ENDPOINTS.GET_NEXT_NEWS,
      headers: {
        "X-API-Key": SPA_API_KEY,
        "Content-Type": "application/json"
      },
      data: {
        "Client": {
          "client_name_TXT": SPA_CLIENT_NAME,
          "client_key_TXT": SPA_CLIENT_KEY
        },
        "last_news_CD": last_news_CD,
        "basket_CD": basket_CD,
        "IS_recived": true,
        "IS_load_media": IS_load_media
      },
      timeout: 30000
    });

    const processedNews: WasNewsItem[] = [];
    
    if (response.data) {
      const newsArray = Array.isArray(response.data) ? response.data : [response.data];
      
      newsArray.forEach((item: any) => {
        if (item && item.news_CD) {
          processedNews.push({
            id: item.news_CD || item.id || Math.random().toString(),
            title: item.news_title || item.title || 'عنوان غير متوفر',
            summary: item.news_brief || item.summary || '',
            content: item.news_body || item.content || '',
            publishDate: item.news_date || item.publishDate || new Date().toISOString(),
            category: item.classification_name || item.category || 'عام',
            imageUrl: item.media_url || item.imageUrl || '',
            priority: item.priority_name || item.priority || 'normal',
            language: item.language || 'ar'
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      count: processedNews.length,
      data: processedNews,
      parameters: { last_news_CD, basket_CD, IS_load_media },
      message: `تم جلب ${processedNews.length} خبر من واس`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'حدث خطأ في جلب الأخبار المخصصة',
      details: error.response?.data || error.message,
      timestamp: new Date().toISOString()
    }, { status: error.response?.status || 500 });
  }
}

// دالة لفحص حالة الاتصال
async function checkStatus() {
  try {
    const response = await axios({
      method: 'GET',
      url: ENDPOINTS.GET_STATUS,
      headers: {
        "X-API-Key": SPA_API_KEY,
        "Content-Type": "application/json"
      },
      data: {
        "client_name_TXT": SPA_CLIENT_NAME,
        "client_key_TXT": SPA_CLIENT_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('خطأ في فحص الحالة:', error);
    return null;
  }
}

// دالة مساعدة لجلب التصنيفات (إذا كان هناك endpoint لها)
async function getClassifications() {
  try {
    // يمكن إضافة endpoint للتصنيفات هنا إذا كان متوفراً
    console.log('📝 جلب التصنيفات غير متوفر حالياً');
    return [];
  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
    return [];
  }
} 