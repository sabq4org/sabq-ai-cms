import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

interface AnalyzeRequest {
  text: string;
  articleId?: string;
  context?: string;
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
    const { text, articleId, context } = body;
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        error: 'النص مطلوب للتحليل'
      }, { status: 400 });
    }
    
    const cleanedText = cleanText(text);
    
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
    
    // البحث عن المطابقات
    const entityMatches = findEntityMatches(cleanedText, entities);
    const termMatches = findTermMatches(cleanedText, terms);
    
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
    
    const response: AnalyzeResponse = {
      entities: entityMatches,
      terms: termMatches,
      totalMatches: entityMatches.length + termMatches.length,
      processingTime
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