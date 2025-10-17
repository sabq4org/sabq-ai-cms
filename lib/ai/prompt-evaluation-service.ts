/**
 * 📊 خدمة تقييم البرومبتات التلقائية
 * Sabq AI Prompt Evaluation Service
 * 
 * هذه الخدمة تقوم بتقييم جودة المخرجات المولدة من البرومبتات
 * وفق معايير سبق التحريرية
 * 
 * @version 1.0.0
 * @author فريق سبق الذكية
 */

import OpenAI from 'openai';
import { 
  SABQ_AUTO_EVALUATION_PROMPT,
  SabqPromptEvaluationCriteria 
} from './sabq-prompts-library';

// ========================================
// 📋 الواجهات والأنواع
// ========================================

export interface PromptEvaluationRequest {
  promptType: string;
  originalContent: string;
  generatedOutput: string;
  expectedFormat?: string;
}

export interface PromptEvaluationResult {
  scores: SabqPromptEvaluationCriteria;
  overallScore: number;
  grade: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف';
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  readyForPublish: boolean;
  timestamp: string;
}

export interface BatchEvaluationResult {
  promptType: string;
  totalSamples: number;
  averageScore: number;
  passRate: number; // نسبة المخرجات الجاهزة للنشر
  results: PromptEvaluationResult[];
  summary: {
    avgClarity: number;
    avgFactuality: number;
    avgStyleMatch: number;
    avgCompleteness: number;
    avgRelevance: number;
  };
}

// ========================================
// 🔧 خدمة التقييم
// ========================================

