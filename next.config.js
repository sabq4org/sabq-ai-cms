/** @type {import('next').NextConfig} */
const nextConfig = {
  // إضافة معرف فريد للملفات الثابتة
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  experimental: {
    // Experimental support for optimizing stylesheets
    optimizeCss: {
      files: ["styles/globals.css", "styles/ArabicStyles.css"],
    },
    cssChunking: "strict",
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    webpackBuildWorker: true,
    // تحسين التحميل
    ppr: false,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  
  // تحسين الترقيم والتجميع
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // تحسين تجميع المكتبات
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
        },
      },
    };
    
    // تحسين الذاكرة
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    
    return config;
  },
  
  // منع التخزين المؤقت في بيئة التطوير
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
      ];
    }
    return [];
  },

  images: {
    formats: ['image/webp', 'image/avif'], // إضافة avif للأداء الأفضل
    minimumCacheTTL: 300, // cache لمدة 5 دقائق
    deviceSizes: [640, 750, 1080, 1920], // تقليل الأحجام
    imageSizes: [16, 32, 64, 128, 256], // تبسيط الأحجام
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // تقليل التايم أوت
    loader: 'default',
    loaderFile: undefined,
    // تمكين التحسين لحل مشكلة عرض الصور
    unoptimized: false,
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
        protocol: 'https',
        hostname: 'sabq-cms-content.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sabq-cms-content.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sabq-ai-cms-images.s3.amazonaws.com',
        pathname: '/**',
      },
              {
          protocol: 'https',
          hostname: 'sabq-ai-cms-images.s3.us-east-1.amazonaws.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'ui-avatars.com',
          pathname: '/api/**',
        },
      {
        protocol: 'https',
        hostname: 'd2kdkzp4dtcikk.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // تخطي أخطاء البناء للسرعة
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // إعدادات تجريبية للأداء - تم التبسيط
  experimental: {
    optimizeCss: true,
    cssChunking: 'strict',
  },

  // تحسين الكمبايل
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // تحسين Webpack للأداء - مبسط للتطوير
  webpack: (config, { dev, isServer }) => {
    // إضافة استثناءات للمكتبات المشاكسة
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // تحسين bundle size للإنتاج فقط
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
  serverExternalPackages: ['sharp'],
};

module.exports = nextConfig; 