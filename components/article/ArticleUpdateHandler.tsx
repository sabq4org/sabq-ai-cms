'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface UpdateOptions {
  skipValidation?: boolean;
  allowPartialUpdate?: boolean;
  debugMode?: boolean;
}

/**
 * معالج محسّن لتحديث المقالات
 * يوفر معالجة أفضل للأخطاء وتسجيل تفصيلي
 */
export class ArticleUpdateHandler {
  private static instance: ArticleUpdateHandler;
  private debugMode: boolean = false;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ArticleUpdateHandler();
    }
    return this.instance;
  }

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
    if (enabled) {
      console.log('🐛 وضع التصحيح مفعّل لمعالج تحديث المقالات');
    }
  }

  /**
   * تحديث مقال مع معالجة محسّنة للأخطاء
   */
  async updateArticle(
    articleId: string, 
    data: any, 
    options: UpdateOptions = {}
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const { skipValidation = false, allowPartialUpdate = true, debugMode = this.debugMode } = options;

    try {
      // 1. التسجيل التفصيلي
      if (debugMode) {
        console.group('📝 تحديث المقال');
        console.log('🆔 معرف المقال:', articleId);
        console.log('📤 البيانات المرسلة:', data);
        console.log('⚙️ الخيارات:', options);
        console.time('⏱️ وقت التحديث');
      }

      // 2. التحقق الأساسي
      if (!articleId) {
        throw new Error('معرف المقال مطلوب');
      }

      // 3. تنظيف البيانات
      const cleanedData = this.cleanUpdateData(data, allowPartialUpdate);
      
      if (debugMode) {
        console.log('🧹 البيانات بعد التنظيف:', cleanedData);
      }

      // 4. التحقق من الصلاحية (اختياري)
      if (!skipValidation) {
        const validationErrors = this.validateUpdateData(cleanedData);
        if (validationErrors.length > 0) {
          if (debugMode) {
            console.warn('⚠️ أخطاء التحقق:', validationErrors);
          }
          
          // السماح بالمتابعة مع تحذير
          const continueUpdate = window.confirm(
            'هناك بعض المشاكل في البيانات:\n\n' + 
            validationErrors.join('\n') + 
            '\n\nهل تريد المتابعة على أي حال؟'
          );
          
          if (!continueUpdate) {
            throw new Error('تم إلغاء التحديث من قبل المستخدم');
          }
        }
      }

      // 5. إرسال الطلب
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Debug-Mode': debugMode ? 'true' : 'false'
        },
        body: JSON.stringify(cleanedData)
      });

      const result = await response.json();

      if (debugMode) {
        console.log('📥 الاستجابة:', {
          status: response.status,
          ok: response.ok,
          data: result
        });
        console.timeEnd('⏱️ وقت التحديث');
      }

      // 6. معالجة النتيجة
      if (response.ok) {
        if (debugMode) {
          console.log('✅ تم التحديث بنجاح');
          console.groupEnd();
        }
        
        return {
          success: true,
          data: result.article || result
        };
      } else {
        throw new Error(result.error || `خطأ في التحديث: ${response.status}`);
      }

    } catch (error: any) {
      if (debugMode) {
        console.error('❌ خطأ في التحديث:', error);
        console.groupEnd();
      }

      return {
        success: false,
        error: error.message || 'حدث خطأ غير متوقع'
      };
    }
  }

  /**
   * تنظيف بيانات التحديث
   */
  private cleanUpdateData(data: any, allowPartial: boolean): any {
    const cleaned: any = {};

    // معالجة الحقول الخاصة
    if ('featuredImage' in data || 'featured_image' in data) {
      const image = data.featuredImage || data.featured_image;
      cleaned.featured_image = image === '' ? null : image;
    }

    if ('isFeatured' in data || 'is_featured' in data || 'featured' in data) {
      cleaned.is_featured = Boolean(data.isFeatured || data.is_featured || data.featured);
    }

    if ('isBreaking' in data || 'is_breaking' in data || 'breaking' in data) {
      cleaned.is_breaking = Boolean(data.isBreaking || data.is_breaking || data.breaking);
    }

    // نسخ باقي الحقول
    const fieldsMap = {
      title: 'title',
      content: 'content',
      excerpt: 'summary',
      summary: 'summary',
      authorId: 'author_id',
      author_id: 'author_id',
      categoryId: 'category_id',
      category_id: 'category_id',
      keywords: 'keywords',
      seoTitle: 'seo_title',
      seo_title: 'seo_title',
      seoDescription: 'seo_description',
      seo_description: 'seo_description',
      status: 'status',
      scheduledFor: 'scheduled_for',
      scheduled_for: 'scheduled_for'
    };

    Object.entries(fieldsMap).forEach(([from, to]) => {
      if (from in data && (allowPartial || data[from] !== undefined)) {
        cleaned[to] = data[from];
      }
    });

    // إزالة الحقول الفارغة إذا لزم الأمر
    if (!allowPartial) {
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === undefined || cleaned[key] === '') {
          delete cleaned[key];
        }
      });
    }

    return cleaned;
  }

  /**
   * التحقق من صحة البيانات
   */
  private validateUpdateData(data: any): string[] {
    const errors: string[] = [];

    // التحقق من الحقول المطلوبة للنشر
    if (data.status === 'published') {
      if (!data.title?.trim()) {
        errors.push('العنوان مطلوب للنشر');
      }
      if (!data.summary?.trim() && !data.excerpt?.trim()) {
        errors.push('الموجز مطلوب للنشر');
      }
      if (!data.content?.trim()) {
        errors.push('المحتوى مطلوب للنشر');
      }
    }

    return errors;
  }

  /**
   * دالة مساعدة لاختبار التحديث
   */
  async testUpdate(articleId: string): Promise<void> {
    console.log('🧪 بدء اختبار التحديث...');
    
    const testCases = [
      {
        name: 'إزالة التمييز',
        data: { is_featured: false }
      },
      {
        name: 'إزالة الصورة',
        data: { featured_image: null }
      },
      {
        name: 'تحديث العنوان',
        data: { title: 'عنوان اختباري محدث' }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔸 اختبار: ${testCase.name}`);
      const result = await this.updateArticle(articleId, testCase.data, {
        debugMode: true,
        skipValidation: true
      });
      
      if (result.success) {
        console.log('✅ نجح الاختبار');
      } else {
        console.log('❌ فشل الاختبار:', result.error);
      }
    }
  }
}

// تصدير instance افتراضي
export const articleUpdateHandler = ArticleUpdateHandler.getInstance();

// دالة مساعدة للاستخدام المباشر
export async function updateArticleWithDebug(
  articleId: string, 
  data: any
): Promise<boolean> {
  const handler = ArticleUpdateHandler.getInstance();
  handler.setDebugMode(true);
  
  const result = await handler.updateArticle(articleId, data);
  
  if (result.success) {
    toast.success('تم تحديث المقال بنجاح');
    return true;
  } else {
    toast.error(result.error || 'فشل تحديث المقال');
    return false;
  }
}