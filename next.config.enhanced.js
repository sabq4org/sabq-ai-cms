/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // تحسين الصور
  images: {
    domains: ['sabq.org', 'cdn.sabq.org', 'static.sabq.org'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // تحسين الأداء
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    serverActions: true,
    serverComponentsExternalPackages: [],
    webpackBuildWorker: true,
  },
  
  // تحسين الحزم
  webpack: (config, { dev, isServer }) => {
    // تحسين حجم الحزم في الإنتاج
    if (!dev && !isServer) {
      // استخدام Terser للضغط
      config.optimization.minimize = true;
      
      // تقسيم الحزم
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 80000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const rawRequest = module.rawRequest || '';
              const packageName = rawRequest
                .match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1]
                .replace('@', '')
                .replace(/[\\/]/g, '_');
              return `lib.${packageName}`;
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
          shared: {
            name(module, chunks) {
              return `shared.${chunks.map((c) => c.name).join('~')}`;
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // تحسين الخطوط
  fontOptimization: {
    preload: true,
    inlineImageLimit: 8192,
    fontDisplay: 'swap',
  },
  
  // تحسين الكاش
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 ساعة
    pagesBufferLength: 5,
  },
  
  // تحسين الأمان
  headers: async () => {
    return [
      {
        source: '/(.*)',
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // تحسين الأداء في وضع التطوير
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  
  // تحسين الأداء في وضع الإنتاج
  productionBrowserSourceMaps: false,
  
  // تحسين الأداء للمحتوى الثابت
  staticPageGenerationTimeout: 120,
  
  // تحسين الأداء للمحتوى الديناميكي
  serverRuntimeConfig: {
    maxConcurrentRequests: 100,
  },
  
  // تحسين الأداء للتحميل المسبق
  publicRuntimeConfig: {
    prefetchThreshold: 3000, // 3 ثواني
  },
};

module.exports = nextConfig;
