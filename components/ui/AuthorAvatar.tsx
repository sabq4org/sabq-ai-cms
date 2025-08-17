import Image from 'next/image'
import { getCategoryAvatar, getAvatarSizes } from '@/lib/avatar-utils'

interface AuthorAvatarProps {
  author: {
    name: string
    category?: string | null
    avatarUrl?: string | null
    email?: string | null
  }
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  className?: string
  showFallback?: boolean
}

export default function AuthorAvatar({ 
  author, 
  size = 'medium',
  className = '',
  showFallback = true 
}: AuthorAvatarProps) {
  const avatarSizes = getAvatarSizes(author)
  const sizeMap = {
    small: { width: 64, height: 64 },
    medium: { width: 128, height: 128 },
    large: { width: 200, height: 200 },
    xlarge: { width: 400, height: 400 }
  }
  
  const dimensions = sizeMap[size]
  const avatarUrl = avatarSizes[size]

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`}>
      <Image
        src={avatarUrl}
        alt={`صورة ${author.name}`}
        width={dimensions.width}
        height={dimensions.height}
        className="object-cover w-full h-full"
        priority={size === 'large' || size === 'xlarge'}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        onError={(e) => {
          if (showFallback) {
            const target = e.target as HTMLImageElement
            target.src = getCategoryAvatar(author)
          }
        }}
      />
      
      {/* مؤشر الحالة إذا كان الكاتب نشط */}
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
    </div>
  )
}

// Component أبسط للأحجام الصغيرة
export function SimpleAvatar({ author, size = 48, className = '' }: {
  author: { name: string; avatarUrl?: string | null; category?: string | null }
  size?: number
  className?: string
}) {
  const avatarUrl = getCategoryAvatar(author)
  
  return (
    <Image
      src={avatarUrl}
      alt={author.name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
    />
  )
}
