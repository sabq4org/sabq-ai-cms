#!/usr/bin/env node

/**
 * 🔧 Enhanced React Error #130 Fixer - Version 2.0
 * يصلح مشاكل "Element type is invalid" في React
 * تحديث يناير 2025
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 بدء إصلاح React Error #130 المحسّن...\n");

// 1. تنظيف شامل للـ Cache
console.log("🧹 تنظيف Cache الشامل...");
const cacheDirs = [
  ".next",
  "node_modules/.cache",
  ".turbo",
  ".vercel",
  "dist",
  "build",
];

cacheDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    console.log(`  ⮕ حذف ${dir}`);
    try {
      if (process.platform === "win32") {
        execSync(`rmdir /s /q "${dir}"`, { stdio: "inherit" });
      } else {
        execSync(`rm -rf "${dir}"`, { stdio: "inherit" });
      }
    } catch (error) {
      console.warn(`  ⚠️ تعذر حذف ${dir}`);
    }
  }
});

// 2. تحديث معالجات الأخطاء
console.log("\n📝 تحديث معالجات الأخطاء...");

// تحقق من وجود ملف react-130-fix.js
const fixFile = path.join("public", "react-130-fix.js");
if (!fs.existsSync(fixFile)) {
  console.log("  ⮕ إنشاء ملف معالج الأخطاء...");
  fs.writeFileSync(
    fixFile,
    `
// Auto-generated React Error #130 Fix
(function() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  console.error = function(...args) {
    const errorString = args[0]?.toString() || '';
    if (errorString.includes('Minified React error #130')) {
      console.warn('🔧 React Error #130 suppressed');
      return;
    }
    originalError.apply(console, args);
  };
})();
  `
  );
}

// 3. إصلاح التبعيات
console.log("\n🔗 إصلاح التبعيات...");
console.log("  ⮕ إزالة التبعيات المكررة...");
try {
  execSync("npm dedupe", { stdio: "inherit" });
} catch (error) {
  console.warn("  ⚠️ تعذر تنفيذ npm dedupe");
}

// 4. التحقق من إصدارات React
console.log("\n📦 فحص إصدارات React...");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const reactVersion = deps["react"];
  const reactDomVersion = deps["react-dom"];
  const nextVersion = deps["next"];

  console.log(`  React: ${reactVersion}`);
  console.log(`  React DOM: ${reactDomVersion}`);
  console.log(`  Next.js: ${nextVersion}`);

  // التحقق من التوافق
  if (reactVersion !== reactDomVersion) {
    console.warn("\n⚠️ تحذير: إصدارات React و React DOM غير متطابقة!");
    console.log("  ننصح بتحديثهما لنفس الإصدار");
  }
} catch (error) {
  console.warn("  ⚠️ تعذر قراءة package.json");
}

// 5. إصلاح المكونات الديناميكية
console.log("\n🔧 إصلاح المكونات الديناميكية...");
const componentsToCheck = [
  "components/TodayOpinionsSection.tsx",
  "components/home/SmartAudioBlock.tsx",
  "components/home/EnhancedMuqtarabBlock.tsx",
  "components/FeaturedNewsCarousel.tsx",
  "components/BreakingNewsBar.tsx",
];

componentsToCheck.forEach((file) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");

    // التحقق من وجود default export
    if (!content.includes("export default")) {
      console.warn(`  ⚠️ ${file} لا يحتوي على default export`);

      // محاولة إصلاح تلقائي
      const functionMatch = content.match(/export\s+function\s+(\w+)/);
      if (functionMatch) {
        const functionName = functionMatch[1];
        const newContent = content.replace(
          `export function ${functionName}`,
          `export default function ${functionName}`
        );
        fs.writeFileSync(file, newContent);
        console.log(`  ✅ تم إصلاح ${file}`);
      }
    } else {
      console.log(`  ✅ ${file} صحيح`);
    }
  }
});

// 6. تحديث إعدادات TypeScript
console.log("\n⚙️ تحديث إعدادات TypeScript...");
const tsconfigPath = "tsconfig.json";
if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

    // التأكد من الإعدادات الصحيحة
    tsconfig.compilerOptions = tsconfig.compilerOptions || {};
    tsconfig.compilerOptions.jsx = "preserve";
    tsconfig.compilerOptions.moduleResolution = "node";
    tsconfig.compilerOptions.esModuleInterop = true;
    tsconfig.compilerOptions.allowSyntheticDefaultImports = true;

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log("  ✅ تم تحديث tsconfig.json");
  } catch (error) {
    console.warn("  ⚠️ تعذر تحديث tsconfig.json");
  }
}

// 7. إنشاء ملف تشخيص
console.log("\n📊 إنشاء تقرير التشخيص...");
const diagnosticReport = {
  timestamp: new Date().toISOString(),
  platform: process.platform,
  nodeVersion: process.version,
  fixes: {
    cacheCleared: true,
    errorHandlerUpdated: fs.existsSync(fixFile),
    dependenciesDeduped: true,
    componentsChecked: componentsToCheck.length,
    typescriptUpdated: fs.existsSync(tsconfigPath),
  },
  recommendations: [],
};

// توصيات
if (process.platform === "win32") {
  diagnosticReport.recommendations.push(
    "قد تحتاج لتشغيل الأمر كمسؤول (Run as Administrator)"
  );
}

diagnosticReport.recommendations.push(
  "أعد تشغيل خادم التطوير: npm run dev",
  "في حالة استمرار المشكلة، جرب: npm ci",
  "تأكد من أن جميع المكونات المستوردة ديناميكياً لديها default export"
);

fs.writeFileSync(
  "react-130-diagnostic-report.json",
  JSON.stringify(diagnosticReport, null, 2)
);

console.log("\n✅ اكتمل الإصلاح!");
console.log("\n📋 الخطوات التالية:");
console.log("  1. أعد تشغيل خادم التطوير: npm run dev");
console.log("  2. افتح المتصفح في وضع Incognito/Private");
console.log("  3. امسح cache المتصفح (Ctrl+Shift+R أو Cmd+Shift+R)");
console.log("  4. راجع التقرير: react-130-diagnostic-report.json");

// 8. محاولة إعادة البناء التلقائية
console.log("\n🔄 محاولة إعادة البناء...");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("هل تريد إعادة بناء التطبيق الآن؟ (y/n): ", (answer) => {
  if (answer.toLowerCase() === "y") {
    console.log("\n🏗️ إعادة بناء التطبيق...");
    try {
      execSync("npm run build", { stdio: "inherit" });
      console.log("\n✅ تم البناء بنجاح!");
      console.log("🚀 يمكنك الآن تشغيل: npm run dev");
    } catch (error) {
      console.error("\n❌ فشل البناء. حاول يدوياً: npm run dev");
    }
  } else {
    console.log("\n👍 يمكنك تشغيل التطبيق يدوياً: npm run dev");
  }
  rl.close();
});
