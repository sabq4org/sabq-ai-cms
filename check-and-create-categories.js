import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        is_active: true
      },
      take: 5
    });
    
    console.log('Total categories found:', categories.length);
    console.log('Categories:', JSON.stringify(categories, null, 2));
    
    if (categories.length === 0) {
      console.log('No categories found in database. Creating sample categories...');
      
      // Create sample categories
      const sampleCategories = [
        {
          id: '1',
          name: 'الأخبار المحلية',
          slug: 'local-news',
          description: 'أخبار محلية',
          is_active: true,
          display_order: 1,
          name_en: 'Local News'
        },
        {
          id: '2', 
          name: 'الرياضة',
          slug: 'sports',
          description: 'أخبار رياضية',
          is_active: true,
          display_order: 2,
          name_en: 'Sports'
        },
        {
          id: '3',
          name: 'التقنية',
          slug: 'technology',
          description: 'أخبار تقنية',
          is_active: true,
          display_order: 3,
          name_en: 'Technology'
        }
      ];
      
      for (const category of sampleCategories) {
        await prisma.categories.create({
          data: category
        });
      }
      
      console.log('✅ Sample categories created successfully');
    }
    
  } catch (error) {
    console.error('❌ Error checking categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
