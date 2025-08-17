const fs = require('fs');
const path = require('path');

function addDisplayName(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // إضافة أسماء العرض للمكونات المجهولة
  const displayNameRegex = /const\s+(\w+)\s*=\s*\(\{([^}]*)\}\)\s*=>\s*{/;
  const match = content.match(displayNameRegex);
  
  if (match) {
    const componentName = match[1];
    content = content.replace(
      displayNameRegex, 
      `const ${componentName} = ({${match[2]}}) => {\n  ${componentName}.displayName = '${componentName}';\n`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Added display name to ${filePath}`);
  }
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
        addDisplayName(fullPath);
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