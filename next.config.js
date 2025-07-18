/** @type {import('next').NextConfig} */
// Build: 2025-01-16-18-45 - Force Vercel Rebuild v2
// Version: 0.2.0
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  serverExternalPackages: ['prisma', '@prisma/client'],
  generateBuildId: async () => {
    // Custom build ID to force rebuild - Updated
    return 'v2-' + Date.now().toString()
  },

  // تمرير متغيرات البيئة للكلاينت
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb',
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '559894124915114',
  },

  // حل مشكلة chunk loading errors
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 10,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'sabq-ai-cms.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'sabq-cdn.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'www2.0zz0.com',
      }
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
    // تحسين أداء التحميل
    optimizeCss: true,
    // تمكين إعادة المحاولة التلقائية
    fallbackNodePolyfills: false,
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
      // إضافة إعدادات إضافية لحل مشاكل webpack
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
      };
    }
    // إصلاح مشاكل chunk loading في الإنتاج
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000 &&
                  /node_modules[\\/]/.test(module.identifier());
              },
              name(module) {
                const hash = require('crypto').createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
        runtimeChunk: {
          name: 'runtime',
        },
      };
    }
    // إزالة alias المخصّص لـ react/jsx-runtime الذي كان يسبّب تعارضًا مع Next.js
    // يُترك Next.js يضبط alias الخاص به تلقائيًا لضمان استخدام نسخة React المدمجة
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