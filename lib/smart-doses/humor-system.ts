// 😂 نظام منع الجرعات المملة والمضحكة
export const HUMOR_DETECTION = {
  // كشف الجرعات المملة
  detectBoringContent: (articles: any[]): string[] => {
    const boringWarnings: string[] = [];
    
    const boringKeywords = [
      'الجو حر',
      'الرز من النشويات', 
      'الماء مفيد للصحة',
      'السيارات تسير على الطرق',
      'النوم مفيد ليلاً'
    ];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.excerpt || ''}`.toLowerCase();
      boringKeywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          boringWarnings.push(`تحذير: محتوى مملّ تم رصده! "${keyword}"`);
        }
      });
    });
    
    return boringWarnings;
  },

  // اقتراحات طريفة للتحسين
  getSarcasticFeedback: (qualityScore: number): string => {
    if (qualityScore < 30) {
      return "🤔 هذا المحتوى مثل القهوة الباردة... محتاج إعادة تسخين!";
    } else if (qualityScore < 50) {
      return "😅 يحتاج شوية 'ملح وفلفل' عشان يصير أطعم!";
    } else if (qualityScore < 70) {
      return "👌 لا بأس... مثل الطبخة اللي ناقصها شوية بهارات!";
    } else if (qualityScore < 85) {
      return "👍 جيد! بس ممكن نزيد شوية 'حماس'؟";
    } else {
      return "🔥 ماشاء الله! هذا المحتوى مثل المندي بالعيد!";
    }
  },

  // رسائل تحفيزية طريفة
  getMotivationalMessage: (timeSlot: string): string => {
    const messages = {
      morning: [
        "🌅 صباح الخير! جرعتك جاهزة مثل القهوة... بس أفضل!",
        "☕ استيقظ واشرب جرعة الأخبار... مافيها كافيين بس فيها معلومات!",
        "🐓 الديك يصيح والأخبار تنادي... أيهم أهم؟ 😄"
      ],
      noon: [
        "🌞 وقت الغداء ووقت الأخبار... كلهم يشبعون بس بطرق مختلفة!",
        "🍽️ جرعة أخبار مع الغداء... وجبة متكاملة للعقل والمعدة!",
        "⏰ الساعة اثنا عشر... والأخبار مثل الأذان، لازم نسمعها!"
      ],
      evening: [
        "🌆 المغرب حلو والأخبار أحلى... خاصة مع الشاي!",
        "🍃 بين المغرب والعشاء، خذ جرعتك واسترخي...",
        "🌅 غروب الشمس وشروق المعرفة... poetry level 100! 📚"
      ],
      night: [
        "🌙 قبل النوم، جرعة خفيفة مثل كوب الحليب... بس للعقل!",
        "😴 آخر جرعة قبل الأحلام... نوم العوافي وأحلام سعيدة!",
        "🛌 الآن يمكنك النوم مطمئن... أنت تعرف كل شيء حدث اليوم!"
      ]
    };
    
    const timeMessages = messages[timeSlot as keyof typeof messages] || messages.morning;
    return timeMessages[Math.floor(Math.random() * timeMessages.length)];
  },

  // كشف الأخبار الغريبة 
  detectWeirdNews: (article: any): boolean => {
    const weirdPatterns = [
      /رجل يتزوج.*شجرة/i,
      /امرأة تلد.*فيل/i,
      /سمكة تتكلم/i,
      /دجاجة تبيض.*ذهب/i,
      /رئيس يعلن.*المريخ/i
    ];
    
    const text = `${article.title} ${article.excerpt || ''}`;
    return weirdPatterns.some(pattern => pattern.test(text));
  },

  // تعليقات ساخرة على الأخطاء الشائعة
  getErrorCommentary: (error: string): string => {
    const errorComments: Record<string, string> = {
      'تكرار في العناوين': "😅 مثل المسلسل المعاد... شفناه قبل كذه!",
      'محتوى سلبي في وقت غير مناسب': "😬 هذا الخبر مثل البصل... يخلي الناس تبكي في وقت غلط!",
      'عدم توازن في المحتوى': "⚖️ المحتوى أصبح مثل الميزان المكسور... كله جهة واحدة!",
      'جودة منخفضة': "📉 هذا المحتوى يحتاج 'فيتامينات' عشان يصير أقوى!",
      'نقص في التفاعل': "😴 المحتوى نايم... محتاج منبه!"
    };
    
    return errorComments[error] || "🤷‍♂️ شيء غريب حصل... بس مانعرف إيش بالضبط!";
  }
};

// دالة تجمع كل التعليقات الطريفة
export function generateHumorousQualityReport(dose: any) {
  const report = {
    score: dose.review?.qualityScore || 0,
    sarcasticFeedback: HUMOR_DETECTION.getSarcasticFeedback(dose.review?.qualityScore || 0),
    motivationalMessage: HUMOR_DETECTION.getMotivationalMessage(dose.timeSlot),
    boringWarnings: HUMOR_DETECTION.detectBoringContent(dose.articles),
    errorCommentary: dose.review?.flaggedIssues?.map((issue: string) => 
      HUMOR_DETECTION.getErrorCommentary(issue)
    ) || [],
    weirdNewsDetected: dose.articles.some(HUMOR_DETECTION.detectWeirdNews)
  };
  
  return report;
}
