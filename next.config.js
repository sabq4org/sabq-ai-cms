/** @type {import('next').NextConfig} */
// Build: 2025-01-16-18-45 - Force Vercel Rebuild v2
// Version: 0.2.0
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  serverExternalPackages: ['prisma', '@prisma/client'],
  generateBuildId: async () => {
    // Custom build ID to force rebuild - Updated
    return 'v2-' + Date.now().toString()
  },
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      'images.unsplash.com',
      'picsum.photos',
      'placeholder.com',
      'via.placeholder.com',
      'dummyimage.com',
      'placehold.co',
      'loremflickr.com',
      'cloudflare-ipfs.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      'pbs.twimg.com',
      'sabq-ai-cms.b-cdn.net',
      'sabq-cdn.b-cdn.net',
      'www2.0zz0.com'
    ],
    // تحسينات الصور
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 يوم
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    webpackBuildWorker: true,
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'react-hot-toast',
      '@tanstack/react-query'
    ],
    // إصلاح مشاكل HMR - تم نقل إلى serverExternalPackages
    // serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  // منع حفظ الصور محلياً
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    // Ignore specific warnings for Next.js 15.3.5
    config.ignoreWarnings = [
      { module: /node_modules/ },
      (warning) => warning.message.includes('expected pattern'),
    ];
    // حل مشكلة "ENOENT pack.gz" بتعطيل الكاش في وضع التطوير
    if (dev) {
      config.cache = false;
      // إصلاح مشاكل HMR في Next.js 15
      config.watchOptions = {
        ignored: /node_modules/,
        poll: 1000,
      };
    }
    return config;
  },
  // إضافة headers للتخزين المؤقت
  async headers() {
    return [
      {
        source: '/:path*\\.(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}



module.exports = nextConfig 