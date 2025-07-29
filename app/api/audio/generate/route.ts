import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// معرفات الأصوات المتاحة في ElevenLabs - 16 صوت محسن
const VOICE_IDS = {
  // أصوات رجالية عربية ومتنوعة
  'pNInz6obpgDQGcFmaJgB': 'pNInz6obpgDQGcFmaJgB', // Adam
  'TxGEqnHWrfWFTfGW9XjX': 'TxGEqnHWrfWFTfGW9XjX', // Josh
  'ErXwobaYiN019PkySvjV': 'ErXwobaYiN019PkySvjV', // Antoni
  'VR6AewLTigWG4xSOukaG': 'VR6AewLTigWG4xSOukaG', // Arnold
  'n8TWbmNgNErEQxqTvzVq': 'n8TWbmNgNErEQxqTvzVq', // Clyde
  'yoZ06aMxZJJ28mfd3POQ': 'yoZ06aMxZJJ28mfd3POQ', // Sam
  'bVMeCyTHy58xNoL34h3p': 'bVMeCyTHy58xNoL34h3p', // Custom Arabic male
  '29vD33N1CtxCmqQRPOHJ': '29vD33N1CtxCmqQRPOHJ', // Custom Arabic news male
  
  // أصوات نسائية عربية ومتنوعة
  '21m00Tcm4TlvDq8ikWAM': '21m00Tcm4TlvDq8ikWAM', // Rachel
  'AZnzlk1XvdvUeBnXmlld': 'AZnzlk1XvdvUeBnXmlld', // Domi
  'EXAVITQu4vr4xnSDxMaL': 'EXAVITQu4vr4xnSDxMaL', // Bella/Sarah
  'MF3mGyEYCl7XYWbV9V6O': 'MF3mGyEYCl7XYWbV9V6O', // Elli
  'piTKgcLEGmPE4e6mEKli': 'piTKgcLEGmPE4e6mEKli', // Nicole
  'ThT5KcBeYPX3keUQqHPh': 'ThT5KcBeYPX3keUQqHPh', // Custom Arabic female
  'XB0fDUnXU5powFXDhCwa': 'XB0fDUnXU5powFXDhCwa', // Charlotte - متاح بالفعل
  'pqHfZKP75CvOlQylNhV4': 'pqHfZKP75CvOlQylNhV4', // Custom Arabic modern female
  
  // التوافق مع الأصوات القديمة
  bradford: 'pNInz6obpgDQGcFmaJgB', // Adam كصوت افتراضي
  rachel: '21m00Tcm4TlvDq8ikWAM', // Rachel
  arabic_male: 'JBFqnCBsd6RMkjVDRZzb', // George - صوت رجالي بريطاني ناضج
  arabic_female: 'EXAVITQu4vr4xnSDxMaL', // Sarah - صوت نسائي احترافي
} as const;

