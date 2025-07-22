/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  serverExternalPackages: ['prisma', '@prisma/client'],

  // إعدادات الصور محسنة للأداء والاستقرار
  images: {
    formats: ['image/webp'], // تبسيط الفورمات
    minimumCacheTTL: 300, // cache لمدة 5 دقائق
    deviceSizes: [640, 750, 1080, 1920], // تقليل الأحجام
    imageSizes: [16, 32, 64, 128, 256], // تبسيط الأحجام
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // تقليل التايم أوت
    loader: 'default',
    loaderFile: undefined,
    // تحسين الأداء
    unoptimized: false,
    remotePatterns: [
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
        hostname: 'placehold.co',
      }
    ],
  },

  // تخطي أخطاء البناء للسرعة
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // إعدادات تجريبية للأداء
  experimental: {
    optimizeCss: true,
    cssChunking: 'strict',
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'framer-motion'
    ],
  },

  // تحسين الكمبايل
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // تحسين Webpack للأداء
  webpack: (config, { dev, isServer }) => {
    // تحسين bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },

  // Headers للتحميل السريع
  async headers() {
    return [
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
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 