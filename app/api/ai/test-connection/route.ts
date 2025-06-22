import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'مفتاح API مطلوب' },
        { status: 400 }
      );
    }

    // في الإنتاج، يمكن اختبار الاتصال الفعلي بـ OpenAI
    // const { OpenAI } = await import('openai');
    // const openai = new OpenAI({ apiKey });
    
    // try {
    //   // اختبار بسيط للتحقق من صحة المفتاح
    //   const models = await openai.models.list();
    //   return NextResponse.json({ 
    //     success: true, 
    //     message: 'تم الاتصال بنجاح',
    //     modelsCount: models.data.length 
    //   });
    // } catch (error) {
    //   return NextResponse.json(
    //     { error: 'مفتاح API غير صحيح أو منتهي الصلاحية' },
    //     { status: 401 }
    //   );
    // }

    // محاكاة للتطوير
    if (apiKey.startsWith('sk-') && apiKey.length > 20) {
      return NextResponse.json({ 
        success: true, 
        message: 'تم الاتصال بنجاح (محاكاة)',
        modelsCount: 5
      });
    } else {
      return NextResponse.json(
        { error: 'مفتاح API غير صحيح' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error testing API connection:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء اختبار الاتصال' },
      { status: 500 }
    );
  }
} 