export async function POST(req: NextRequest) {
  let body: any = {};
  let voice = 'bradford';
  let filename = 'daily-news'; 
  let language = 'arabic';
  let selectedVoiceId = '';
  let apiKey: string | undefined = '';
  let optimizedText = '';
  
  try {
    console.log('🎙️ بدء توليد الصوت...');
    
    // قراءة البيانات وتسجيلها
    try {
      body = await req.json();
      console.log('📥 البيانات المستلمة:', JSON.stringify(body, null, 2));
    } catch (jsonError) {
      console.error('❌ خطأ في قراءة JSON:', jsonError);
      return NextResponse.json({ 
        error: 'Invalid JSON data',
        details: 'البيانات المرسلة ليست بتنسيق JSON صحيح' 
      }, { status: 400 });
    }
    
    const { summary, voice_settings, tags } = body;
    
    // تعيين القيم من body مع القيم الافتراضية
    voice = body.voice || 'bradford';
    filename = body.filename || 'daily-news';
    language = body.language || 'arabic';
    
    console.log('🔍 معاملات الطلب:', {
      hasVoice: !!body.voice,
      voice: voice,
      hasSummary: !!summary,
      summaryLength: summary?.length,
      hasTitle: !!body.title,
      title: body.title
    });
    
    // إعدادات الصوت المخصصة
    const customVoiceSettings = voice_settings || {
      stability: language === 'arabic' ? 0.6 : 0.4,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true
    };

    // التحقق من صحة البيانات
    if (!summary || typeof summary !== 'string') {
      console.error('❌ النص مفقود أو غير صالح');
      return NextResponse.json({ 
        error: 'Missing or invalid summary',
        details: 'يجب توفير نص الملخص' 
      }, { status: 400 });
    }

    if (summary.length < 10) {
      console.error('❌ النص قصير جداً:', summary.length);
      return NextResponse.json({ 
        error: 'Summary too short',
        details: 'النص قصير جداً، يجب أن يكون 10 أحرف على الأقل' 
      }, { status: 400 });
    }

    // البحث عن معرف الصوت
    selectedVoiceId = VOICE_IDS[voice as keyof typeof VOICE_IDS];
    
    // إذا كانت القيمة نص وليست معرف، نبحث عنها
    if (!selectedVoiceId && voice.length === 24) {
      // إذا كان معرف صوت مباشر
      selectedVoiceId = voice;
      console.log(`📌 استخدام معرف الصوت المباشر: ${selectedVoiceId}`);
    } else if (!selectedVoiceId) {
      selectedVoiceId = 'pNInz6obpgDQGcFmaJgB'; // آدم - صوت رجالي شاب
      console.log(`⚠️ الصوت "${voice}" غير موجود. استخدام الصوت الافتراضي: آدم`);
    }

    console.log('✅ معرف الصوت النهائي:', selectedVoiceId);
    
    // التحقق من مفتاح ElevenLabs
    apiKey = process.env.ELEVENLABS_API_KEY;
    
    // إذا لم يكن هناك مفتاح أو كان المفتاح تجريبي، استخدم الوضع التجريبي
    if (!apiKey) {
      console.log('⚠️ لا يوجد مفتاح API - استخدام الوضع التجريبي');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const demoFilename = `demo-${filename}-${timestamp}.mp3`;
      
      return NextResponse.json({
        success: true,
        demo_mode: true,
        url: `/audio/demo-sample.mp3`, // ملف تجريبي موجود
        filename: demoFilename,
        size: 125849, // حجم تقريبي
        duration_estimate: `${Math.ceil(summary.length / 150)} دقيقة`,
        voice_used: voice,
        voice_id: selectedVoiceId,
        text_length: summary.length,
        message: '⚠️ وضع تجريبي - يتطلب مفتاح ElevenLabs للتوليد الفعلي',
        demo_note: 'هذا ملف صوتي تجريبي. لتوليد صوت حقيقي، أضف ELEVENLABS_API_KEY',
        tags: tags || []
      });
    }
    
    console.log(`🔊 استخدام الصوت: ${voice} (${selectedVoiceId})`);
    console.log('⚙️ إعدادات الصوت:', customVoiceSettings);
    
    // تحسين النص للقراءة الصوتية
    const enhancedText = summary
      .replace(/<[^>]*>/g, '') // إزالة HTML tags
      .replace(/\./g, '. ') // تحسين التوقف
      .replace(/،/g, '، ')
      .replace(/؛/g, '؛ ')
      .trim()
      .substring(0, 2500); // حد أقصى 2500 حرف
    console.log('📝 النص المُحسَّن:', enhancedText.substring(0, 100) + '...');
    
    // محاولة الاتصال بـ ElevenLabs
    try {
      console.log('📤 إرسال طلب إلى ElevenLabs API...');
      console.log('🔗 URL:', `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`);
      console.log('📝 طول النص:', enhancedText.length);
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
        {
          text: enhancedText,
          model_id: 'eleven_multilingual_v2', // النموذج المحسن للعربية
          voice_settings: customVoiceSettings
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer',
          timeout: 30000, // مهلة 30 ثانية
          validateStatus: function (status) {
            // نسمح بمعالجة جميع الأخطاء يدوياً
            return true;
          }
        }
      );

      console.log(`📡 استجابة ElevenLabs: ${response.status}`);
      
      if (response.status !== 200) {
        // معالجة الأخطاء المختلفة
        let errorData: any = {};
        
        try {
          // محاولة قراءة رسالة الخطأ
          const errorText = Buffer.from(response.data).toString('utf-8');
          errorData = JSON.parse(errorText);
          console.error('❌ خطأ من ElevenLabs:', errorData);
        } catch (e) {
          console.error('❌ خطأ غير قابل للقراءة:', response.status);
        }
        
        // معالجة مخصصة لكل نوع خطأ
        if (response.status === 400) {
          return NextResponse.json({
            success: false,
            error: 'خطأ في البيانات المرسلة إلى ElevenLabs',
            details: errorData.detail?.message || errorData.error || 'البيانات المرسلة غير صحيحة',
            voice_id_used: selectedVoiceId,
            text_length: enhancedText.length
          }, { status: 200 });
        } else if (response.status === 401) {
          return NextResponse.json({
            success: false,
            error: 'مفتاح API غير صالح',
            details: 'تحقق من صحة مفتاح ElevenLabs في .env.local',
            troubleshooting: [
              'تأكد من وجود: ELEVENLABS_API_KEY=sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c',
              'أعد تشغيل الخادم بعد تحديث المفتاح'
            ]
          }, { status: 200 });
        } else if (response.status === 404) {
          return NextResponse.json({
            success: false,
            error: 'الصوت غير موجود',
            details: `معرف الصوت "${selectedVoiceId}" غير صالح`,
            available_voices: Object.keys(VOICE_IDS).slice(0, 5)
          }, { status: 200 });
        } else if (response.status === 429) {
          return NextResponse.json({
            success: false,
            error: 'تجاوزت حد الاستخدام',
            details: 'انتظر قليلاً قبل المحاولة مرة أخرى',
            retry_after: errorData.detail?.retry_after || '60 ثانية'
          }, { status: 200 });
        } else {
          throw new Error(`Unexpected status: ${response.status}`);
        }
      }

      console.log(`✅ تم توليد الصوت بنجاح، الحجم: ${response.data.byteLength} بايت`);

      // تحديد استراتيجية الحفظ بناءً على البيئة
      let publicUrl: string;
      let filename_with_timestamp: string;

      // إنشاء اسم الملف مع الطابع الزمني
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename_with_timestamp = `${filename}-${timestamp}.mp3`;

      if (process.env.NODE_ENV === 'production') {
        // في بيئة الإنتاج، استخدم Cloudinary أو Base64
        console.log('🌐 بيئة الإنتاج - استخدام Cloudinary...');
        
        try {
          // محاولة رفع إلى Cloudinary
          const cloudinary = require('cloudinary').v2;
          
          cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb',
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          // رفع الملف الصوتي إلى Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: "auto",
                folder: "sabq-audio",
                public_id: filename_with_timestamp.replace('.mp3', ''),
                format: "mp3",
                tags: tags || []
              },
              (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(Buffer.from(response.data));
          });

          publicUrl = (uploadResult as any).secure_url;
          console.log(`✅ تم رفع الملف إلى Cloudinary: ${publicUrl}`);
          
        } catch (cloudinaryError) {
          console.error('⚠️ فشل الرفع إلى Cloudinary:', cloudinaryError);
          // استخدام Base64 كبديل
          publicUrl = `data:audio/mpeg;base64,${Buffer.from(response.data).toString('base64')}`;
          console.log('📄 استخدام Base64 كبديل');
        }
        
      } else {
        // في بيئة التطوير، حفظ محلي كما هو
        console.log('💻 بيئة التطوير - حفظ محلي...');
        
        const outputPath = path.join(process.cwd(), 'public', 'audio');
        if (!fs.existsSync(outputPath)) {
          fs.mkdirSync(outputPath, { recursive: true });
          console.log('📁 تم إنشاء مجلد الصوت');
        }

        const outputFile = path.join(outputPath, filename_with_timestamp);
        fs.writeFileSync(outputFile, response.data);
        publicUrl = `/audio/${filename_with_timestamp}`;
        console.log(`💾 تم حفظ الملف محلياً: ${outputFile}`);
      }

      // حفظ النشرة في الأرشيف
      try {
        const newsletter = await prisma.audio_newsletters.create({
          data: {
            id: uuidv4(),
            title: body.title || `نشرة صوتية - ${new Date().toLocaleDateString('ar')}`,
            content: enhancedText,
            audioUrl: publicUrl,
            duration: Math.ceil(enhancedText.length / 15), // تقدير الوقت بالثواني
            voice_id: selectedVoiceId,
            voice_name: body.voice_name || voice || 'صوت افتراضي',
            language: language || 'ar',
            category: 'عام',
            is_published: false,
            is_featured: false,
            is_main_page: false, // مبدئياً غير موجودة في الصفحة الرئيسية
            play_count: 0
          }
        });
        
        console.log('✅ تم حفظ النشرة في الأرشيف:', newsletter.id);
      } catch (archiveError: any) {
        console.error('⚠️ خطأ في حفظ الأرشيف:', archiveError);
        // لا نوقف العملية إذا فشل حفظ الأرشيف
      }

      // إرجاع معلومات مفصلة
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: filename_with_timestamp,
        size: response.data.byteLength,
        duration_estimate: Math.ceil(enhancedText.length / 15) + ' ثانية', // تقدير: 15 حرف/ثانية
        voice_used: voice,
        voice_id: selectedVoiceId,
        text_length: enhancedText.length,
        message: 'تم توليد النشرة الصوتية بنجاح',
        voice_settings: customVoiceSettings,
        tags: tags || []
      });

    } catch (error: any) {
      console.error('❌ خطأ في توليد الصوت:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        errno: error.errno
      });
      
      // معالجة أخطاء ElevenLabs المحددة
      if (error.code === 'ERR_BAD_REQUEST' || error.response?.status === 400) {
        // إذا كان الخطأ بسبب البيانات، نعرض رسالة واضحة
        const errorData = error.response?.data || {};
        return NextResponse.json({
          success: false,
          error: 'خطأ في البيانات المرسلة',
          details: errorData.detail?.message || errorData.error || 'تحقق من صحة البيانات',
          validation_errors: errorData.detail?.validation_errors || []
        }, { status: 400 });
      }
      
      if (error.response?.status === 404 && error.response?.data?.detail?.status === 'voice_not_found') {
        // محاولة استخدام صوت احتياطي
        console.log('⚠️ الصوت المطلوب غير موجود، محاولة استخدام صوت احتياطي...');
        
        try {
          // استخدام صوت آدم كصوت احتياطي
          const fallbackVoiceId = 'pNInz6obpgDQGcFmaJgB'; // آدم - صوت افتراضي موثوق
          console.log(`🔄 استخدام الصوت الاحتياطي: آدم (${fallbackVoiceId})`);
          
          const fallbackResponse = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${fallbackVoiceId}`,
            {
              text: enhancedText,
              model_id: 'eleven_multilingual_v2',
              voice_settings: customVoiceSettings
            },
            {
              headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg'
              },
              responseType: 'arraybuffer',
              timeout: 30000
            }
          );
          
          console.log(`✅ تم توليد الصوت بالصوت الاحتياطي، الحجم: ${fallbackResponse.data.byteLength} بايت`);
          
          // حفظ الملف الصوتي
          const outputPath = path.join(process.cwd(), 'public', 'audio');
          if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
          }
          
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const outputFile = path.join(outputPath, `${filename}-${timestamp}.mp3`);
          const publicUrl = `/audio/${filename}-${timestamp}.mp3`;
          
          fs.writeFileSync(outputFile, fallbackResponse.data);
          console.log(`💾 تم حفظ الملف بالصوت الاحتياطي: ${outputFile}`);
          
          return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: outputFile.split('/').pop() || 'output.mp3',
            size: fallbackResponse.data.byteLength,
            duration_estimate: Math.round(enhancedText.length / 3) + ' ثانية',
            voice_used: `${voice} (استُخدم Adam كبديل)`,
            voice_id: fallbackVoiceId,
            text_length: enhancedText.length,
            message: '✅ تم توليد الصوت بنجاح باستخدام صوت احتياطي',
            warning: 'الصوت المطلوب غير متاح، تم استخدام صوت احتياطي',
            voice_settings: customVoiceSettings,
            tags: tags || []
          });
          
        } catch (fallbackError: any) {
          console.error('❌ فشل حتى مع الصوت الاحتياطي:', fallbackError.message);
        }
      }
      
      let errorMessage = 'حدث خطأ في توليد الصوت';
      let errorDetails = error.message;
      let troubleshootingSteps: string[] = [];
      
      if (error.response?.status === 401) {
        errorMessage = 'مفتاح API غير صالح أو منتهي الصلاحية';
        errorDetails = 'يرجى التحقق من صحة مفتاح ElevenLabs وأنه نشط';
        troubleshootingSteps = [
          'تأكد من صحة المفتاح: sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c',
          'تحقق من أن المفتاح نشط في حسابك على ElevenLabs',
          'تأكد من وجود رصيد كافٍ في حسابك',
          'أعد تشغيل الخادم بعد تحديث المفتاح'
        ];
      } else if (error.response?.status === 403) {
        errorMessage = 'الوصول مرفوض - تحقق من صلاحيات المفتاح';
        errorDetails = 'المفتاح لا يملك الصلاحيات المطلوبة';
        troubleshootingSteps = [
          'افتح https://elevenlabs.io',
          'اذهب إلى Profile → API Keys',
          'تأكد من تفعيل جميع الصلاحيات للمفتاح'
        ];
      } else if (error.response?.status === 404) {
        errorMessage = 'الصوت المطلوب غير موجود';
        errorDetails = `معرف الصوت "${selectedVoiceId}" غير صالح أو تم حذفه`;
      } else if (error.response?.status === 429) {
        errorMessage = 'تجاوزت حد الاستخدام المسموح';
        errorDetails = 'لقد تجاوزت الحد المسموح من الطلبات أو الأحرف. حاول لاحقاً.';
      } else if (error.response?.status === 422) {
        errorMessage = 'النص غير صالح للمعالجة';
        errorDetails = 'النص المرسل يحتوي على محتوى غير مقبول أو تنسيق خاطئ';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة الطلب';
        errorDetails = 'استغرق توليد الصوت وقتاً طويلاً جداً - حاول مع نص أقصر';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'فشل الاتصال بخدمة ElevenLabs';
        errorDetails = 'تحقق من اتصال الإنترنت أو أن الخدمة غير محجوبة';
        troubleshootingSteps = [
          'تأكد من اتصال الإنترنت',
          'تحقق من عدم وجود جدار حماية يحجب الاتصال',
          'جرب استخدام VPN إذا كانت الخدمة محجوبة في منطقتك'
        ];
      }

      console.log('📋 تفاصيل الخطأ النهائية:', {
        errorMessage,
        errorDetails,
        statusCode: error.response?.status,
        troubleshootingSteps
      });

      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        statusCode: error.response?.status,
        troubleshooting: troubleshootingSteps.length > 0 ? {
          steps: troubleshootingSteps,
          support: 'للمساعدة، تواصل مع الدعم الفني'
        } : undefined
      }, { status: 200 }); // نرجع 200 لتجنب أخطاء CORS
    }
  } catch (error: any) {
    console.error('❌ خطأ عام في POST:', error.message);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ غير متوقع عند محاولة توليد الصوت',
      details: error.message,
      troubleshooting: {
        step1: 'تأكد من أن النص غير فارغ',
        step2: 'تأكد من أن مفتاح ElevenLabs موجود وصالح',
        step3: 'تأكد من وجود اتصال إنترنت مستقر'
      }
    }, { status: 500 });
  }
}

// GET endpoint لاختبار حالة الخدمة
export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    return NextResponse.json({
      status: 'operational',
      message: 'خدمة توليد الصوت تعمل بشكل طبيعي',
      api_key_configured: !!apiKey,
      available_voices: Object.keys(VOICE_IDS),
      voice_details: VOICE_IDS,
      endpoints: {
        generate: 'POST /api/audio/generate',
        test: 'GET /api/audio/generate'
      },
      usage_example: {
        method: 'POST',
        body: {
          summary: 'نص الملخص المراد تحويله لصوت',
          voice: 'bradford', // اختياري
          filename: 'daily-news', // اختياري  
          language: 'arabic' // اختياري
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'خطأ في خدمة توليد الصوت',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 