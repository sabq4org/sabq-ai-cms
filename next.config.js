/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // إعدادات بسيطة
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },

  // إعدادات الصور البسيطة
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'localhost'],
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