/**
 * مساعد لقراءة البيانات الوصفية للملفات الصوتية من الخادم
 */

import fs from 'fs';
import path from 'path';

/**
 * قراءة مدة الملف الصوتي من الخادم (يتطلب ffprobe)
 */
export const getServerAudioDuration = async (filePath: string): Promise<number> => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    // التحقق من وجود الملف
    if (!fs.existsSync(fullPath)) {
      throw new Error(`الملف غير موجود: ${fullPath}`);
    }
    
    // محاولة استخدام ffprobe
    try {
      const { stdout } = await execPromise(
        `ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${fullPath}"`
      );
      const duration = parseFloat(stdout.trim());
      return Math.floor(duration);
    } catch (ffprobeError) {
      // إذا لم يكن ffprobe متوفر، استخدم حجم الملف للتقدير
      const stats = fs.statSync(fullPath);
      const fileSizeKB = stats.size / 1024;
      // تقدير: حوالي 16 كيلوبايت في الثانية للصوت العادي (128 kbps)
      const estimatedDuration = Math.floor(fileSizeKB / 16);
      console.warn(`ffprobe غير متوفر، استخدام تقدير المدة: ${estimatedDuration} ثانية`);
      return estimatedDuration;
    }
  } catch (error) {
    console.error('خطأ في قراءة مدة الملف الصوتي:', error);
    throw error;
  }
};

/**
 * تحديث مدة جميع النشرات الصوتية بالقيم الحقيقية
 */
export const updateAllAudioDurations = async () => {
  try {
    const { prisma } = require('@/lib/prisma');
    
    const newsletters = await prisma.audio_newsletters.findMany({
      select: { id: true, audioUrl: true, duration: true }
    });
    
    console.log(`🔄 بدء تحديث مدة ${newsletters.length} نشرة صوتية...`);
    
    for (const newsletter of newsletters) {
      try {
        const realDuration = await getServerAudioDuration(newsletter.audioUrl);
        
        // تحديث المدة إذا كانت مختلفة بشكل كبير
        if (Math.abs(realDuration - newsletter.duration) > 5) {
          await prisma.audio_newsletters.update({
            where: { id: newsletter.id },
            data: { duration: realDuration }
          });
          console.log(`✅ تم تحديث مدة النشرة ${newsletter.id}: ${newsletter.duration}s → ${realDuration}s`);
        }
      } catch (error) {
        console.warn(`⚠️ فشل في تحديث مدة النشرة ${newsletter.id}:`, error instanceof Error ? error.message : error);
      }
    }
    
    console.log('✅ اكتمل تحديث مدة النشرات الصوتية');
  } catch (error) {
    console.error('❌ خطأ في تحديث مدة النشرات:', error);
    throw error;
  }
};
