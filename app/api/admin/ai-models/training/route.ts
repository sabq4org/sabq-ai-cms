/**
 * API endpoint لتدريب النماذج
 * Model Training API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiModelsService } from '@/lib/modules/ai-models/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const modelId = searchParams.get('model_id');

    const trainingJobs = await aiModelsService.getTrainingJobs(modelId || undefined);

    return NextResponse.json({
      success: true,
      training_jobs: trainingJobs,
      total: trainingJobs.length
    });

  } catch (error) {
    console.error('Error in training GET endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في جلب مهام التدريب',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      model_id, 
      config, 
      priority = 'normal',
      notification_settings = {} 
    } = body;

    if (!model_id || !config) {
      return NextResponse.json(
        { error: 'معرف النموذج وإعدادات التدريب مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة إعدادات التدريب
    const requiredFields = ['dataset_path', 'batch_size', 'epochs', 'learning_rate'];
    for (const field of requiredFields) {
      if (!(field in config)) {
        return NextResponse.json(
          { error: `الحقل ${field} مطلوب في إعدادات التدريب` },
          { status: 400 }
        );
      }
    }

    const trainingRequest = {
      model_id,
      config,
      priority,
      estimated_duration: config.epochs * 60, // تقدير بالثواني
      required_resources: {
        cpu_cores: 2,
        memory_gb: 4,
        gpu_required: config.hardware?.use_gpu || false,
        storage_gb: 10
      },
      notification_settings
    };

    const trainingJob = await aiModelsService.startTraining(trainingRequest);

    return NextResponse.json({
      success: true,
      training_job: trainingJob,
      message: 'تم بدء التدريب بنجاح'
    });

  } catch (error) {
    console.error('Error in training POST endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في بدء التدريب',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job_id');

    if (!jobId) {
      return NextResponse.json(
        { error: 'معرف مهمة التدريب مطلوب' },
        { status: 400 }
      );
    }

    await aiModelsService.stopTraining(jobId);

    return NextResponse.json({
      success: true,
      message: 'تم إيقاف التدريب بنجاح'
    });

  } catch (error) {
    console.error('Error in training DELETE endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في إيقاف التدريب',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
