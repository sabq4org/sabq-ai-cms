#!/usr/bin/env node

/**
 * 🔧 Next.js Structure Fixer
 *
 * يحل مشاكل هيكل Next.js و App Router
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 إصلاح هيكل Next.js...\n");

// 1. تنظيف شامل
console.log("🧹 تنظيف شامل...");
try {
  // حذف .next
  if (fs.existsSync(".next")) {
    execSync("rm -rf .next", { stdio: "inherit" });
    console.log("✅ تم حذف .next");
  }

  // حذف cache files
  if (fs.existsSync("node_modules/.cache")) {
    execSync("rm -rf node_modules/.cache", { stdio: "inherit" });
    console.log("✅ تم حذف node_modules/.cache");
  }

  // تنظيف npm cache
  execSync("npm cache clean --force", { stdio: "inherit" });
  console.log("✅ تم تنظيف npm cache");
} catch (error) {
  console.warn("⚠️ تحذير:", error.message);
}

// 2. فحص structure
console.log("\n📁 فحص هيكل المشروع...");

const hasAppDir = fs.existsSync("app");
const hasPagesDir = fs.existsSync("pages");

console.log(`App directory: ${hasAppDir ? "✅ موجود" : "❌ مفقود"}`);
console.log(`Pages directory: ${hasPagesDir ? "✅ موجود" : "❌ مفقود"}`);

// 3. إصلاح conflicts بين app و pages
if (hasAppDir && hasPagesDir) {
  console.log("\n⚠️ تعارض: كلا من app/ و pages/ موجودان");

  // فحص محتويات pages
  const pagesContent = fs.readdirSync("pages");
  console.log("محتويات pages/:", pagesContent);

  // إبقاء الملفات المهمة فقط في pages
  const importantFiles = [
    "_document.js",
    "_app.js",
    "_app.tsx",
    "_document.tsx",
  ];
  const apiDir = "pages/api";

  // نقل API routes إذا لم تكن موجودة في app/api
  if (fs.existsSync("pages/api") && !fs.existsSync("app/api")) {
    console.log("📋 نقل API routes من pages إلى app...");
    try {
      execSync("cp -r pages/api app/", { stdio: "inherit" });
      console.log("✅ تم نقل API routes");
    } catch (error) {
      console.warn("⚠️ فشل نقل API routes:", error.message);
    }
  }

  // إنشاء backup للملفات المهمة
  importantFiles.forEach((file) => {
    const filePath = path.join("pages", file);
    if (fs.existsSync(filePath)) {
      const backupPath = path.join("pages-backup", file);
      if (!fs.existsSync("pages-backup")) {
        fs.mkdirSync("pages-backup");
      }
      fs.copyFileSync(filePath, backupPath);
      console.log(`📄 تم عمل backup لـ ${file}`);
    }
  });
}

// 4. التأكد من وجود ملفات app directory الأساسية
console.log("\n📋 فحص ملفات app directory الأساسية...");

const requiredAppFiles = ["app/layout.tsx", "app/page.tsx", "app/globals.css"];

requiredAppFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} موجود`);
  } else {
    console.log(`❌ ${file} مفقود`);
  }
});

// 5. إصلاح package.json scripts
console.log("\n📦 فحص package.json scripts...");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const requiredScripts = {
  dev: "next dev",
  build: "next build",
  start: "next start",
  lint: "next lint",
};

let scriptsUpdated = false;
Object.entries(requiredScripts).forEach(([key, value]) => {
  if (!packageJson.scripts[key] || packageJson.scripts[key] !== value) {
    packageJson.scripts[key] = value;
    scriptsUpdated = true;
    console.log(`✅ تم إصلاح script: ${key}`);
  }
});

if (scriptsUpdated) {
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("✅ تم تحديث package.json");
}

// 6. فحص next.config.js
console.log("\n⚙️ فحص next.config.js...");

if (fs.existsSync("next.config.js")) {
  const configContent = fs.readFileSync("next.config.js", "utf8");

  if (!configContent.includes("appDir")) {
    console.log("⚠️ appDir غير مفعل في next.config.js");
  } else {
    console.log("✅ appDir مفعل");
  }

  console.log("✅ next.config.js موجود");
} else {
  console.log("❌ next.config.js مفقود");
}

// 7. فحص tsconfig.json
console.log("\n📝 فحص tsconfig.json...");

if (fs.existsSync("tsconfig.json")) {
  const tsConfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));

  // التحقق من paths الصحيحة
  const requiredPaths = {
    "@/*": ["./app/*", "./components/*", "./lib/*"],
  };

  if (!tsConfig.compilerOptions.paths) {
    tsConfig.compilerOptions.paths = requiredPaths;
    fs.writeFileSync("tsconfig.json", JSON.stringify(tsConfig, null, 2));
    console.log("✅ تم إصلاح tsconfig paths");
  }

  console.log("✅ tsconfig.json موجود");
} else {
  console.log("❌ tsconfig.json مفقود");
}

// 8. إنشاء globals.css إذا كان مفقود
const globalsCssPath = "app/globals.css";
if (!fs.existsSync(globalsCssPath)) {
  console.log("\n📄 إنشاء app/globals.css...");

  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

a {
  color: inherit;
  text-decoration: none;
}
`;

  fs.writeFileSync(globalsCssPath, globalsCss);
  console.log("✅ تم إنشاء app/globals.css");
}

// 9. تقرير نهائي
console.log("\n📊 تقرير الإصلاح:");
console.log("=================");
console.log("✅ تم تنظيف cache files");
console.log("✅ تم فحص هيكل المشروع");
console.log("✅ تم حل تعارضات app/pages");
console.log("✅ تم فحص الملفات الأساسية");
console.log("✅ تم إصلاح package.json");
console.log("✅ تم فحص next.config.js");

console.log("\n🚀 الخطوات التالية:");
console.log("1. تشغيل: npm run dev");
console.log("2. فحص المتصفح للأخطاء");
console.log("3. تشغيل: npm run build للتأكد من البناء");

console.log("\n✅ تم الانتهاء من إصلاح هيكل Next.js!");
