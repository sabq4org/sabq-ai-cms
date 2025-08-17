/**
 * API endpoint لنماذج الذكاء الاصطناعي
 * AI Models API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiModelsService } from '@/lib/modules/ai-models/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const modelId = searchParams.get('id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const templates = searchParams.get('templates');

    // إذا كان المطلوب هو القوالب
    if (templates === 'true') {
      const modelTemplates = aiModelsService.getModelTemplates();
      return NextResponse.json({
        success: true,
        templates: modelTemplates
      });
    }

    // إذا كان هناك معرف محدد، جلب نموذج واحد
    if (modelId) {
      const model = await aiModelsService.getModel(modelId);
      
      if (!model) {
        return NextResponse.json(
          { error: 'النموذج غير موجود' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        model
      });
    }

    // جلب جميع النماذج مع التصفية
    const filters: any = {};
    if (type) filters.type = type;
    if (status) filters.status = status;

    const models = await aiModelsService.getModels(filters);

    return NextResponse.json({
      success: true,
      models,
      total: models.length,
      filters
    });

  } catch (error) {
    console.error('Error in AI models GET endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في جلب النماذج',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, description, config, action } = body;

    // إجراءات مختلفة بناءً على قيمة action
    if (action === 'predict') {
      const { model_id, input_data } = body;
      
      if (!model_id || !input_data) {
        return NextResponse.json(
          { error: 'معرف النموذج وبيانات الإدخال مطلوبة' },
          { status: 400 }
        );
      }

      // TODO: الحصول على معرف المستخدم من الجلسة
      const userId = 'current-user-id';

      const prediction = await aiModelsService.predict(model_id, input_data, userId);

      return NextResponse.json({
        success: true,
        prediction,
        message: 'تم إجراء التنبؤ بنجاح'
      });
    }

    if (action === 'deploy') {
      const { model_id, deployment_config } = body;
      
      if (!model_id) {
        return NextResponse.json(
          { error: 'معرف النموذج مطلوب' },
          { status: 400 }
        );
      }

      await aiModelsService.deployModel(model_id, deployment_config || {});

      return NextResponse.json({
        success: true,
        message: 'تم نشر النموذج بنجاح'
      });
    }

    // إنشاء نموذج جديد (الإجراء الافتراضي)
    if (!name || !type || !config) {
      return NextResponse.json(
        { error: 'الاسم والنوع والتكوين مطلوبة' },
        { status: 400 }
      );
    }

    // TODO: الحصول على معرف المستخدم من الجلسة
    const userId = 'current-user-id';

    const model = await aiModelsService.createModel({
      name,
      type,
      description,
      config,
      created_by: userId
    });

    return NextResponse.json({
      success: true,
      model,
      message: 'تم إنشاء النموذج بنجاح'
    });

  } catch (error) {
    console.error('Error in AI models POST endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في معالجة الطلب',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { model_id, updates } = body;

    if (!model_id) {
      return NextResponse.json(
        { error: 'معرف النموذج مطلوب' },
        { status: 400 }
      );
    }

    const updatedModel = await aiModelsService.updateModel(model_id, updates);

    return NextResponse.json({
      success: true,
      model: updatedModel,
      message: 'تم تحديث النموذج بنجاح'
    });

  } catch (error) {
    console.error('Error in AI models PUT endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في تحديث النموذج',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const modelId = searchParams.get('id');

    if (!modelId) {
      return NextResponse.json(
        { error: 'معرف النموذج مطلوب' },
        { status: 400 }
      );
    }

    await aiModelsService.deleteModel(modelId);

    return NextResponse.json({
      success: true,
      message: 'تم حذف النموذج بنجاح'
    });

  } catch (error) {
    console.error('Error in AI models DELETE endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في حذف النموذج',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
