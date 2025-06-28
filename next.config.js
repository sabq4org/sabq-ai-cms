/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better error handling
  reactStrictMode: true,
  
  // Standalone output for Docker deployment
  output: 'standalone',
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.sabq-ai.com',
      },
      {
        protocol: 'https',
        hostname: 'jur3a.ai',
      },
      {
        protocol: 'https',
        hostname: '**.jur3a.ai',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    domains: [
      'localhost',
      'via.placeholder.com',
      'picsum.photos',
      'images.unsplash.com',
      'placeholder.pics',
      'placehold.co'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    unoptimized: true // مؤقتاً لحل مشاكل الصور
  },
  
  // Headers for security and proper MIME types
  async headers() {
    return [
      // Headers للملفات الثابتة
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=UTF-8',
          }
        ]
      },
      // Headers لملفات CSS
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=UTF-8',
          }
        ]
      },
      // Headers لملفات JavaScript
      {
        source: '/_next/static/chunks/:path*.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=UTF-8',
          }
        ]
      },
      // Headers عامة للأمان
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          }
        ]
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Experimental features
  experimental: {
    // Optimize CSS
    optimizeCss: true
  },
  
  // Performance
  poweredByHeader: false,
  compress: true,
  
  // إضافة trailing slashes للمسارات
  trailingSlash: false,
  
  // تحسينات الإنتاج
  productionBrowserSourceMaps: false,
  
  // TypeScript
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  
  // ESLint
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // نقل serverComponentsExternalPackages للمكان الصحيح
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  
  // Short link rewrites
  async rewrites() {
    return [
      { source: '/n/:slug', destination: '/article/:slug' }
    ]
  },
}

module.exports = nextConfig 