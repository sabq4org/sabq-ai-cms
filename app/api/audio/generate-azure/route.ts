import { NextRequest, NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { summary, voice = 'ar-SA-HamedNeural', language = 'ar' } = await req.json();

    if (!summary) {
      return NextResponse.json({ 
        error: 'النص مطلوب' 
      }, { status: 400 });
    }

    // إعدادات Azure
    const speechKey = process.env.AZURE_SPEECH_KEY || '';
    const speechRegion = process.env.AZURE_SPEECH_REGION || 'eastus';

    if (!speechKey) {
      // في حالة عدم وجود مفتاح Azure، إرجاع ملف صوتي تجريبي
      return NextResponse.json({
        url: '/demo-audio.mp3',
        filename: 'demo-audio.mp3',
        size: 1024,
        duration_estimate: '1 دقيقة',
        voice_used: 'demo',
        text_length: summary.length,
        message: 'نسخة تجريبية - يتطلب مفتاح Azure للإنتاج'
      });
    }

    // إنشاء ملف صوتي مؤقت
    const filename = `audio-${uuidv4()}.mp3`;
    const outputPath = `/tmp/${filename}`;

    // إعداد Azure TTS
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechSynthesisVoiceName = voice;
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // توليد الصوت
    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        summary,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // قراءة الملف وإرجاعه
            const audioBuffer = require('fs').readFileSync(outputPath);
            const base64Audio = audioBuffer.toString('base64');
            
            resolve(NextResponse.json({
              url: `data:audio/mp3;base64,${base64Audio}`,
              filename: filename,
              size: audioBuffer.length,
              duration_estimate: Math.ceil(summary.length / 150) + ' دقائق',
              voice_used: voice,
              text_length: summary.length
            }));

            // حذف الملف المؤقت
            require('fs').unlinkSync(outputPath);
          } else {
            reject(new Error('فشل في توليد الصوت'));
          }
          synthesizer.close();
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });

  } catch (error: any) {
    console.error('خطأ في توليد الصوت:', error);
    return NextResponse.json({ 
      error: 'فشل في توليد الصوت',
      details: error.message 
    }, { status: 500 });
  }
} 