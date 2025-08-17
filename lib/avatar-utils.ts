// دوال مساعدة لإنشاء الصور الشخصية للكتاب
export interface AvatarConfig {
  name: string
  size?: number
  background?: string
  color?: string
  fontSize?: number
  rounded?: boolean
  bold?: boolean
}

// دالة لإنشاء رابط صورة شخصية احترافي
export function generateAvatarUrl(config: AvatarConfig): string {
  const {
    name,
    size = 200,
    background = '3B82F6', // أزرق احترافي
    color = 'ffffff',
    fontSize = 0.4,
    rounded = true,
    bold = true
  } = config

  const params = new URLSearchParams({
    name: name,
    size: size.toString(),
    background: background.replace('#', ''),
    color: color.replace('#', ''),
    'font-size': fontSize.toString(),
    bold: bold ? 'true' : 'false',
    format: 'svg'
  })

  if (rounded) {
    params.append('rounded', 'true')
  }

  return `https://ui-avatars.com/api/?${params.toString()}`
}

// دالة للحصول على أفضل صورة متاحة للكاتب
export function getBestAvatar(author: {
  avatarUrl?: string | null
  name: string
  email?: string | null
}): string {
  // أولوية للصورة المخصصة
  if (author.avatarUrl) {
    return author.avatarUrl
  }

  // إذا كان لديه email، جرب Gravatar
  if (author.email) {
    try {
      const emailHash = require('crypto')
        .createHash('md5')
        .update(author.email.toLowerCase().trim())
        .digest('hex')
      
      // نحاول Gravatar أولاً مع fallback لـ ui-avatars
      const gravatarUrl = `https://secure.gravatar.com/avatar/${emailHash}?s=200&d=404`
      
      // في الواقع، نستخدم ui-avatars مباشرة لضمان عدم وجود صور فارغة
      return generateAvatarUrl({ name: author.name })
    } catch {
      // في حالة فشل hash، استخدم ui-avatars
      return generateAvatarUrl({ name: author.name })
    }
  }

  // الخيار الأخير: ui-avatars
  return generateAvatarUrl({ name: author.name })
}

// دالة لألوان مخصصة حسب التصنيف
export function getCategoryColor(category?: string): string {
  const categoryColors: Record<string, string> = {
    'تقنية': '6366F1', // بنفسجي
    'ريادة أعمال': '10B981', // أخضر
    'اقتصاد': 'F59E0B', // أصفر
    'ثقافة': 'EF4444', // أحمر
    'صحة': '06B6D4', // سماوي
    'رياضة': '8B5CF6', // بنفسجي فاتح
    'سياسة': '6B7280', // رمادي
    'أدب': 'EC4899', // وردي
    'تعليم': '14B8A6', // تركوازي
    'فن': 'F97316', // برتقالي
  }

  return categoryColors[category || ''] || '3B82F6' // أزرق افتراضي
}

// دالة لإنشاء صورة شخصية مخصصة حسب التصنيف
export function getCategoryAvatar(author: {
  name: string
  category?: string | null
  avatarUrl?: string | null
  email?: string | null
}): string {
  if (author.avatarUrl) {
    return author.avatarUrl
  }

  const categoryColor = getCategoryColor(author.category || undefined)
  
  return generateAvatarUrl({
    name: author.name,
    background: categoryColor,
    size: 200,
    fontSize: 0.4,
    bold: true,
    rounded: true
  })
}

// دالة لإنشاء صور بأحجام مختلفة
export function getAvatarSizes(author: {
  name: string
  category?: string | null
  avatarUrl?: string | null
}) {
  const baseUrl = author.avatarUrl || generateAvatarUrl({
    name: author.name,
    background: getCategoryColor(author.category || undefined)
  })

  return {
    small: baseUrl.replace('size=200', 'size=64'),
    medium: baseUrl.replace('size=200', 'size=128'),
    large: baseUrl.replace('size=200', 'size=200'),
    xlarge: baseUrl.replace('size=200', 'size=400')
  }
}
