import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// POST - توليد الصوت للحلقة
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // التحقق من المصادقة
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // التحقق من صلاحيات المستخدم
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // جلب الحلقة
    const episode = await prisma.audio_episodes.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true,
            voice_model: true
          }
        }
      }
    });

    if (!episode) {
      return NextResponse.json(
        { success: false, error: 'Episode not found' },
        { status: 404 }
      );
    }

    // التحقق من وجود المحتوى
    if (!episode.content || episode.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Episode has no content' },
        { status: 400 }
      );
    }

    // التحقق من ElevenLabs API Key
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // تحديث حالة الحلقة
    await prisma.audio_episodes.update({
      where: { id },
      data: {
        generation_status: 'generating'
      }
    });

    // تحديد معرف الصوت
    const voiceModel = episode.voice_model || episode.program.voice_model || 'bradford';
    const voiceIds: Record<string, string> = {
      'bradford': 'LDhg5RhcU3kv7M4khAQN',
      'rachel': 'bRbyutHpcP78x8few1jt',
      'alice': 'Xb7hH8MSUJpSbSDYk0k2',
      'bill': 'pqHfZKP75CvOlQylNhV4',
      'chris': 'iP95p4xoKVk53GoZ742B',
      'dorothy': 'ThT5KcBeYPX3keUQqHPh',
      'george': 'JBFqnCBsd6RMkjVDRZzb'
    };

    const voiceId = voiceIds[voiceModel] || voiceIds['bradford'];

    // إعداد النص للتحويل
    const fullText = `${episode.title}. ${episode.content}`;

    // استدعاء ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: fullText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      
      // تحديث حالة الحلقة
      await prisma.audio_episodes.update({
        where: { id },
        data: {
          generation_status: 'failed',
          metadata: {
            ...episode.metadata as any,
            generation_error: error
          }
        }
      });

      return NextResponse.json(
        { success: false, error: 'Failed to generate audio' },
        { status: 500 }
      );
    }

    // حفظ الملف الصوتي
    const audioBuffer = await response.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);
    
    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const filename = `${episode.program.slug}-ep${episode.episode_number}-${timestamp}.mp3`;
    
    // تحديد مسار الحفظ
    const tempDir = process.env.VERCEL 
      ? '/tmp' 
      : path.join(process.cwd(), 'public', 'audio', 'episodes');
    
    // التأكد من وجود المجلد
    await fs.mkdir(tempDir, { recursive: true });
    
    // حفظ الملف
    const filePath = path.join(tempDir, filename);
    await fs.writeFile(filePath, audioData);
    
    // إنشاء URL للملف
    const audioUrl = process.env.VERCEL
      ? `https://${process.env.VERCEL_URL}/api/audio/episodes/${id}/stream`
      : `/audio/episodes/${filename}`;

    // حساب مدة الحلقة (تقديرية بناءً على حجم الملف)
    const fileSizeInMB = audioData.length / (1024 * 1024);
    const estimatedDuration = Math.round(fileSizeInMB * 60); // تقدير: 1MB = 1 دقيقة

    // تحديث الحلقة
    const updatedEpisode = await prisma.audio_episodes.update({
      where: { id },
      data: {
        audio_url: audioUrl,
        duration: estimatedDuration,
        generation_status: 'completed',
        metadata: {
          ...episode.metadata as any,
          generated_at: new Date(),
          file_size: audioData.length,
          filename
        }
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      episode: updatedEpisode,
      audio: {
        url: audioUrl,
        duration: estimatedDuration,
        size: audioData.length
      }
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    
    // محاولة تحديث حالة الحلقة في حالة الخطأ
    try {
      const { id } = await params;
      await prisma.audio_episodes.update({
        where: { id },
        data: {
          generation_status: 'failed'
        }
      });
    } catch {}

    return NextResponse.json(
      { success: false, error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
} 