// Clear news cache to ensure fresh data
import { cache } from '@/lib/redis';

async function clearNewsCache() {
  try {
    console.log('🧹 Clearing news cache...');
    
    // Clear various news cache patterns
    await cache.clearPattern('news:latest:*');
    await cache.clearPattern('articles:*'); 
    await cache.del(['categories:all', 'stats:dashboard']);
    
    console.log('✅ News cache cleared! New articles should appear now.');
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error.message);
  }
}

clearNewsCache();
