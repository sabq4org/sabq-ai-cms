import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// معرفات الأصوات المتاحة في ElevenLabs
const VOICE_IDS = {
  // الأصوات الإنجليزية الافتراضية المتاحة مجانًا
  rachel: '21m00Tcm4TlvDq8ikWAM', // Rachel - نسائي واضح
  domi: 'AZnzlk1XvdvUeBnXmlld', // Domi - نسائي نشيط
  bella: 'EXAVITQu4vr4xnSDxMaL', // Bella - نسائي ناعم
  antoni: 'ErXwobaYiN019PkySvjV', // Antoni - رجالي ودود
  elli: 'MF3mGyEYCl7XYWbV9V6O', // Elli - نسائي شاب
  josh: 'TxGEqnHWrfWFTfGW9XjX', // Josh - رجالي عميق
  arnold: 'VR6AewLTigWG4xSOukaG', // Arnold - رجالي قوي
  adam: 'pNInz6obpgDQGcFmaJgB', // Adam - رجالي شاب
  sam: 'yoZ06aMxZJJ28mfd3POQ', // Sam - محايد
  
  // أصوات أخرى قد تكون متاحة
  clyde: 'n8TWbmNgNErEQxqTvzVq', // Clyde - رجالي حماسي
  nicole: 'piTKgcLEGmPE4e6mEKli', // Nicole - نسائي محترف
  
  // الأصوات العربية (استخدم الأصوات الإنجليزية مؤقتًا)
  arabic_male: 'TxGEqnHWrfWFTfGW9XjX', // Josh كبديل مؤقت للصوت العربي الرجالي
  arabic_female: '21m00Tcm4TlvDq8ikWAM', // Rachel كبديل مؤقت للصوت العربي النسائي
  bradford: 'pNInz6obpgDQGcFmaJgB', // Adam كصوت افتراضي
} as const;

