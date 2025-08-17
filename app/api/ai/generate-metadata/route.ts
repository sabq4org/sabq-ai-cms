import { NextRequest, NextResponse } from 'next/server';

// محاكاة API ذكي لتوليد البيانات الوصفية
export async function POST(request: NextRequest) {
  try {
    const { content, type } = await request.json();
    
    console.log('🤖 طلب توليد بيانات وصفية:', { 
      type, 
      contentLength: content?.length || 0,
      contentPreview: content?.substring(0, 100) + '...'
    });

    // التحقق من وجود المحتوى
    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      return NextResponse.json({
        success: false,
        error: 'المحتوى المدخل غير كافي. يجب أن يكون على الأقل 20 حرف.',
        required_length: 20,
        current_length: content?.length || 0
      }, { status: 400 });
    }

    const cleanContent = content.trim();
    
    // إزالة HTML tags إذا وجدت
    const textContent = cleanContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (textContent.length < 20) {
      return NextResponse.json({
        success: false,
        error: 'النص بعد تنظيف HTML غير كافي. يجب أن يكون على الأقل 20 حرف.',
        clean_length: textContent.length
      }, { status: 400 });
    }

    // محاكاة تأخير معالجة AI
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    let result: any = { success: true };

    switch (type) {
      case 'title':
        result.title = generateTitle(textContent);
        result.message = 'تم توليد العنوان بنجاح';
        break;
        
      case 'summary':
      case 'excerpt':
        result.summary = generateSummary(textContent);
        result.excerpt = result.summary;
        result.message = 'تم توليد الموجز بنجاح';
        break;
        
      case 'keywords':
        result.keywords = generateKeywords(textContent);
        result.message = 'تم توليد الكلمات المفتاحية بنجاح';
        break;
        
      case 'seo':
        result.seoTitle = generateSEOTitle(textContent);
        result.seoDescription = generateSEODescription(textContent);
        result.message = 'تم توليد بيانات SEO بنجاح';
        break;
        
      case 'all':
        result.title = generateTitle(textContent);
        result.summary = generateSummary(textContent);
        result.keywords = generateKeywords(textContent);
        result.seoTitle = generateSEOTitle(textContent);
        result.seoDescription = generateSEODescription(textContent);
        result.message = 'تم توليد جميع البيانات الوصفية بنجاح';
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'نوع التوليد غير مدعوم',
          supported_types: ['title', 'summary', 'keywords', 'seo', 'all']
        }, { status: 400 });
    }

    console.log('✅ تم توليد البيانات بنجاح:', { type, result });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ خطأ في توليد البيانات الوصفية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء توليد البيانات الوصفية',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// دوال توليد ذكية بناءً على المحتوى
function generateTitle(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const firstSentence = sentences[0]?.trim() || '';
  
  // استخراج الكلمات المفتاحية
  const words = firstSentence.split(' ').filter(w => w.length > 3);
  const importantWords = words.slice(0, 8).join(' ');
  
  // قوالب عناوين
  const templates = [
    importantWords,
    `${importantWords} - آخر التطورات`,
    `عاجل: ${importantWords}`,
    `${importantWords} وتأثيرها على المستقبل`,
    `كل ما تحتاج معرفته عن ${importantWords}`,
  ];
  
  // اختيار قالب مناسب بناءً على طول النص
  let selectedTitle = templates[0];
  if (content.length > 500) {
    selectedTitle = templates[Math.floor(Math.random() * templates.length)];
  }
  
  return selectedTitle.length > 80 ? selectedTitle.substring(0, 77) + '...' : selectedTitle;
}

function generateSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // أخذ أول 2-3 جمل كموجز
  const summaryLength = Math.min(3, sentences.length);
  const summary = sentences.slice(0, summaryLength).join('. ');
  
  return summary.length > 300 ? summary.substring(0, 297) + '...' : summary + '.';
}

