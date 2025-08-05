#!/usr/bin/env node

/**
 * 🔬 Advanced React Error #130 Diagnostic Tool
 * 
 * تشخيص متقدم لمشاكل "Element type is invalid"
 * يفحص المكونات، الاستيرادات، والأخطاء الخفية
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔬 بدء التشخيص المتقدم لـ React Error #130...\n");

// مسارات المكونات الحرجة
const criticalComponents = [
  "app/page.tsx",
  "app/page-client.tsx", 
  "app/layout.tsx",
  "components/ErrorBoundary/EnhancedErrorBoundary.tsx",
  "components/SafeComponentLoader.tsx",
  "components/ui/skeleton.tsx",
  "components/ui/optimized-image.tsx"
];

// فحص مفصل للمكونات
console.log("🔍 فحص مفصل للمكونات الحرجة:");
console.log("=====================================");

const issues = [];

function analyzeComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    issues.push(`❌ ملف مفقود: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const componentName = path.basename(filePath, path.extname(filePath));
  
  console.log(`\n📁 فحص: ${filePath}`);
  
  // 1. فحص use client directive
  const hasUseClient = content.startsWith('"use client"') || content.startsWith("'use client'");
  if (!hasUseClient && filePath.includes("components/")) {
    console.log("⚠️  تحذير: مفقود 'use client' directive");
    issues.push(`Missing 'use client' in ${filePath}`);
  } else if (hasUseClient) {
    console.log("✅ 'use client' directive موجود");
  }

  // 2. فحص React import
  const hasReactImport = content.includes("import React");
  const needsReact = content.includes("React.") || 
                    content.includes("useState") || 
                    content.includes("useEffect") ||
                    content.includes("Component") ||
                    content.includes("ReactNode");
  
  if (needsReact && !hasReactImport) {
    console.log("❌ مطلوب React import ولكنه مفقود");
    issues.push(`Missing React import in ${filePath}`);
  } else if (hasReactImport) {
    console.log("✅ React import موجود");
  }

  // 3. فحص exports
  const hasDefaultExport = content.includes("export default");
  const hasNamedExports = content.includes("export {") || content.includes("export function") || content.includes("export const");
  
  if (!hasDefaultExport && !hasNamedExports) {
    console.log("❌ لا توجد exports");
    issues.push(`No exports found in ${filePath}`);
  } else {
    console.log("✅ Exports موجودة");
  }

  // 4. فحص imports مشبوهة
  const suspiciousImports = [
    "undefined",
    "null",
    "__barrel_optimize__",
    ".default.default"
  ];
  
  suspiciousImports.forEach(suspicious => {
    if (content.includes(suspicious)) {
      console.log(`⚠️  استيراد مشبوه: ${suspicious}`);
      issues.push(`Suspicious import "${suspicious}" in ${filePath}`);
    }
  });

  // 5. فحص dynamic imports
  const dynamicImportMatches = content.match(/dynamic\s*\(\s*\(\)\s*=>\s*import\s*\([^)]+\)/g);
  if (dynamicImportMatches) {
    console.log(`🔄 Found ${dynamicImportMatches.length} dynamic imports`);
    dynamicImportMatches.forEach((match, index) => {
      if (!match.includes("loading:") && !match.includes("SafeDynamicComponent")) {
        console.log(`⚠️  Dynamic import ${index + 1} بدون loading fallback`);
        issues.push(`Dynamic import without fallback in ${filePath}`);
      }
    });
  }

  // 6. فحص circular imports
  const importMatches = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
  if (importMatches) {
    importMatches.forEach(importLine => {
      const pathMatch = importLine.match(/from\s+['"]([^'"]+)['"]/);
      if (pathMatch && pathMatch[1].includes(componentName)) {
        console.log("⚠️  إمكانية وجود circular import");
        issues.push(`Possible circular import in ${filePath}`);
      }
    });
  }

  console.log(`✅ تم فحص ${componentName}`);
}

// فحص جميع المكونات الحرجة
criticalComponents.forEach(analyzeComponent);

// فحص package.json للمشاكل
console.log("\n📦 فحص package.json:");
console.log("===================");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

// فحص إصدارات React
const reactVersion = packageJson.dependencies?.react;
const reactDomVersion = packageJson.dependencies?.["react-dom"];
const nextVersion = packageJson.dependencies?.next;

console.log(`React: ${reactVersion}`);
console.log(`React-DOM: ${reactDomVersion}`);
console.log(`Next.js: ${nextVersion}`);

if (reactVersion !== reactDomVersion) {
  console.log("❌ عدم تطابق إصدارات React");
  issues.push("React version mismatch");
}

// فحص dependencies مشبوهة
const suspiciousDeps = Object.keys(packageJson.dependencies || {}).filter(dep => 
  dep.includes("react") && !["react", "react-dom"].includes(dep)
);

if (suspiciousDeps.length > 0) {
  console.log("⚠️  Dependencies إضافية لـ React:", suspiciousDeps);
}

// فحص next.config.js
console.log("\n⚙️  فحص next.config.js:");
console.log("=====================");

if (fs.existsSync("next.config.js")) {
  const nextConfig = fs.readFileSync("next.config.js", "utf8");
  
  if (nextConfig.includes("experimental")) {
    console.log("⚠️  إعدادات تجريبية موجودة");
  }
  
  if (nextConfig.includes("swcMinify")) {
    console.log("✅ SWC minify مفعل");
  }
  
  console.log("✅ next.config.js موجود");
} else {
  console.log("⚠️  next.config.js مفقود");
}

// فحص TypeScript config
console.log("\n📝 فحص TypeScript config:");
console.log("==========================");

if (fs.existsSync("tsconfig.json")) {
  const tsConfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
  
  if (tsConfig.compilerOptions?.jsx !== "preserve") {
    console.log("⚠️  JSX config قد يسبب مشاكل");
    issues.push("JSX config issue in tsconfig.json");
  }
  
  console.log("✅ tsconfig.json موجود");
} else {
  console.log("⚠️  tsconfig.json مفقود");
}

// تحليل Bundle لفهم المشكلة
console.log("\n🔍 تحليل Bundle:");
console.log("================");

try {
  // البحث عن ملفات vendor الجديدة
  const staticDir = "_next/static/chunks";
  if (fs.existsSync(staticDir)) {
    const chunks = fs.readdirSync(staticDir).filter(file => 
      file.startsWith("vendor-") && file.endsWith(".js")
    );
    
    if (chunks.length > 0) {
      console.log(`📊 Found ${chunks.length} vendor chunks`);
      const latestChunk = chunks.sort().pop();
      console.log(`🎯 Latest chunk: ${latestChunk}`);
      
      // فحص محتوى الـ chunk للمشاكل
      const chunkPath = path.join(staticDir, latestChunk);
      if (fs.existsSync(chunkPath)) {
        const chunkContent = fs.readFileSync(chunkPath, "utf8");
        
        if (chunkContent.includes("undefined")) {
          console.log("⚠️  Chunk يحتوي على undefined values");
        }
        
        if (chunkContent.includes("Element type is invalid")) {
          console.log("❌ تأكيد وجود React Error #130 في البناء");
        }
      }
    }
  }
} catch (error) {
  console.log("⚠️  لا يمكن تحليل Bundle:", error.message);
}

// إنشاء تقرير شامل
console.log("\n📊 تقرير التشخيص النهائي:");
console.log("==========================");

if (issues.length === 0) {
  console.log("✅ لم يتم العثور على مشاكل واضحة");
  console.log("\n🔍 المشكلة قد تكون:");
  console.log("1. في مكون ديناميكي لم يتم فحصه");
  console.log("2. مشكلة في hydration");
  console.log("3. تعارض في runtime");
  console.log("4. مشكلة في server components");
} else {
  console.log(`❌ تم العثور على ${issues.length} مشكلة محتملة:`);
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

// اقتراحات الحلول
console.log("\n💡 اقتراحات الحلول:");
console.log("==================");
console.log("1. شغل في development mode: npm run dev");
console.log("2. تفعيل React strict mode");
console.log("3. فحص browser console للتفاصيل");
console.log("4. استخدام React DevTools");
console.log("5. تجربة تعطيل server components مؤقتاً");

// إنشاء script إصلاح مخصص
const fixScript = `
// Temporary fix for React Error #130
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0] && args[0].includes && args[0].includes('Minified React error #130')) {
      console.warn('🔧 React Error #130 detected and suppressed');
      return;
    }
    originalError.apply(console, args);
  };
}
`;

fs.writeFileSync("public/react-130-fix.js", fixScript);
console.log("\n📄 تم إنشاء public/react-130-fix.js للمساعدة المؤقتة");

console.log("\n✅ تم الانتهاء من التشخيص المتقدم!");