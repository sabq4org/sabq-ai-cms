/**
 * Advanced Bundle Optimization Configuration
 * Based on executive performance guidelines
 */

export interface BundleOptimizationConfig {
  enableSplitting: boolean;
  enableCompression: boolean;
  enableAnalyzer: boolean;
  enableTreeShaking: boolean;
  chunkSizeWarning: number;
  chunkSizeError: number;
}

export const defaultBundleConfig: BundleOptimizationConfig = {
  enableSplitting: true,
  enableCompression: true,
  enableAnalyzer: process.env.ANALYZE === 'true',
  enableTreeShaking: true,
  chunkSizeWarning: 250000, // 250KB
  chunkSizeError: 500000,   // 500KB
};

export interface ChunkAnalysis {
  name: string;
  size: number;
  files: string[];
}

export interface AssetAnalysis {
  name: string;
  size: number;
  type: string;
}

export interface BundleAnalysis {
  totalSize: number;
  chunks: ChunkAnalysis[];
  assets: AssetAnalysis[];
}

export const createOptimizedWebpackConfig = (config: BundleOptimizationConfig = defaultBundleConfig) => {
  return {
    // Performance budgets
    performance: {
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
      maxAssetSize: config.chunkSizeWarning,
      maxEntrypointSize: config.chunkSizeError,
      assetFilter: (assetFilename: string) => {
        // Only check JavaScript and CSS files
        return /\.(js|css)$/.test(assetFilename);
      },
    },

    // Advanced optimization
    optimization: {
      // Enable tree shaking
      usedExports: config.enableTreeShaking,
      sideEffects: false,
      
      // Advanced splitting strategy
      splitChunks: config.enableSplitting ? {
        chunks: 'all' as const,
        cacheGroups: {
          // React and React DOM
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all' as const,
            priority: 20,
          },
          
          // UI Libraries (Material-UI, Chakra, etc.)
          ui: {
            test: /[\\/]node_modules[\\/](@mui|@chakra-ui|antd|@ant-design)[\\/]/,
            name: 'ui-vendor',
            chunks: 'all' as const,
            priority: 15,
          },
          
          // Utilities (lodash, date-fns, etc.)
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|moment|ramda)[\\/]/,
            name: 'utils-vendor',
            chunks: 'all' as const,
            priority: 10,
          },
          
          // Database and API libraries
          data: {
            test: /[\\/]node_modules[\\/](axios|swr|react-query|@tanstack\/react-query|prisma)[\\/]/,
            name: 'data-vendor',
            chunks: 'all' as const,
            priority: 10,
          },
          
          // Default vendor chunk for other node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all' as const,
            priority: 5,
          },
          
          // Common chunks for shared application code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all' as const,
            priority: 1,
            enforce: true,
          },
        },
      } : false,

      // Minimize in production
      minimize: process.env.NODE_ENV === 'production',
      
      // Runtime chunk for better caching
      runtimeChunk: config.enableSplitting ? {
        name: 'runtime'
      } : false,
    },

    // Resolve optimizations
    resolve: {
      // Speed up module resolution
      modules: ['node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      
      // Alias common paths
      alias: {
        '@': './src',
        '@/components': './src/components',
        '@/lib': './src/lib',
        '@/pages': './src/pages',
        '@/styles': './src/styles',
      },
    },

    // Development optimizations
    ...(process.env.NODE_ENV === 'development' && {
      devtool: 'eval-cheap-module-source-map' as const,
      cache: {
        type: 'filesystem' as const,
        cacheDirectory: '.next/cache/webpack',
      },
    }),
  };
};

// Utility to analyze bundle size from build output
export const analyzeBundleSize = (statsData: any): BundleAnalysis => {
  const analysis: BundleAnalysis = {
    totalSize: 0,
    chunks: [],
    assets: [],
  };

  // Analyze chunks
  if (statsData.chunks) {
    statsData.chunks.forEach((chunk: any) => {
      if (chunk.size && chunk.names && chunk.files) {
        analysis.chunks.push({
          name: chunk.names[0] || 'unnamed',
          size: chunk.size,
          files: chunk.files
        });
        analysis.totalSize += chunk.size;
      }
    });
  }

  // Analyze assets
  if (statsData.assets) {
    statsData.assets.forEach((asset: any) => {
      if (asset.size && asset.name) {
        const type = asset.name.endsWith('.js') ? 'javascript' :
                    asset.name.endsWith('.css') ? 'stylesheet' :
                    asset.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/) ? 'image' : 'other';
        
        analysis.assets.push({
          name: asset.name,
          size: asset.size,
          type
        });
      }
    });
  }

  return analysis;
};

// Bundle size recommendations
export const getBundleSizeRecommendations = (totalSize: number): string[] => {
  const recommendations: string[] = [];
  
  if (totalSize > 1000000) { // 1MB
    recommendations.push('🚨 Bundle size exceeds 1MB - consider aggressive code splitting');
    recommendations.push('💡 Implement dynamic imports for large dependencies');
    recommendations.push('🔧 Use webpack-bundle-analyzer to identify large modules');
  } else if (totalSize > 500000) { // 500KB
    recommendations.push('⚠️ Bundle size approaching 500KB - monitor growth');
    recommendations.push('💡 Consider lazy loading non-critical components');
  } else if (totalSize > 250000) { // 250KB
    recommendations.push('✅ Bundle size is acceptable but could be optimized');
    recommendations.push('💡 Review dependencies for unused code');
  } else {
    recommendations.push('🎉 Excellent bundle size optimization!');
  }

  return recommendations;
};

export default createOptimizedWebpackConfig;
