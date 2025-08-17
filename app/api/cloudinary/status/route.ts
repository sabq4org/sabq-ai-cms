import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 فحص حالة Cloudinary...');
    
    // فحص متغيرات البيئة
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      url: process.env.CLOUDINARY_URL
    };

    console.log('📋 إعدادات Cloudinary:', {
      cloud_name: cloudinaryConfig.cloud_name || 'غير محدد',
      api_key: cloudinaryConfig.api_key ? `${cloudinaryConfig.api_key.substring(0, 8)}...` : 'غير محدد',
      api_secret: cloudinaryConfig.api_secret ? 'موجود' : 'غير موجود',
      url: cloudinaryConfig.url ? 'موجود' : 'غير موجود'
    });

    // التحقق من اكتمال الإعدادات
    const isConfigured = !!(
      cloudinaryConfig.cloud_name && 
      cloudinaryConfig.api_key && 
      cloudinaryConfig.api_secret
    );

    let connectionTest = null;
    
    if (isConfigured) {
      try {
        // اختبار اتصال بسيط مع Cloudinary
        const testUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`;
        console.log('🌐 اختبار الاتصال مع:', testUrl);
        
        // مجرد فحص إذا كان الـ endpoint متاح
        const response = await fetch(testUrl, {
          method: 'OPTIONS',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        connectionTest = {
          accessible: response.status < 500,
          status: response.status,
          statusText: response.statusText
        };
        
        console.log('📡 نتيجة اختبار الاتصال:', connectionTest);
        
      } catch (testError) {
        console.warn('⚠️ فشل اختبار الاتصال:', testError);
        connectionTest = {
          accessible: false,
          error: testError instanceof Error ? testError.message : 'خطأ غير معروف'
        };
      }
    }

    // إحصائيات البيئة
    const environment = {
      node_env: process.env.NODE_ENV,
      deployment: process.env.VERCEL ? 'Vercel' : 'Local',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      cloudinary: {
        configured: isConfigured,
        config: {
          cloud_name: cloudinaryConfig.cloud_name || null,
          api_key_present: !!cloudinaryConfig.api_key,
          api_secret_present: !!cloudinaryConfig.api_secret,
          url_present: !!cloudinaryConfig.url
        },
        connection: connectionTest,
        status: isConfigured ? 'ready' : 'not_configured'
      },
      environment,
      recommendations: getRecommendations(isConfigured, connectionTest)
    });

  } catch (error) {
    console.error('❌ خطأ في فحص Cloudinary:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في فحص حالة Cloudinary',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

function getRecommendations(isConfigured: boolean, connectionTest: any): string[] {
  const recommendations = [];
  
  if (!isConfigured) {
    recommendations.push('أضف متغيرات Cloudinary في ملف .env.local');
    recommendations.push('تأكد من صحة CLOUDINARY_CLOUD_NAME');
    recommendations.push('تأكد من صحة CLOUDINARY_API_KEY');
    recommendations.push('تأكد من صحة CLOUDINARY_API_SECRET');
  }
  
  if (isConfigured && connectionTest && !connectionTest.accessible) {
    recommendations.push('تحقق من اتصال الإنترنت');
    recommendations.push('تأكد من صحة بيانات الاعتماد');
    recommendations.push('تحقق من إعدادات Firewall');
  }
  
  if (isConfigured && (!connectionTest || connectionTest.accessible)) {
    recommendations.push('Cloudinary مُعد ويعمل بشكل صحيح!');
    recommendations.push('يمكنك الآن رفع الصور بنجاح');
  }
  
  return recommendations;
}
