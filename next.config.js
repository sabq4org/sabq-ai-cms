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
}

module.exports = nextConfig; 