function generateKeywords(content: string): string[] {
  // كلمات شائعة يجب تجاهلها
  const stopWords = new Set([
    'في', 'من', 'إلى', 'على', 'أن', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'كانت',
    'يكون', 'تكون', 'مع', 'عن', 'كل', 'بعض', 'جميع', 'بين', 'خلال', 'أثناء',
    'قد', 'لقد', 'منذ', 'حتى', 'بعد', 'قبل', 'عند', 'لدى', 'سوف', 'أيضا',
    'والتي', 'وهو', 'وهي', 'حيث', 'كما', 'أم', 'أو', 'إذا', 'لكن', 'غير'
  ]);
  
  // استخراج الكلمات وتنظيفها
  const words = content
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\s]/g, ' ') // الاحتفاظ بالأحرف العربية فقط
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopWords.has(word));
  
  // حساب تكرار الكلمات
  const frequency: { [key: string]: number } = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // ترتيب الكلمات حسب التكرار
  const sortedWords = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  // إضافة كلمات مفتاحية ذكية بناءً على السياق
  const contextKeywords = extractContextKeywords(content);
  
  // دمج الكلمات وإزالة المكررات
  const allKeywords = [...new Set([...sortedWords, ...contextKeywords])];
  
  return allKeywords.slice(0, 8);
}

function extractContextKeywords(content: string): string[] {
  const keywords: string[] = [];
  
  // كلمات مفتاحية حسب المجال
  const domains = {
    'تكنولوجيا': ['ذكي', 'رقمي', 'تطبيق', 'برنامج', 'نظام', 'تقنية', 'ابتكار', 'تطوير'],
    'اقتصاد': ['مالي', 'استثمار', 'سوق', 'تجارة', 'أسهم', 'عملة', 'بنك', 'اقتصادي'],
    'سياسة': ['حكومة', 'وزير', 'رئيس', 'مجلس', 'قرار', 'سياسي', 'دولة', 'حزب'],
    'رياضة': ['فريق', 'لاعب', 'مباراة', 'بطولة', 'كأس', 'هدف', 'مدرب', 'ملعب'],
    'صحة': ['طبي', 'مرض', 'علاج', 'دواء', 'مستشفى', 'طبيب', 'صحي', 'وقاية'],
  };
  
  Object.entries(domains).forEach(([domain, domainKeywords]) => {
    domainKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        keywords.push(domain, keyword);
      }
    });
  });
  
  return [...new Set(keywords)];
}

function generateSEOTitle(content: string): string {
  const title = generateTitle(content);
  
  // إضافة كلمات SEO
  const seoEnhancers = [
    'أحدث الأخبار',
    'آخر التطورات', 
    'تحليل شامل',
    'معلومات كاملة',
    'دليل شامل'
  ];
  
  const enhancer = seoEnhancers[Math.floor(Math.random() * seoEnhancers.length)];
  const seoTitle = `${title} | ${enhancer}`;
  
  return seoTitle.length > 60 ? seoTitle.substring(0, 57) + '...' : seoTitle;
}

function generateSEODescription(content: string): string {
  const summary = generateSummary(content);
  const keywords = generateKeywords(content).slice(0, 3);
  
  let description = summary;
  
  // إضافة call-to-action
  const ctas = [
    'اقرأ المزيد للتفاصيل الكاملة.',
    'تابع آخر التطورات هنا.',
    'اكتشف التفاصيل الكاملة الآن.',
    'لا تفوت هذا التحليل المهم.'
  ];
  
  const cta = ctas[Math.floor(Math.random() * ctas.length)];
  description += ` ${cta}`;
  
  // إضافة كلمات مفتاحية إذا لم تكن موجودة
  keywords.forEach(keyword => {
    if (!description.includes(keyword)) {
      description += ` #${keyword}`;
    }
  });
  
  return description.length > 160 ? description.substring(0, 157) + '...' : description;
}
