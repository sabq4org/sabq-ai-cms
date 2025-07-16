const { Pool } = require('pg');

// قاعدة البيانات العامة في DigitalOcean
const defaultDbUrl = 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/defaultdb?sslmode=require';

const pool = new Pool({
  connectionString: defaultDbUrl
});

// التصنيفات المطلوب إضافتها
const categories = [
  {
    id: 'cat-local-001',
    name: 'محليات',
    name_en: 'Local',
    description: 'أخبار المناطق والمدن السعودية',
    slug: 'local',
    color: '#3B82F6',
    icon: '🗺️',
    display_order: 1,
    is_active: true
  },
  {
    id: 'cat-world-002',
    name: 'العالم',
    name_en: 'World',
    description: 'أخبار العالم والتحليلات الدولية',
    slug: 'world',
    color: '#6366F1',
    icon: '🌍',
    display_order: 2,
    is_active: true
  },
  {
    id: 'cat-life-003',
    name: 'حياتنا',
    name_en: 'Life',
    description: 'نمط الحياة، الصحة، الأسرة والمجتمع',
    slug: 'life',
    color: '#F472B6',
    icon: '🌱',
    display_order: 3,
    is_active: true
  },
  {
    id: 'cat-stations-004',
    name: 'محطات',
    name_en: 'Stations',
    description: 'تقارير خاصة وملفات متنوعة',
    slug: 'stations',
    color: '#FBBF24',
    icon: '🛤️',
    display_order: 4,
    is_active: true
  },
  {
    id: 'cat-sports-005',
    name: 'رياضة',
    name_en: 'Sports',
    description: 'أخبار رياضية محلية وعالمية',
    slug: 'sports',
    color: '#F59E0B',
    icon: '⚽',
    display_order: 5,
    is_active: true
  },
  {
    id: 'cat-tourism-006',
    name: 'سياحة',
    name_en: 'Tourism',
    description: 'تقارير سياحية ومواقع مميزة',
    slug: 'tourism',
    color: '#34D399',
    icon: '🧳',
    display_order: 6,
    is_active: true
  },
  {
    id: 'cat-business-007',
    name: 'أعمال',
    name_en: 'Business',
    description: 'أخبار الأعمال والشركات وريادة الأعمال',
    slug: 'business',
    color: '#10B981',
    icon: '💼',
    display_order: 7,
    is_active: true
  },
  {
    id: 'cat-technology-008',
    name: 'تقنية',
    name_en: 'Technology',
    description: 'أخبار وتطورات التقنية والذكاء الاصطناعي',
    slug: 'technology',
    color: '#8B5CF6',
    icon: '💻',
    display_order: 8,
    is_active: true
  },
  {
    id: 'cat-cars-009',
    name: 'سيارات',
    name_en: 'Cars',
    description: 'أخبار وتقارير السيارات',
    slug: 'cars',
    color: '#0EA5E9',
    icon: '🚗',
    display_order: 9,
    is_active: true
  },
  {
    id: 'cat-media-010',
    name: 'ميديا',
    name_en: 'Media',
    description: 'فيديوهات وصور وإعلام رقمي',
    slug: 'media',
    color: '#EAB308',
    icon: '🎬',
    display_order: 10,
    is_active: true
  },
  {
    id: 'cat-articles-011',
    name: 'مقالات',
    name_en: 'Articles',
    description: 'تحليلات ووجهات نظر وتقارير رأي',
    slug: 'articles',
    color: '#7C3AED',
    icon: '✍️',
    display_order: 11,
    is_active: true
  }
];

async function addCategories() {
  console.log('🚀 بدء إضافة التصنيفات إلى قاعدة بيانات DigitalOcean...\n');
  
  try {
    // مسح التصنيفات الموجودة
    console.log('🧹 مسح التصنيفات الموجودة...');
    await pool.query('DELETE FROM categories');
    console.log('✅ تم مسح التصنيفات القديمة\n');
    
    // إضافة التصنيفات الجديدة
    for (const category of categories) {
      try {
        const now = new Date().toISOString();
        
        await pool.query(`
          INSERT INTO categories (
            id, name, name_en, slug, description, color, icon,
            display_order, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          category.id,
          category.name,
          category.name_en,
          category.slug,
          category.description,
          category.color,
          category.icon,
          category.display_order,
          category.is_active,
          now,
          now
        ]);
        
        console.log(`✅ تمت إضافة: ${category.name} (${category.name_en})`);
      } catch (error) {
        console.error(`❌ فشل إضافة ${category.name}: ${error.message}`);
      }
    }
    
    // عرض ملخص
    console.log('\n📊 ملخص التصنيفات:');
    const result = await pool.query('SELECT COUNT(*) as count FROM categories');
    console.log(`إجمالي التصنيفات: ${result.rows[0].count}`);
    
    // عرض التصنيفات
    const categoriesList = await pool.query(`
      SELECT name, name_en, slug, icon, color, display_order 
      FROM categories 
      ORDER BY display_order
    `);
    
    console.log('\n📋 قائمة التصنيفات:');
    categoriesList.rows.forEach(cat => {
      console.log(`${cat.display_order}. ${cat.icon} ${cat.name} (${cat.name_en}) - ${cat.slug}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await pool.end();
  }
}

addCategories(); 