export class PromptEvaluationService {
  private openai: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * تهيئة OpenAI client
   */
  initialize(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * تقييم مخرج واحد
   */
  async evaluateSingle(
    request: PromptEvaluationRequest
  ): Promise<PromptEvaluationResult> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const userPrompt = SABQ_AUTO_EVALUATION_PROMPT.userPromptTemplate(
        request.originalContent,
        request.generatedOutput,
        request.promptType
      );

      const response = await this.openai.chat.completions.create({
        model: SABQ_AUTO_EVALUATION_PROMPT.settings.model,
        messages: [
          {
            role: 'system',
            content: SABQ_AUTO_EVALUATION_PROMPT.systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: SABQ_AUTO_EVALUATION_PROMPT.settings.temperature,
        max_tokens: SABQ_AUTO_EVALUATION_PROMPT.settings.max_tokens,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(
        response.choices[0]?.message?.content || '{}'
      );

      return {
        ...result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('خطأ في تقييم المخرج:', error);
      throw error;
    }
  }

  /**
   * تقييم دفعة من المخرجات
   */
  async evaluateBatch(
    requests: PromptEvaluationRequest[]
  ): Promise<BatchEvaluationResult> {
    const results: PromptEvaluationResult[] = [];

    for (const request of requests) {
      try {
        const result = await this.evaluateSingle(request);
        results.push(result);
      } catch (error) {
        console.error(`فشل تقييم العينة:`, error);
      }
    }

    // حساب الإحصائيات
    const totalSamples = results.length;
    const averageScore =
      results.reduce((sum, r) => sum + r.overallScore, 0) / totalSamples;
    const passRate =
      (results.filter(r => r.readyForPublish).length / totalSamples) * 100;

    const summary = {
      avgClarity:
        results.reduce((sum, r) => sum + r.scores.clarity, 0) / totalSamples,
      avgFactuality:
        results.reduce((sum, r) => sum + r.scores.factuality, 0) / totalSamples,
      avgStyleMatch:
        results.reduce((sum, r) => sum + r.scores.styleMatch, 0) / totalSamples,
      avgCompleteness:
        results.reduce((sum, r) => sum + r.scores.completeness, 0) /
        totalSamples,
      avgRelevance:
        results.reduce((sum, r) => sum + r.scores.relevance, 0) / totalSamples
    };

    return {
      promptType: requests[0]?.promptType || 'unknown',
      totalSamples,
      averageScore,
      passRate,
      results,
      summary
    };
  }

  /**
   * تقييم سريع بدون OpenAI (قواعد أساسية)
   */
  evaluateBasic(
    generatedOutput: string,
    expectedFormat?: string
  ): Partial<PromptEvaluationResult> {
    const scores: Partial<SabqPromptEvaluationCriteria> = {};
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // تقييم الطول
    const length = generatedOutput.length;
    if (length < 50) {
      scores.completeness = 20;
      weaknesses.push('المخرج قصير جداً');
      suggestions.push('زيادة طول المحتوى');
    } else if (length < 200) {
      scores.completeness = 60;
    } else {
      scores.completeness = 90;
    }

    // تقييم الوضوح (بناءً على طول الجمل)
    const sentences = generatedOutput.split(/[.!؟]/);
    const avgSentenceLength =
      generatedOutput.length / Math.max(sentences.length, 1);
    
    if (avgSentenceLength > 200) {
      scores.clarity = 50;
      weaknesses.push('الجمل طويلة جداً');
      suggestions.push('تقسيم الجمل الطويلة');
    } else if (avgSentenceLength > 100) {
      scores.clarity = 70;
    } else {
      scores.clarity = 90;
    }

    // تقييم التنسيق
    if (expectedFormat === 'json') {
      try {
        JSON.parse(generatedOutput);
        scores.completeness = (scores.completeness || 0) + 10;
      } catch {
        scores.completeness = Math.max((scores.completeness || 0) - 20, 0);
        weaknesses.push('تنسيق JSON غير صحيح');
        suggestions.push('التأكد من صحة تنسيق JSON');
      }
    }

    // حساب المتوسط
    const validScores = Object.values(scores).filter(s => s !== undefined);
    const overallScore =
      validScores.reduce((sum, s) => sum + s, 0) / validScores.length;

    return {
      scores: scores as SabqPromptEvaluationCriteria,
      overallScore,
      weaknesses,
      suggestions,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * مقارنة بين برومبتين
   */
  async comparePrompts(
    promptA: PromptEvaluationRequest,
    promptB: PromptEvaluationRequest
  ): Promise<{
    winner: 'A' | 'B' | 'tie';
    scoreA: number;
    scoreB: number;
    difference: number;
    recommendation: string;
  }> {
    const [resultA, resultB] = await Promise.all([
      this.evaluateSingle(promptA),
      this.evaluateSingle(promptB)
    ]);

    const scoreA = resultA.overallScore;
    const scoreB = resultB.overallScore;
    const difference = Math.abs(scoreA - scoreB);

    let winner: 'A' | 'B' | 'tie';
    let recommendation: string;

    if (difference < 5) {
      winner = 'tie';
      recommendation = 'البرومبتان متقاربان في الجودة، يمكن استخدام أيهما';
    } else if (scoreA > scoreB) {
      winner = 'A';
      recommendation = `البرومبت A أفضل بفارق ${difference.toFixed(1)} نقطة`;
    } else {
      winner = 'B';
      recommendation = `البرومبت B أفضل بفارق ${difference.toFixed(1)} نقطة`;
    }

    return {
      winner,
      scoreA,
      scoreB,
      difference,
      recommendation
    };
  }

  /**
   * توليد تقرير تفصيلي
   */
  generateReport(result: BatchEvaluationResult): string {
    const report = `
# 📊 تقرير تقييم البرومبت: ${result.promptType}

## ملخص النتائج
- **إجمالي العينات**: ${result.totalSamples}
- **المتوسط العام**: ${result.averageScore.toFixed(1)}/100
- **نسبة النجاح**: ${result.passRate.toFixed(1)}%

## المعايير التفصيلية
- **الوضوح**: ${result.summary.avgClarity.toFixed(1)}/100
- **الدقة الواقعية**: ${result.summary.avgFactuality.toFixed(1)}/100
- **مطابقة الأسلوب**: ${result.summary.avgStyleMatch.toFixed(1)}/100
- **الاكتمال**: ${result.summary.avgCompleteness.toFixed(1)}/100
- **الصلة**: ${result.summary.avgRelevance.toFixed(1)}/100

## التوزيع حسب التقدير
${this.getGradeDistribution(result.results)}

## نقاط القوة الشائعة
${this.getCommonStrengths(result.results)}

## نقاط الضعف الشائعة
${this.getCommonWeaknesses(result.results)}

## التوصيات
${this.getRecommendations(result)}

---
*تم إنشاء التقرير في: ${new Date().toLocaleString('ar-SA')}*
    `.trim();

    return report;
  }

  /**
   * الحصول على توزيع التقديرات
   */
  private getGradeDistribution(results: PromptEvaluationResult[]): string {
    const grades = {
      'ممتاز': 0,
      'جيد جداً': 0,
      'جيد': 0,
      'مقبول': 0,
      'ضعيف': 0
    };

    results.forEach(r => {
      grades[r.grade] = (grades[r.grade] || 0) + 1;
    });

    return Object.entries(grades)
      .map(([grade, count]) => {
        const percentage = ((count / results.length) * 100).toFixed(1);
        return `- **${grade}**: ${count} (${percentage}%)`;
      })
      .join('\n');
  }

  /**
   * الحصول على نقاط القوة الشائعة
   */
  private getCommonStrengths(results: PromptEvaluationResult[]): string {
    const strengthsMap = new Map<string, number>();

    results.forEach(r => {
      r.strengths.forEach(s => {
        strengthsMap.set(s, (strengthsMap.get(s) || 0) + 1);
      });
    });

    const topStrengths = Array.from(strengthsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topStrengths.length === 0) {
      return '- لا توجد نقاط قوة شائعة';
    }

    return topStrengths
      .map(([strength, count]) => `- ${strength} (${count} مرة)`)
      .join('\n');
  }

  /**
   * الحصول على نقاط الضعف الشائعة
   */
  private getCommonWeaknesses(results: PromptEvaluationResult[]): string {
    const weaknessesMap = new Map<string, number>();

    results.forEach(r => {
      r.weaknesses.forEach(w => {
        weaknessesMap.set(w, (weaknessesMap.get(w) || 0) + 1);
      });
    });

    const topWeaknesses = Array.from(weaknessesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topWeaknesses.length === 0) {
      return '- لا توجد نقاط ضعف شائعة';
    }

    return topWeaknesses
      .map(([weakness, count]) => `- ${weakness} (${count} مرة)`)
      .join('\n');
  }

  /**
   * الحصول على التوصيات
   */
  private getRecommendations(result: BatchEvaluationResult): string {
    const recommendations: string[] = [];

    // توصيات بناءً على المتوسط العام
    if (result.averageScore >= 90) {
      recommendations.push('✅ البرومبت ممتاز ويمكن استخدامه في الإنتاج');
    } else if (result.averageScore >= 75) {
      recommendations.push('⚠️ البرومبت جيد لكن يحتاج تحسينات طفيفة');
    } else if (result.averageScore >= 60) {
      recommendations.push('⚠️ البرومبت يحتاج تحسينات متوسطة');
    } else {
      recommendations.push('❌ البرومبت يحتاج مراجعة شاملة');
    }

    // توصيات بناءً على المعايير الفردية
    if (result.summary.avgClarity < 70) {
      recommendations.push('- تحسين وضوح التعليمات في البرومبت');
    }
    if (result.summary.avgFactuality < 70) {
      recommendations.push('- إضافة تعليمات للالتزام بالحقائق');
    }
    if (result.summary.avgStyleMatch < 70) {
      recommendations.push('- تعزيز معايير أسلوب سبق في البرومبت');
    }
    if (result.summary.avgCompleteness < 70) {
      recommendations.push('- توضيح المخرجات المطلوبة بشكل أدق');
    }
    if (result.summary.avgRelevance < 70) {
      recommendations.push('- تحسين التركيز على الموضوع المطلوب');
    }

    // توصيات بناءً على نسبة النجاح
    if (result.passRate < 50) {
      recommendations.push('- نسبة النجاح منخفضة، يُنصح بإعادة صياغة البرومبت');
    }

    return recommendations.join('\n');
  }
}

// ========================================
// 🧪 دوال مساعدة للاختبار
// ========================================

/**
 * اختبار سريع لبرومبت
 */
export async function quickTestPrompt(
  apiKey: string,
  promptType: string,
  testSamples: Array<{ input: string; expectedOutput?: string }>
): Promise<BatchEvaluationResult> {
  const service = new PromptEvaluationService(apiKey);

  const requests: PromptEvaluationRequest[] = testSamples.map(sample => ({
    promptType,
    originalContent: sample.input,
    generatedOutput: sample.expectedOutput || '',
    expectedFormat: 'json'
  }));

  return await service.evaluateBatch(requests);
}

/**
 * مقارنة برومبتين على نفس العينات
 */
export async function comparePromptVersions(
  apiKey: string,
  promptTypeA: string,
  promptTypeB: string,
  testSamples: Array<{ input: string; outputA: string; outputB: string }>
): Promise<{
  winner: 'A' | 'B' | 'tie';
  resultA: BatchEvaluationResult;
  resultB: BatchEvaluationResult;
  comparison: string;
}> {
  const service = new PromptEvaluationService(apiKey);

  const requestsA: PromptEvaluationRequest[] = testSamples.map(sample => ({
    promptType: promptTypeA,
    originalContent: sample.input,
    generatedOutput: sample.outputA
  }));

  const requestsB: PromptEvaluationRequest[] = testSamples.map(sample => ({
    promptType: promptTypeB,
    originalContent: sample.input,
    generatedOutput: sample.outputB
  }));

  const [resultA, resultB] = await Promise.all([
    service.evaluateBatch(requestsA),
    service.evaluateBatch(requestsB)
  ]);

  const scoreA = resultA.averageScore;
  const scoreB = resultB.averageScore;
  const difference = Math.abs(scoreA - scoreB);

  let winner: 'A' | 'B' | 'tie';
  let comparison: string;

  if (difference < 5) {
    winner = 'tie';
    comparison = `البرومبتان متقاربان (فارق ${difference.toFixed(1)} نقطة)`;
  } else if (scoreA > scoreB) {
    winner = 'A';
    comparison = `البرومبت A أفضل بفارق ${difference.toFixed(1)} نقطة (${scoreA.toFixed(1)} مقابل ${scoreB.toFixed(1)})`;
  } else {
    winner = 'B';
    comparison = `البرومبت B أفضل بفارق ${difference.toFixed(1)} نقطة (${scoreB.toFixed(1)} مقابل ${scoreA.toFixed(1)})`;
  }

  return {
    winner,
    resultA,
    resultB,
    comparison
  };
}

export default PromptEvaluationService;