export async function POST(req: NextRequest) {
  // نقل تعريف المتغيرات خارج try لتكون متاحة في catch
  let body: any;
  let optimizedText: string = '';
  let selectedVoiceId: string = '';
  let apiKey: string | undefined;
  let voice: string = 'bradford';
  let filename: string = 'daily-news';
  let language: string = 'arabic';
  
  try {
    console.log('🎙️ بدء توليد الصوت...');
    
    body = await req.json();
    const { summary } = body;
    
    // تعيين القيم من body مع القيم الافتراضية
    voice = body.voice || 'bradford';
    filename = body.filename || 'daily-news';
    language = body.language || 'arabic';

    // التحقق من صحة البيانات
    if (!summary || typeof summary !== 'string') {
      return NextResponse.json({ 
        error: 'Missing or invalid summary',
        details: 'يجب توفير نص الملخص' 
      }, { status: 400 });
    }

    if (summary.length < 10) {
      return NextResponse.json({ 
        error: 'Summary too short',
        details: 'النص قصير جداً، يجب أن يكون 10 أحرف على الأقل' 
      }, { status: 400 });
    }

    // اختيار الصوت المناسب
    selectedVoiceId = VOICE_IDS[voice as keyof typeof VOICE_IDS] || VOICE_IDS.bradford;

    // التحقق من مفتاح ElevenLabs
    apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.startsWith('sk_demo')) {
      console.log('⚠️ وضع تجريبي - إرجاع ملف صوتي نموذجي');
      
      // في الوضع التجريبي، نرجع ملف صوتي موجود مسبقاً
      const demoFiles = [
        '/audio/daily-news-2025-07-17T13-02-46-229Z.mp3',
        '/audio/daily-news-2025-07-17T13-01-36-470Z.mp3',
        '/audio/test-news-2025-07-17T12-44-46-842Z.mp3'
      ];
      
      const randomFile = demoFiles[Math.floor(Math.random() * demoFiles.length)];
      
      return NextResponse.json({
        success: true,
        demo_mode: true,
        url: randomFile,
        filename: randomFile.split('/').pop() || 'demo.mp3',
        size: 1258496, // حجم تقريبي
        duration_estimate: '90 ثانية',
        voice_used: voice,
        voice_id: selectedVoiceId,
        text_length: summary.length,
        message: '🎯 وضع تجريبي - تم إرجاع ملف صوتي نموذجي',
        notice: 'لتوليد صوت حقيقي، يرجى إضافة مفتاح ElevenLabs صحيح'
      });
    }
    console.log(`🔊 استخدام الصوت: ${voice} (${selectedVoiceId})`);

    // تحسين النص للقراءة الصوتية
    optimizedText = summary
      .replace(/<[^>]*>/g, '') // إزالة HTML tags
      .replace(/\./g, '. ') // تحسين التوقف
      .replace(/،/g, '، ')
      .replace(/؛/g, '؛ ')
      .trim()
      .substring(0, 2500); // حد أقصى 2500 حرف

    console.log(`📝 النص المُحسَّن: ${optimizedText.substring(0, 100)}...`);

    // طلب التوليد من ElevenLabs
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        text: optimizedText,
        model_id: 'eleven_multilingual_v2', // النموذج المحسن للعربية
        voice_settings: {
          stability: language === 'arabic' ? 0.6 : 0.4, // استقرار أعلى للعربية
          similarity_boost: 0.75,
          style: 0.3, // نبرة طبيعية
          use_speaker_boost: true // تعزيز وضوح المتحدث
        }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 30000 // مهلة 30 ثانية
      }
    );

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
              format: "mp3"
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
      const archiveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/audio/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filename_with_timestamp,
          url: publicUrl,
          size: response.data.byteLength,
          duration: Math.ceil(optimizedText.length / 15) + ' ثانية',
          voice: voice,
          text_length: optimizedText.length,
          is_daily: body.is_daily === true, // إضافة علامة للنشرة اليومية
          is_published: body.is_daily === true // النشرة اليومية تكون منشورة تلقائياً
        })
      });

      if (!archiveResponse.ok) {
        console.error('⚠️ فشل حفظ النشرة في الأرشيف');
      } else {
        console.log('✅ تم حفظ النشرة في الأرشيف');
      }
    } catch (archiveError) {
      console.error('⚠️ خطأ في حفظ الأرشيف:', archiveError);
    }

    // إرجاع معلومات مفصلة
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename_with_timestamp,
      size: response.data.byteLength,
      duration_estimate: Math.ceil(optimizedText.length / 15) + ' ثانية', // تقدير: 15 حرف/ثانية
      voice_used: voice,
      voice_id: selectedVoiceId,
      text_length: optimizedText.length,
      message: 'تم توليد النشرة الصوتية بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في توليد الصوت:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // معالجة أخطاء ElevenLabs المحددة
    if (error.response?.status === 404 && error.response?.data?.detail?.status === 'voice_not_found') {
      // محاولة استخدام صوت احتياطي
      console.log('⚠️ الصوت المطلوب غير موجود، محاولة استخدام صوت احتياطي...');
      
      try {
        // استخدام صوت Adam كصوت احتياطي
        const fallbackVoiceId = VOICE_IDS.adam; // Adam - صوت افتراضي موثوق
        console.log(`🔄 استخدام الصوت الاحتياطي: Adam (${fallbackVoiceId})`);
        
        const fallbackResponse = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${fallbackVoiceId}`,
          {
            text: optimizedText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true
            }
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
        
        // حفظ في JSON للأرشيف
        const archiveData = {
          id: timestamp,
          title: `نشرة ${new Date().toLocaleDateString('ar-SA')}`,
          url: publicUrl,
          size: fallbackResponse.data.byteLength,
          voice: `${voice} (تم استخدام Adam كبديل)`,
          text_preview: optimizedText.substring(0, 200) + '...',
          created_at: new Date().toISOString(),
          is_daily: body.is_daily || false,
          is_published: body.is_daily === true, // النشرة اليومية تكون منشورة تلقائياً
          fallback_used: true
        };
        
        const archivePath = path.join(process.cwd(), 'data', 'audio-archive.json');
        let archive: any[] = [];
        
        if (fs.existsSync(archivePath)) {
          try {
            const content = fs.readFileSync(archivePath, 'utf-8');
            archive = JSON.parse(content);
          } catch (e) {
            console.error('خطأ في قراءة ملف الأرشيف:', e);
          }
        }
        
        archive.unshift(archiveData);
        archive = archive.slice(0, 50); // حفظ آخر 50 ملف فقط
        
        fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
        
        return NextResponse.json({
          success: true,
          url: publicUrl,
          filename: outputFile.split('/').pop() || 'output.mp3',
          size: fallbackResponse.data.byteLength,
          duration_estimate: Math.round(optimizedText.length / 3) + ' ثانية',
          voice_used: `${voice} (استُخدم Adam كبديل)`,
          voice_id: fallbackVoiceId,
          text_length: optimizedText.length,
          message: '✅ تم توليد الصوت بنجاح باستخدام صوت احتياطي',
          warning: 'الصوت المطلوب غير متاح، تم استخدام صوت احتياطي',
          archive_saved: true
        });
        
      } catch (fallbackError: any) {
        console.error('❌ فشل حتى مع الصوت الاحتياطي:', fallbackError.message);
      }
    }
    
    let errorMessage = 'حدث خطأ في توليد الصوت';
    let errorDetails = error.message;
    
    if (error.response?.status === 401) {
      errorMessage = 'مفتاح API غير صالح';
      errorDetails = 'يرجى التحقق من صحة مفتاح ElevenLabs';
    } else if (error.response?.status === 403) {
      errorMessage = 'الوصول مرفوض';
      errorDetails = 'ليس لديك صلاحية لاستخدام هذه الخدمة';
    } else if (error.response?.status === 404) {
      errorMessage = 'الصوت المطلوب غير موجود';
      errorDetails = `معرف الصوت "${selectedVoiceId}" غير صالح أو تم حذفه`;
    } else if (error.response?.status === 429) {
      errorMessage = 'تجاوزت حد الاستخدام';
      errorDetails = 'لقد تجاوزت الحد المسموح من الطلبات أو الأحرف';
    } else if (error.response?.status === 422) {
      errorMessage = 'النص غير صالح';
      errorDetails = 'النص المرسل يحتوي على محتوى غير مقبول';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'انتهت مهلة الطلب';
      errorDetails = 'استغرق توليد الصوت وقتاً طويلاً جداً';
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      troubleshooting: {
        step1: 'تحقق من صحة مفتاح ElevenLabs API',
        step2: 'تأكد من وجود اتصال إنترنت مستقر',
        step3: 'تحقق من صحة النص المرسل',
        step4: 'جرب صوت مختلف إذا استمر الخطأ'
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