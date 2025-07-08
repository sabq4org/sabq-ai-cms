const fs = require('fs');
const path = require('path');

function replaceImgWithNextImage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // استبدال <img> بـ <Image>
  content = content.replace(
    /<img\s+([^>]+)>/g, 
    (match, attributes) => {
      // استخراج السمات الهامة
      const srcMatch = attributes.match(/src=["']([^"']+)["']/);
      const altMatch = attributes.match(/alt=["']([^"']+)["']/);
      const widthMatch = attributes.match(/width=["']?(\d+)["']?/);
      const heightMatch = attributes.match(/height=["']?(\d+)["']?/);
      
      let nextImageAttrs = 'src={' + (srcMatch ? `"${srcMatch[1]}"` : 'undefined') + '}';
      nextImageAttrs += altMatch ? ` alt="${altMatch[1]}"` : ' alt=""';
      nextImageAttrs += widthMatch ? ` width={${widthMatch[1]}}` : ' width={100}';
      nextImageAttrs += heightMatch ? ` height={${heightMatch[1]}}` : ' height={100}';
      
      return `<Image ${nextImageAttrs} />`;
    }
  );
  
  // إضافة استيراد Image إذا لم يكن موجودًا
  if (!content.includes('import Image from')) {
    content = `import Image from 'next/image';\n${content}`;
  }
  
  // معالجة علامات الاقتباس
  content = content.replace(/&quot;/g, '"');
  
  fs.writeFileSync(filePath, content);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        replaceImgWithNextImage(fullPath);
        console.log(`Processed: ${fullPath}`);
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  });
}

// ابدأ من مجلد المكونات والتطبيق
processDirectory(path.join(__dirname, '..', 'components'));
processDirectory(path.join(__dirname, '..', 'app'));

console.log('تم معالجة جميع الملفات'); 