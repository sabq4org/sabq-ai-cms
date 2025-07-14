/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    // إضافة CDN domains
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'cdn.jsdelivr.net',
      'your-cdn-domain.com' // استبدل بـ CDN الخاص بك
    ],
    // تحسين الصور
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // سنة واحدة
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
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
    return config;
  },
  // إضافة headers للتخزين المؤقت
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
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

/**
 * حل مشكلة "ENOENT pack.gz" بتعطيل الكاش في وضع التطوير
 */
nextConfig.webpack = (config, { dev, isServer }) => {
  if (dev) {
    config.cache = false;
  }
  return config;
};

module.exports = nextConfig 