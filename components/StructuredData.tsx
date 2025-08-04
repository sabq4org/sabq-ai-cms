import Script from 'next/script';

// Schema.org للموقع الإخباري
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "سبق الذكية",
  "alternateName": "Sabq AI",
  "url": "https://sabq.me",
  "logo": {
    "@type": "ImageObject",
    "url": "https://sabq.me/logo.png",
    "width": 200,
    "height": 60
  },
  "description": "منصة إعلامية مدعومة بالذكاء الاصطناعي تقدم تحليلات ومقالات وأخبار دقيقة وعميقة",
  "foundingDate": "2023",
  "parentOrganization": {
    "@type": "Organization",
    "name": "سبق الذكية"
  },
  "sameAs": [
    "https://twitter.com/sabq",
    "https://facebook.com/sabq",
    "https://instagram.com/sabq",
    "https://linkedin.com/company/sabq"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "info@sabq.me",
    "availableLanguage": ["Arabic", "ar"]
  },
  "publishingPrinciples": "https://sabq.me/ethics",
  "actionableFeedbackPolicy": "https://sabq.me/feedback",
  "correctionsPolicy": "https://sabq.me/corrections",
  "diversityPolicy": "https://sabq.me/diversity",
  "ethicsPolicy": "https://sabq.me/ethics",
  "masthead": "https://sabq.me/about",
  "missionCoveragePrioritiesPolicy": "https://sabq.me/mission",
  "verificationFactCheckingPolicy": "https://sabq.me/fact-checking"
};

// Schema للموقع العام
const websiteGeneralSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "سبق الذكية",
  "url": "https://sabq.me",
  "description": "منصة إعلامية مدعومة بالذكاء الاصطناعي تقدم تحليلات ومقالات وأخبار دقيقة وعميقة",
  "inLanguage": "ar",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://sabq.me/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "NewsMediaOrganization",
    "name": "سبق الذكية",
    "logo": {
      "@type": "ImageObject",
      "url": "https://sabq.me/logo.png"
    }
  }
};

// Schema للنشاط التجاري المحلي
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "سبق الذكية",
  "url": "https://sabq.me",
  "logo": "https://sabq.me/logo.png",
  "description": "منصة إعلامية مدعومة بالذكاء الاصطناعي",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SA",
    "addressRegion": "الرياض"
  },
  "areaServed": {
    "@type": "Country",
    "name": "المملكة العربية السعودية"
  },
  "knowsLanguage": ["ar", "Arabic"]
};

interface StructuredDataProps {
  pageType?: 'home' | 'article' | 'category' | 'search';
  pageData?: any;
}

export default function StructuredData({ pageType = 'home', pageData }: StructuredDataProps) {
  const schemas = [websiteSchema, websiteGeneralSchema, localBusinessSchema];

  // إضافة schema إضافية حسب نوع الصفحة
  if (pageType === 'article' && pageData) {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": pageData.title,
      "description": pageData.excerpt || pageData.description,
      "image": pageData.featured_image,
      "datePublished": pageData.published_at,
      "dateModified": pageData.updated_at || pageData.published_at,
      "author": {
        "@type": "Person",
        "name": pageData.author_name || "فريق سبق الذكية"
      },
      "publisher": {
        "@type": "NewsMediaOrganization",
        "name": "سبق الذكية",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sabq.me/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://sabq.me/article/${pageData.id}`
      },
      "articleSection": pageData.category_name || "أخبار",
      "keywords": pageData.tags?.join(", ") || "أخبار, سبق الذكية",
      "wordCount": pageData.content?.length || 0,
      "articleBody": pageData.content,
      "inLanguage": "ar"
    };
    
    schemas.push(articleSchema);
  }

  if (pageType === 'category' && pageData) {
    const categorySchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${pageData.name} - سبق الذكية`,
      "description": `تصفح أحدث الأخبار في قسم ${pageData.name}`,
      "url": `https://sabq.me/categories/${pageData.slug}`,
      "mainEntity": {
        "@type": "ItemList",
        "name": `أخبار ${pageData.name}`,
        "description": `قائمة بأحدث الأخبار في قسم ${pageData.name}`
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "الرئيسية",
            "item": "https://sabq.me"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "الأقسام",
            "item": "https://sabq.me/categories"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": pageData.name,
            "item": `https://sabq.me/categories/${pageData.slug}`
          }
        ]
      }
    };
    
    schemas.push(categorySchema);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </>
  );
}