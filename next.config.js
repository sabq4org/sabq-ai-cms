/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  serverExternalPackages: ['prisma', '@prisma/client'],

  // إعدادات الصور محسنة للأداء والسرعة
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 300, // تحسين cache إلى 5 دقائق
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // تحسين ضغط الصور لتسريع التحميل - إزالة الخصائص غير المدعومة
    unoptimized: false,
    loader: 'default',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'www.sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.fra1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.nyc3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.sgp1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.ams3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-bucket.sfo3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'fra1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // إعادة توجيه الصور الفاشلة
  async rewrites() {
    return [
      {
        source: '/images/failed/:path*',
        destination: '/images/placeholder.jpg',
      },
    ];
  },

  // إعدادات بسيطة
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },

  // تخطي أخطاء البناء
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // إعدادات CSS وأداء محسّنة
  experimental: {
    optimizeCss: true,
    cssChunking: 'strict',
    // تحسينات إضافية للأداء
    optimizePackageImports: ['lucide-react'],
  },

  // تحسين الأداء والكمبايل
  compiler: {
    // إزالة console.log في الإنتاج
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // تحسين bundle analyzer
  webpack: (config, { dev, isServer }) => {
    // تحسين تقسيم الكود
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // مكتبات العامة
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // مكونات shared
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    }
    
    return config
    return config
  },

  // Headers لتحسين التحميل
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // إعادة التوجيه
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/preferences',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig 