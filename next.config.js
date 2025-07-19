/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // نقل serverComponentsExternalPackages للمستوى الأعلى
  serverExternalPackages: ['prisma', '@prisma/client'],

  // إعدادات الصور المحدثة - استخدام remotePatterns بدلاً من domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www2.0zz0.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www2.0zz0.com',
        pathname: '/**',
      }
    ],
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