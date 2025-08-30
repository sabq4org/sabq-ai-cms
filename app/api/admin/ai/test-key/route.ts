import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from '@/app/lib/auth';
import { getOpenAIKey } from '@/lib/openai-config';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const authResult = await requireAuthFromRequest(request);
    
    if (!authResult || authResult.error) {
      console.error('🚫 محاولة وصول غير مصرح بها لاختبار مفتاح OpenAI');
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    
    // التحقق من صلاحيات المستخدم (يجب أن يكون محرر أو أدمن)
    if (!user.roles?.includes('admin') && !user.roles?.includes('editor') && !user.roles?.includes('author')) {
      console.error('🚫 المستخدم ليس لديه صلاحيات اختبار المفتاح:', user.email);
      return NextResponse.json(
        { error: 'ليس لديك صلاحية لاختبار مفتاح OpenAI' },
        { status: 403 }
      );
    }

    console.log('🔑 بدء اختبار مفتاح OpenAI للمستخدم:', user.email);
    
    // الحصول على مفتاح OpenAI
    const apiKey = await getOpenAIKey();
    
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({
        valid: false,
        error: 'لم يتم العثور على مفتاح OpenAI',
        details: 'يرجى إضافة مفتاح OpenAI من إعدادات الذكاء الاصطناعي في لوحة التحكم',
        message: 'مفتاح OpenAI غير موجود'
      });
    }

    // اختبار المفتاح بطلب بسيط
    try {
      // إنشاء عميل مؤقت للاختبار - آمن في هذا السياق
      const openai = new OpenAI({
        apiKey: apiKey.trim()
      });

      // طلب بسيط لاختبار صلاحية المفتاح
      const response = await openai.models.list();
      
      // إذا نجح الطلب، المفتاح صحيح
      console.log('✅ مفتاح OpenAI صحيح، عدد النماذج المتاحة:', response.data.length);
      
      return NextResponse.json({
        valid: true,
        message: 'مفتاح OpenAI صحيح وجاهز للاستخدام',
        details: `تم العثور على ${response.data.length} نموذج متاح`,
        models: response.data.slice(0, 5).map(m => m.id) // أول 5 نماذج فقط
      });
      
    } catch (openaiError: any) {
      console.error('❌ خطأ في اختبار مفتاح OpenAI:', openaiError);
      
      // تحليل نوع الخطأ
      if (openaiError.status === 401) {
        return NextResponse.json({
          valid: false,
          error: 'مفتاح OpenAI غير صحيح',
          details: 'يرجى التحقق من صحة المفتاح المدخل',
          message: 'مفتاح غير صحيح أو منتهي الصلاحية'
        });
      } else if (openaiError.status === 429) {
        return NextResponse.json({
          valid: false,
          error: 'تجاوز حد الاستخدام',
          details: 'تم تجاوز حد استخدام API، يرجى التحقق من رصيد الحساب',
          message: 'تجاوز حد الاستخدام المسموح'
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: 'خطأ في الاتصال بـ OpenAI',
          details: openaiError.message || 'خطأ غير معروف',
          message: 'فشل الاتصال بخدمة OpenAI'
        });
      }
    }
    
  } catch (error: any) {
    console.error('❌ خطأ في معالجة طلب اختبار المفتاح:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'حدث خطأ في معالجة الطلب',
        details: error.message || 'خطأ غير معروف',
        message: 'خطأ في النظام'
      },
      { status: 500 }
    );
  }
}