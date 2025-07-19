/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // نقل serverComponentsExternalPackages للمستوى الأعلى
  serverExternalPackages: ['prisma', '@prisma/client'],

  // إعدادات الصور
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        hostname: 'sabq.org',
      },
      {
        protocol: 'https',
        hostname: 'www.sabq.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
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

  // إعدادات CSS محسّنة
  experimental: {
    optimizeCss: true,
    cssChunking: 'strict',
  },

  // تحسين الأداء
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Headers لتحسين التحميل
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig; 