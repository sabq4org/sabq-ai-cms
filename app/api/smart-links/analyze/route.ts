import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import OpenAI from 'openai';

const prisma = new PrismaClient();

// إعداد OpenAI للتحليل الذكي
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// إعداد دعم اللغات المتعددة
const SUPPORTED_LANGUAGES = {
  ar: 'Arabic',
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish'
};

// أنواع الكيانات المدعومة
const ENTITY_TYPES = {
  PERSON: { name: 'person', icon: '👤', color: '#3B82F6' },
  ORGANIZATION: { name: 'organization', icon: '🏛️', color: '#10B981' },
  LOCATION: { name: 'location', icon: '📍', color: '#F59E0B' },
  PROJECT: { name: 'project', icon: '🏗️', color: '#8B5CF6' },
  EVENT: { name: 'event', icon: '📅', color: '#EF4444' },
  TERM: { name: 'term', icon: '📚', color: '#06B6D4' },
  COMPANY: { name: 'company', icon: '🏢', color: '#059669' },
  GOVERNMENT: { name: 'government', icon: '🏛️', color: '#DC2626' }
};

interface AnalyzeRequest {
  text: string;
  articleId?: string;
  context?: string;
  userId?: string;
  language?: keyof typeof SUPPORTED_LANGUAGES;
  enableAI?: boolean;
  personalization?: boolean;
  maxSuggestions?: number;
}

interface EntityMatch {
  entityId: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  entity: {
    id: string;
    name: string;
    name_ar: string;
    name_en: string;
    entity_type: {
      name: string;
      name_ar: string;
      icon: string;
      color: string;
    };
    description: string;
    importance_score: number;
    slug: string;
    official_website: string;
    wikipedia_url: string;
  };
  suggestedLink: {
    type: 'entity' | 'tooltip' | 'modal' | 'external';
    url?: string;
    tooltip_content?: string;
  };
}

interface TermMatch {
  termId: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  term: {
    id: string;
    term: string;
    definition: string;
    detailed_def: string;
    category: string;
    difficulty: string;
  };
  suggestedLink: {
    type: 'tooltip' | 'modal';
    tooltip_content: string;
  };
}

interface AnalyzeResponse {
  entities: EntityMatch[];
  terms: TermMatch[];
  totalMatches: number;
  processingTime: number;
  aiSuggestions?: any[];
  knowledgeGraph?: any;
  personalization?: any;
}

// 🤖 تحليل النص بالذكاء الاصطناعي باستخدام GPT
async function analyzeWithAI(text: string, language: string = 'ar'): Promise<any[]> {
  try {
    const prompt = `
تحليل النص التالي واستخراج الكيانات المهمة:

النص: "${text}"

المطلوب:
1. تحديد الأشخاص المهمين (أسماء، مناصب، أدوار)
2. المنظمات والشركات والحكومات
3. الأماكن والمدن والدول
4. المشاريع والمبادرات
5. التواريخ والأحداث المهمة
6. المصطلحات التقنية والاقتصادية

أرجع النتيجة في JSON بالشكل التالي:
{
  "entities": [
    {
      "text": "النص المستخرج",
      "type": "نوع الكيان",
      "context": "السياق",
      "importance": "درجة الأهمية من 1-10",
      "description": "وصف مختصر"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "أنت محلل نصوص ذكي متخصص في الأخبار العربية. مهمتك تحديد الكيانات المهمة في النصوص."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const result = completion.choices[0]?.message?.content;
    if (result) {
      try {
        return JSON.parse(result).entities || [];
      } catch (parseError) {
        console.warn('خطأ في تحليل نتيجة AI:', parseError);
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error('خطأ في تحليل AI:', error);
    return [];
  }
}

// 🎯 التخصيص الشخصي حسب اهتمامات المستخدم
async function getPersonalizedSuggestions(userId: string, entities: EntityMatch[]): Promise<any> {
  if (!userId) return null;

  try {
    // جلب اهتمامات المستخدم من قاعدة البيانات
    const userInterests = await prisma.link_analytics.groupBy({
      by: ['entity_id'],
      where: {
        user_agent: { contains: userId }, // أو استخدام نظام المستخدمين الفعلي
        event_type: 'click'
      },
      _count: {
        entity_id: true
      },
      orderBy: {
        _count: {
          entity_id: 'desc'
        }
      },
      take: 10
    });

    // تحسين ترتيب الكيانات حسب الاهتمامات
    const personalizedEntities = entities.map(entity => {
      const interest = userInterests.find(ui => ui.entity_id === entity.entityId);
      const interestScore = interest ? interest._count.entity_id * 0.1 : 0;
      
      return {
        ...entity,
        personalizedScore: entity.confidence + interestScore,
        isPersonalized: interestScore > 0
      };
    });

    return {
      personalizedEntities: personalizedEntities.sort((a, b) => b.personalizedScore - a.personalizedScore),
      userInterests: userInterests.slice(0, 5)
    };
  } catch (error) {
    console.error('خطأ في التخصيص الشخصي:', error);
    return null;
  }
}

// 📚 إنشاء شبكة المعرفة (Knowledge Graph)
async function buildKnowledgeGraph(entities: EntityMatch[]): Promise<any> {
  try {
    const entityIds = entities.map(e => e.entityId);
    
    // جلب العلاقات بين الكيانات
    const relationships = await prisma.entity_links.findMany({
      where: {
        OR: [
          { source_entity_id: { in: entityIds } },
          { target_entity_id: { in: entityIds } }
        ]
      },
      include: {
        source_entity: {
          include: { entity_type: true }
        },
        target_entity: {
          include: { entity_type: true }
        }
      }
    });

    // بناء الشبكة
    const nodes = entities.map(entity => ({
      id: entity.entityId,
      label: entity.entity.name,
      type: entity.entity.entity_type.name,
      importance: entity.entity.importance_score,
      color: entity.entity.entity_type.color
    }));

    const edges = relationships.map(rel => ({
      source: rel.source_entity_id,
      target: rel.target_entity_id,
      relationship: rel.relationship_ar || rel.relationship_type,
      strength: rel.strength
    }));

    return {
      nodes,
      edges,
      totalConnections: edges.length,
      centralNodes: nodes.filter(n => n.importance >= 8)
    };
  } catch (error) {
    console.error('خطأ في بناء شبكة المعرفة:', error);
    return null;
  }
}

// 📊 تحليلات متقدمة
async function getAdvancedAnalytics(entities: EntityMatch[], articleId?: string): Promise<any> {
  try {
    const entityIds = entities.map(e => e.entityId);
    
    // إحصائيات التفاعل
    const analytics = await prisma.link_analytics.groupBy({
      by: ['entity_id', 'event_type'],
      where: {
        entity_id: { in: entityIds },
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // آخر 30 يوم
        }
      },
      _count: {
        entity_id: true
      }
    });

    // تحليل الترندات
    const trends = await prisma.link_analytics.groupBy({
      by: ['entity_id'],
      where: {
        entity_id: { in: entityIds },
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر 7 أيام
        }
      },
      _count: {
        entity_id: true
      },
      orderBy: {
        _count: {
          entity_id: 'desc'
        }
      }
    });

    // معدل النقر
    const clickRates = analytics
      .filter(a => a.event_type === 'click')
      .map(a => ({
        entityId: a.entity_id,
        clicks: a._count.entity_id
      }));

    return {
      totalInteractions: analytics.reduce((sum, a) => sum + a._count.entity_id, 0),
      topTrending: trends.slice(0, 5),
      clickRates,
      avgClickRate: clickRates.length > 0 ? 
        clickRates.reduce((sum, cr) => sum + cr.clicks, 0) / clickRates.length : 0
    };
  } catch (error) {
    console.error('خطأ في التحليلات المتقدمة:', error);
    return null;
  }
}

// 🔍 تحديد اللغة تلقائياً
function detectLanguage(text: string): keyof typeof SUPPORTED_LANGUAGES {
  // نمط بسيط لتحديد اللغة العربية
  const arabicPattern = /[\u0600-\u06FF]/g;
  const arabicMatches = text.match(arabicPattern);
  
  if (arabicMatches && arabicMatches.length > text.length * 0.3) {
    return 'ar';
  }
  
  return 'en'; // افتراضي
}

// دالة تنظيف النص وإزالة علامات HTML
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // إزالة HTML tags
    .replace(/&nbsp;/g, ' ') // إزالة &nbsp;
    .replace(/\s+/g, ' ')    // توحيد المسافات
    .trim();
}

// دالة إنشاء أنماط البحث للكيان (اسماء مختلفة)
function createSearchPatterns(entity: any): string[] {
  const patterns: string[] = [];
  
  if (entity.name) patterns.push(entity.name);
  if (entity.name_ar) patterns.push(entity.name_ar);
  if (entity.name_en) patterns.push(entity.name_en);
  
  if (entity.aliases && Array.isArray(entity.aliases)) {
    patterns.push(...entity.aliases);
  }
  
  return patterns.filter(p => p && p.length > 2); // تجاهل النصوص القصيرة جداً
}

// دالة البحث عن الكيانات في النص
function findEntityMatches(text: string, entities: any[]): EntityMatch[] {
  const matches: EntityMatch[] = [];
  const textLower = text.toLowerCase();
  
  for (const entity of entities) {
    const patterns = createSearchPatterns(entity);
    
    for (const pattern of patterns) {
      const patternLower = pattern.toLowerCase();
      let startIndex = 0;
      
      while (true) {
        const index = textLower.indexOf(patternLower, startIndex);
        if (index === -1) break;
        
        // التحقق من أن الكلمة محاطة بحدود طبيعية
        const isWordBoundary = (
          (index === 0 || !/[\u0621-\u06FF\w]/.test(text[index - 1])) &&
          (index + pattern.length === text.length || !/[\u0621-\u06FF\w]/.test(text[index + pattern.length]))
        );
        
        if (isWordBoundary) {
          // تجنب التداخل مع مطابقات سابقة
          const hasOverlap = matches.some(match => 
            (index >= match.startIndex && index < match.endIndex) ||
            (index + pattern.length > match.startIndex && index + pattern.length <= match.endIndex) ||
            (index <= match.startIndex && index + pattern.length >= match.endIndex)
          );
          
          if (!hasOverlap) {
            // حساب مستوى الثقة بناءً على عوامل متعددة
            let confidence = 0.7; // ثقة أساسية
            
            // زيادة الثقة للنصوص الطويلة
            if (pattern.length > 10) confidence += 0.2;
            
            // زيادة الثقة للكيانات المهمة
            if (entity.importance_score >= 8) confidence += 0.1;
            
            // زيادة الثقة إذا كان النص هو الاسم الأساسي
            if (pattern === entity.name || pattern === entity.name_ar) {
              confidence += 0.1;
            }
            
            confidence = Math.min(confidence, 1.0);
            
            // اقتراح نوع الرابط
            let linkType: 'entity' | 'tooltip' | 'modal' | 'external' = 'entity';
            let url = `/entity/${entity.slug}`;
            let tooltip_content = entity.description;
            
            if (entity.entity_type.name === 'term') {
              linkType = 'tooltip';
              tooltip_content = entity.description;
            } else if (entity.official_website) {
              linkType = 'external';
              url = entity.official_website;
            }
            
            matches.push({
              entityId: entity.id,
              matchedText: text.substring(index, index + pattern.length),
              startIndex: index,
              endIndex: index + pattern.length,
              confidence,
              entity: {
                id: entity.id,
                name: entity.name,
                name_ar: entity.name_ar,
                name_en: entity.name_en,
                entity_type: entity.entity_type,
                description: entity.description,
                importance_score: entity.importance_score,
                slug: entity.slug,
                official_website: entity.official_website,
                wikipedia_url: entity.wikipedia_url
              },
              suggestedLink: {
                type: linkType,
                url,
                tooltip_content
              }
            });
          }
        }
        
        startIndex = index + 1;
      }
    }
  }
  
  // ترتيب المطابقات حسب أهمية الكيان ثم مستوى الثقة
  return matches.sort((a, b) => {
    if (a.entity.importance_score !== b.entity.importance_score) {
      return b.entity.importance_score - a.entity.importance_score;
    }
    return b.confidence - a.confidence;
  });
}

// دالة البحث عن المصطلحات
function findTermMatches(text: string, terms: any[]): TermMatch[] {
  const matches: TermMatch[] = [];
  const textLower = text.toLowerCase();
  
  for (const term of terms) {
    const patterns: string[] = [term.term];
    
    if (term.synonyms && Array.isArray(term.synonyms)) {
      patterns.push(...term.synonyms);
    }
    
    for (const pattern of patterns) {
      const patternLower = pattern.toLowerCase();
      let startIndex = 0;
      
      while (true) {
        const index = textLower.indexOf(patternLower, startIndex);
        if (index === -1) break;
        
        const isWordBoundary = (
          (index === 0 || !/[\u0621-\u06FF\w]/.test(text[index - 1])) &&
          (index + pattern.length === text.length || !/[\u0621-\u06FF\w]/.test(text[index + pattern.length]))
        );
        
        if (isWordBoundary) {
          const hasOverlap = matches.some(match => 
            (index >= match.startIndex && index < match.endIndex) ||
            (index + pattern.length > match.startIndex && index + pattern.length <= match.endIndex) ||
            (index <= match.startIndex && index + pattern.length >= match.endIndex)
          );
          
          if (!hasOverlap) {
            matches.push({
              termId: term.id,
              matchedText: text.substring(index, index + pattern.length),
              startIndex: index,
              endIndex: index + pattern.length,
              term: {
                id: term.id,
                term: term.term,
                definition: term.definition,
                detailed_def: term.detailed_def,
                category: term.category,
                difficulty: term.difficulty
              },
              suggestedLink: {
                type: 'tooltip',
                tooltip_content: term.definition
              }
            });
          }
        }
        
        startIndex = index + 1;
      }
    }
  }
  
  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    await prisma.$connect();
    
    const body = await request.json() as AnalyzeRequest;
    const { 
      text, 
      articleId, 
      context, 
      userId, 
      language, 
      enableAI = true, 
      personalization = false,
      maxSuggestions = 10 
    } = body;
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        error: 'النص مطلوب للتحليل'
      }, { status: 400 });
    }
    
    // تحديد اللغة تلقائياً إذا لم تكن محددة
    const detectedLanguage = language || detectLanguage(text);
    const cleanedText = cleanText(text);
    
    console.log(`🔍 بدء تحليل متقدم للنص (${cleanedText.length} حرف) - اللغة: ${SUPPORTED_LANGUAGES[detectedLanguage]}`);
    
    // جلب جميع الكيانات النشطة مع معلومات النوع
    const entities = await prisma.smartEntities.findMany({
      where: {
        is_active: true
      },
      include: {
        entity_type: true
      },
      orderBy: {
        importance_score: 'desc'
      }
    });
    
    // جلب جميع المصطلحات النشطة
    const terms = await prisma.smartTerms.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        usage_count: 'desc'
      }
    });
    
    // البحث عن المطابقات التقليدي
    let entityMatches = findEntityMatches(cleanedText, entities);
    const termMatches = findTermMatches(cleanedText, terms);
    
    // 🤖 التحليل بالذكاء الاصطناعي (إذا كان مفعلاً)
    let aiSuggestions: any[] = [];
    if (enableAI && process.env.OPENAI_API_KEY) {
      console.log('🧠 بدء التحليل بالذكاء الاصطناعي...');
      aiSuggestions = await analyzeWithAI(cleanedText, detectedLanguage);
    }
    
    // 🎯 التخصيص الشخصي (إذا كان مفعلاً)
    let personalizationData: any = null;
    if (personalization && userId) {
      console.log('🎯 تطبيق التخصيص الشخصي...');
      personalizationData = await getPersonalizedSuggestions(userId, entityMatches);
      if (personalizationData?.personalizedEntities) {
        entityMatches = personalizationData.personalizedEntities;
      }
    }
    
    // 📚 بناء شبكة المعرفة
    console.log('📚 بناء شبكة المعرفة...');
    const knowledgeGraph = await buildKnowledgeGraph(entityMatches);
    
    // 📊 التحليلات المتقدمة
    console.log('📊 حساب التحليلات المتقدمة...');
    const analytics = await getAdvancedAnalytics(entityMatches, articleId);
    
    // تحديد أفضل المطابقات حسب الحد الأقصى
    entityMatches = entityMatches.slice(0, maxSuggestions);
    
    // تحديث إحصائيات الاستخدام
    for (const match of entityMatches) {
      await prisma.smartEntities.update({
        where: { id: match.entityId },
        data: {
          mention_count: { increment: 1 },
          last_mentioned: new Date()
        }
      });
    }
    
    for (const match of termMatches) {
      await prisma.smartTerms.update({
        where: { id: match.termId },
        data: {
          usage_count: { increment: 1 }
        }
      });
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ تم التحليل بنجاح في ${processingTime}ms - ${entityMatches.length} كيان، ${termMatches.length} مصطلح`);
    
    const response: AnalyzeResponse = {
      entities: entityMatches,
      terms: termMatches,
      totalMatches: entityMatches.length + termMatches.length,
      processingTime,
      // البيانات المتقدمة
      aiSuggestions: aiSuggestions.length > 0 ? aiSuggestions : undefined,
      knowledgeGraph,
      personalization: personalizationData,
      analytics,
      metadata: {
        language: detectedLanguage,
        languageName: SUPPORTED_LANGUAGES[detectedLanguage],
        enabledFeatures: {
          ai: enableAI && process.env.OPENAI_API_KEY ? true : false,
          personalization: personalization && userId ? true : false,
          knowledgeGraph: knowledgeGraph ? true : false,
          analytics: analytics ? true : false
        },
        textStats: {
          originalLength: text.length,
          cleanedLength: cleanedText.length,
          wordsCount: cleanedText.split(/\s+/).length
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ خطأ في تحليل النص:', error);
    return NextResponse.json({
      error: 'حدث خطأ في تحليل النص'
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint للحصول على إحصائيات الكيانات
export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const entityTypesStats = await prisma.entityTypes.findMany({
      include: {
        _count: {
          select: {
            entities: true
          }
        }
      }
    });
    
    const totalEntities = await prisma.smartEntities.count();
    const totalTerms = await prisma.smartTerms.count();
    const totalLinks = await prisma.smartArticleLinks.count();
    
    const topEntities = await prisma.smartEntities.findMany({
      take: 10,
      orderBy: {
        mention_count: 'desc'
      },
      include: {
        entity_type: true
      }
    });
    
    return NextResponse.json({
      statistics: {
        totalEntities,
        totalTerms,
        totalLinks,
        entityTypes: entityTypesStats.map(type => ({
          type: type.name_ar,
          count: type._count.entities,
          icon: type.icon,
          color: type.color
        }))
      },
      topEntities: topEntities.map(entity => ({
        name: entity.name_ar || entity.name,
        mentions: entity.mention_count,
        type: entity.entity_type.name_ar,
        icon: entity.entity_type.icon
      }))
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    return NextResponse.json({
      error: 'حدث خطأ في جلب الإحصائيات'
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
} 