/**
 * هذا الملف يحتوي على بيانات المقالات الطارئة التي يتم استخدامها في حالة عدم توفر اتصال بقاعدة البيانات
 */

interface EmergencyArticle {
  id: string;
  title: string;
  summary?: string;
  content: string;
  image?: string;
  caption?: string;
  category?: string;
  publishedAt: string;
  author?: string;
}

// قائمة المقالات الطارئة
const emergencyArticles: Record<string, EmergencyArticle> = {
  article_1754300638519_2to0alw7y: {
    id: "article_1754300638519_2to0alw7y",
    title: "السعودية تدين الهجوم الإرهابي في أنقرة",
    summary:
      "أدانت المملكة العربية السعودية بشدة الهجوم الإرهابي الذي استهدف مقر الصناعات الدفاعية التركية في العاصمة أنقرة",
    content: `<div class="article-content">
      <p>أدانت المملكة العربية السعودية بشدة الهجوم الإرهابي الذي استهدف مقر الصناعات الدفاعية التركية في العاصمة أنقرة، وأسفر عن مقتل وإصابة عدد من الأشخاص.</p>
      <p>وأعربت وزارة الخارجية في بيان صدر اليوم الأربعاء، عن خالص تعازي المملكة ومواساتها لحكومة وشعب جمهورية تركيا وذوي الضحايا، وتمنياتها بالشفاء العاجل لجميع المصابين.</p>
      <p>وجددت التأكيد على موقف المملكة الرافض لجميع أشكال الإرهاب والتطرف.</p>
      <p>وكانت وسائل إعلام تركية قد ذكرت أن انفجارا وقع قرب مقر للصناعات الدفاعية في أنقرة، أعقبه إطلاق نار.</p>
    </div>`,
    image:
      "https://cdn.sabq.org/uploads/media-cache/resize_800_800/uploads/archive/2024-ar/17-cec.jpg",
    category: "الأخبار العربية والعالمية",
    publishedAt: "2023-10-23T14:30:00Z",
    author: "فريق التحرير",
  },
  article_1754300638520_3to0alw8z: {
    id: "article_1754300638520_3to0alw8z",
    title: "صندوق الاستثمارات العامة يطلق شركة تدوير المخلفات",
    summary:
      "أعلن صندوق الاستثمارات العامة إطلاق شركة تدوير المخلفات بهدف الاستثمار في قطاع تدوير المخلفات وتحويلها إلى موارد",
    content: `<div class="article-content">
      <p>أعلن صندوق الاستثمارات العامة إطلاق شركة تدوير المخلفات، بهدف الاستثمار في قطاع تدوير المخلفات وتحويلها إلى موارد، لتسهم في تحقيق الأهداف البيئية للمملكة، من خلال تطوير البنية التحتية للقطاع، وتأسيس شراكات استراتيجية، وجذب الاستثمارات الدولية.</p>
      <p>وتأتي خطوة إطلاق الشركة بما يتماشى مع أهداف رؤية السعودية 2030 وبرنامج الاستدامة، وتماشياً مع مستهدفات الاستراتيجية الوطنية للبيئة والاستراتيجية الوطنية للنفايات التي تهدف إلى تحويل 94% من المخلفات عن المطامر، وزيادة نسبة إعادة التدوير إلى 81% بحلول عام 2035.</p>
      <p>وستركز الشركة على تطوير حلول تدوير المخلفات واستثمارات في المجالات ذات المحتوى المحلي المرتفع، وستسهم في تعزيز الاقتصاد الدائري، وخلق فرص العمل، وتطوير التقنيات المتخصصة.</p>
    </div>`,
    image:
      "https://cdn.sabq.org/uploads/media-cache/resize_800_800/uploads/archive/2024-ar/recycling-company.jpg",
    category: "اقتصاد",
    publishedAt: "2023-10-22T10:15:00Z",
    author: "فريق سبق",
  },
};

// قائمة معرّفات المقالات المدعومة في الوضع الطارئ
const supportedEmergencyArticleIds = Object.keys(emergencyArticles);

/**
 * الحصول على مقال طارئ بواسطة المعرّف
 */
export function getEmergencyArticle(id: string): EmergencyArticle | null {
  return emergencyArticles[id] || null;
}

/**
 * التحقق مما إذا كان المقال مدعومًا في الوضع الطارئ
 */
export function isEmergencyArticleSupported(id: string): boolean {
  return supportedEmergencyArticleIds.includes(id);
}

/**
 * الحصول على قائمة معرّفات المقالات المدعومة في الوضع الطارئ
 */
export function getSupportedEmergencyArticleIds(): string[] {
  return supportedEmergencyArticleIds;
}

/**
 * إضافة مقال إلى قائمة المقالات الطارئة
 * ملاحظة: هذا فقط لأغراض التطوير، في الإنتاج يجب تخزين المقالات بشكل ثابت
 */
export function addEmergencyArticle(article: EmergencyArticle): void {
  if (process.env.NODE_ENV !== "production") {
    emergencyArticles[article.id] = article;
    console.log(`تم إضافة المقال ${article.id} إلى قائمة المقالات الطارئة`);
  }
}
