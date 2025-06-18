'use client'

import { useTemplates } from './TemplateProvider'
import Image from 'next/image'
import Link from 'next/link'

export function DynamicHeader() {
  const { headerTemplate, loading } = useTemplates()
  
  if (loading) {
    return <HeaderSkeleton />
  }
  
  if (!headerTemplate || !headerTemplate.is_active) {
    return <DefaultHeader />
  }
  
  const content = headerTemplate.content || {}
  
  return (
    <header 
      className="bg-white shadow-sm"
      style={{
        backgroundColor: headerTemplate.primary_color || '#ffffff',
        color: headerTemplate.secondary_color || '#000000'
      }}
    >
      <div className="container mx-auto px-4">
        {/* الشعار */}
        {headerTemplate.logo_url && (
          <div className="py-4">
            <Link href="/">
              <Image 
                src={headerTemplate.logo_url} 
                alt={headerTemplate.logo_alt || 'شعار الموقع'}
                width={headerTemplate.logo_width || 150}
                height={headerTemplate.logo_height || 50}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>
        )}
        
        {/* شريط علوي */}
        {content.topBar && (
          <div className="py-2 border-b border-gray-200 text-sm">
            <div className="flex justify-between items-center">
              {content.topBar.showBreakingNews && (
                <div className="text-red-600 font-semibold">
                  عاجل: آخر الأخبار
                </div>
              )}
              {content.topBar.showDateTime && (
                <div className="text-gray-600">
                  {new Date().toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* التنقل */}
        {content.navigation?.items && content.navigation.items.length > 0 && (
          <nav className="py-4">
            <ul className="flex gap-6">
              {content.navigation.items.map((item: any, index: number) => (
                <li key={index}>
                  <Link 
                    href={item.url} 
                    className="hover:opacity-80 transition-opacity"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        
        {/* روابط التواصل */}
        {headerTemplate.social_links && headerTemplate.social_links.length > 0 && (
          <div className="flex gap-4 py-2 border-t border-gray-200">
            {headerTemplate.social_links.map((link, index) => (
              <a 
                key={index} 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                title={link.platform}
              >
                <SocialIcon platform={link.platform} />
              </a>
            ))}
          </div>
        )}
      </div>
      
      {/* الأنماط المخصصة */}
      {headerTemplate.custom_styles && (
        <style dangerouslySetInnerHTML={{ __html: headerTemplate.custom_styles }} />
      )}
    </header>
  )
}

// مكون الهيكل العظمي أثناء التحميل
function HeaderSkeleton() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <div className="h-12 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <nav className="py-4">
          <div className="flex gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

// هيدر افتراضي
function DefaultHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <Link href="/" className="text-2xl font-bold">
            سبق الذكية
          </Link>
        </div>
        <nav className="py-4">
          <ul className="flex gap-6">
            <li><Link href="/">الرئيسية</Link></li>
            <li><Link href="/categories">الأقسام</Link></li>
            <li><Link href="/news">الأخبار</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

// أيقونات وسائل التواصل
function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactElement> = {
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
      </svg>
    ),
    youtube: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
  
  return icons[platform] || <span className="text-xs">{platform}</span>
} 