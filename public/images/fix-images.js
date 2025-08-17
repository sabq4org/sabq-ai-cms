// سكريبت لإنشاء صور placeholder مفقودة
const fs = require('fs');
const path = require('path');

// التأكد من وجود المجلدات
const dirs = [
  'public/images',
  'public/uploads',
  'public/uploads/categories',
  'public/uploads/articles'
];

dirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ تم إنشاء مجلد: ${dir}`);
  }
});

// إنشاء ملف placeholder SVG
const placeholderSVG = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f3f4f6"/>
  <text x="400" y="300" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af" text-anchor="middle">
    صورة مؤقتة
  </text>
</svg>`;

// الصور المطلوبة
const requiredImages = [
  'placeholder-featured.jpg',
  'category-default.jpg',
  'default-avatar.jpg',
  'placeholder.jpg',
  'default-article.jpg',
  'default-muqtarab.jpg'
];

// إنشاء الصور المفقودة
requiredImages.forEach(imageName => {
  const imagePath = path.join(process.cwd(), 'public/images', imageName);
  if (!fs.existsSync(imagePath)) {
    // حفظ كـ SVG مؤقتاً
    const svgPath = imagePath.replace('.jpg', '.svg');
    fs.writeFileSync(svgPath, placeholderSVG);
    console.log(`✅ تم إنشاء: ${imageName} (كـ SVG مؤقت)`);
  }
});

console.log('\n⚠️  ملاحظة: تم إنشاء صور SVG مؤقتة. يُنصح باستبدالها بصور حقيقية.');
