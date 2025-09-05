#!/usr/bin/env node
/**
 * تحديث جميع مكونات الصور لاستخدام النظام المُحسَّن
 * إضافة imageType المناسب لجميع استخدامات SafeNewsImage
 */

const fs = require('fs');
const path = require('path');

// المسارات التي نريد تحديثها
const componentPaths = [
  'components/article/ProgressiveArticleLoader.tsx',
  'components/old-style/OldStyleNewsBlock.tsx',
  'pages/components/article/ArticleCard.tsx',
  'app/components/news/NewsCard.tsx'
];

// إضافات imageType المناسبة لكل مكون
const imageTypeReplacements = [
  // For article images
  {
    search: '<SafeNewsImage\n                src={article.featured_image',
    replace: '<SafeNewsImage\n                src={article.featured_image',
    addImageType: '\n                imageType="article"'
  },
  // For featured images
  {
    search: 'className="w-full h-full object-cover"',
    replace: 'className="w-full h-full object-cover"\n                imageType="article"'
  }
];

function updateComponentFiles() {
  console.log('🔧 بدء تحديث مكونات الصور...');
  
  // البحث عن جميع ملفات المكونات
  const findComponentFiles = (dir) => {
    const files = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...findComponentFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      // Directory doesn't exist or no permission
    }
    return files;
  };

  const componentsDir = path.join(__dirname, 'components');
  const appDir = path.join(__dirname, 'app');
  
  let allFiles = [];
  if (fs.existsSync(componentsDir)) {
    allFiles.push(...findComponentFiles(componentsDir));
  }
  if (fs.existsSync(appDir)) {
    allFiles.push(...findComponentFiles(appDir));
  }

  // تصفية الملفات التي تحتوي على SafeNewsImage
  const filesToUpdate = allFiles.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('SafeNewsImage') && !content.includes('imageType=');
    } catch {
      return false;
    }
  });

  console.log(`📁 تم العثور على ${filesToUpdate.length} ملف للتحديث`);

  filesToUpdate.forEach(file => {
    try {
      console.log(`📝 تحديث: ${path.relative(__dirname, file)}`);
      let content = fs.readFileSync(file, 'utf8');
      let updated = false;

      // أنماط التحديث المختلفة
      const patterns = [
        // For article components
        {
          regex: /(<SafeNewsImage[^>]*\n[^>]*className="[^"]*"[^>]*)(>)/g,
          replacement: '$1\n                imageType="article"$2'
        },
        // For featured components  
        {
          regex: /(<SafeNewsImage[^>]*src={[^}]*featured_image[^>]*\n[^>]*)(>)/g,
          replacement: '$1\n                imageType="featured"$2'
        },
        // For author images
        {
          regex: /(<SafeNewsImage[^>]*src={[^}]*profile_image[^>]*\n[^>]*)(>)/g,
          replacement: '$1\n                imageType="author"$2'
        },
        // For general news images
        {
          regex: /(<SafeNewsImage[^>]*src={[^}]*\n[^>]*width={[^}]*}\n[^>]*height={[^}]*}[^>]*)(>)/g,
          replacement: '$1\n                imageType="news"$2'
        }
      ];

      patterns.forEach(pattern => {
        const newContent = content.replace(pattern.regex, pattern.replacement);
        if (newContent !== content) {
          content = newContent;
          updated = true;
        }
      });

      if (updated) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ تم تحديث: ${path.basename(file)}`);
      } else {
        console.log(`⏭️  لا يحتاج تحديث: ${path.basename(file)}`);
      }
    } catch (err) {
      console.error(`❌ خطأ في ${file}:`, err.message);
    }
  });

  console.log('🎉 انتهى تحديث جميع مكونات الصور!');
}

// تحديث API routes أيضاً
function updateApiRoutes() {
  console.log('🔧 تحديث API routes...');
  
  const apiPaths = [
    'app/api/articles/route.ts',
    'app/api/articles/latest/route.ts',
    'app/api/news/route.ts'
  ];

  apiPaths.forEach(apiPath => {
    const fullPath = path.join(__dirname, apiPath);
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // إضافة import للنظام الجديد
        if (!content.includes('processArticleImage')) {
          const importLine = 'import { processArticleImage, getSafeImageUrl } from \'@/lib/image-utils\';';
          const firstImport = content.indexOf('import');
          if (firstImport !== -1) {
            const endOfImports = content.indexOf('\n\n', firstImport);
            content = content.slice(0, endOfImports) + '\n' + importLine + content.slice(endOfImports);
          }
        }

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ تم تحديث API: ${path.basename(apiPath)}`);
      } catch (err) {
        console.error(`❌ خطأ في ${apiPath}:`, err.message);
      }
    }
  });
}

// تشغيل التحديث
if (require.main === module) {
  updateComponentFiles();
  updateApiRoutes();
}

module.exports = { updateComponentFiles, updateApiRoutes };
