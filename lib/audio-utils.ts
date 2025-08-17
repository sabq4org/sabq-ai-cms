/**
 * دوال مساعدة للتعامل مع الملفات الصوتية
 */

/**
 * قراءة مدة الملف الصوتي من المتصفح
 */
export const getAudioDuration = (audioUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(Math.floor(audio.duration));
    });
    
    audio.addEventListener('error', (e) => {
      reject(new Error('فشل في تحميل الملف الصوتي'));
    });
    
    audio.src = audioUrl;
    audio.load();
  });
};

/**
 * تنسيق المدة من ثواني إلى دقائق:ثواني
 */
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * تحويل المدة المنسقة إلى ثواني
 */
export const parseDuration = (formattedDuration: string): number => {
  const parts = formattedDuration.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return 0;
};

/**
 * تقدير المدة من طول النص (تقريبي)
 */
export const estimateDurationFromText = (text: string): number => {
  // تقدير: حوالي 3-4 أحرف في الثانية للصوت العربي
  const charactersPerSecond = 3.5;
  return Math.ceil(text.length / charactersPerSecond);
};
