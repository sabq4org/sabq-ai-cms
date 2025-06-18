import { NextRequest, NextResponse } from 'next/server';

// محاكاة استجابة الذكاء الاصطناعي (يمكن استبدالها بـ OpenAI API لاحقًا)
async function generateAIResponse(prompt: string, action: string): Promise<string> {
  // في الإنتاج، يجب استخدام OpenAI API أو أي خدمة ذكاء اصطناعي أخرى
  
  // محاكاة التأخير
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // استجابات تجريبية حسب نوع الإجراء
  const responses: { [key: string]: string } = {
    generate_paragraph: `هذه فقرة تم توليدها بواسطة الذكاء الاصطناعي. يمكن للذكاء الاصطناعي مساعدتك في كتابة محتوى عالي الجودة بسرعة وكفاءة. استخدم هذه الأداة لتوليد أفكار جديدة أو لتحسين المحتوى الموجود لديك.`,
    
    rewrite: `[نسخة معاد صياغتها] ${prompt}`,
    
    summarize: `ملخص: ${prompt.slice(0, 100)}...`,
    
    suggest_tags: `تقنية، ذكاء اصطناعي، أخبار، تطوير`,
    
    generate_title: `عنوان مقترح: ${prompt.slice(0, 50)}`
  };
  
  return responses[action] || 'نص تم توليده بواسطة الذكاء الاصطناعي.';
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, action, content } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'نوع الإجراء مطلوب' },
        { status: 400 }
      );
    }
    
    // توليد الاستجابة
    const result = await generateAIResponse(content || prompt, action);
    
    return NextResponse.json({ 
      result,
      action,
      success: true 
    });
    
  } catch (error) {
    console.error('Error in AI editor API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    );
  }
}

// للحصول على معلومات حول API
export async function GET() {
  return NextResponse.json({
    status: 'active',
    actions: [
      'generate_paragraph',
      'rewrite',
      'summarize',
      'suggest_tags', 
      'generate_title'
    ],
    message: 'AI Editor API is running'
  });
} 