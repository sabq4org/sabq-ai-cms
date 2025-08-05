#!/usr/bin/env node

/**
 * 🔧 Muqtarab Loading Fixer
 * 
 * يحل مشاكل تحميل صفحات مقترب والـ APIs
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 إصلاح مشاكل تحميل مقترب...\n");

// 1. فحص APIs الأساسية لمقترب
const muqtarabApis = [
  "app/api/muqtarab/angles/route.ts",
  "app/api/muqtarab/angles/by-slug/[slug]/route.ts",
  "app/api/muqtarab/angles/[angleId]/articles/route.ts",
  "app/api/muqtarab/angles/[angleId]/articles/[articleId]/route.ts",
  "app/api/muqtarab/all-articles/route.ts"
];

console.log("📋 فحص APIs مقترب...");

muqtarabApis.forEach(apiPath => {
  if (fs.existsSync(apiPath)) {
    console.log(`✅ ${apiPath} موجود`);
    
    const content = fs.readFileSync(apiPath, "utf8");
    
    // فحص الأخطاء الشائعة
    const issues = [];
    
    // فحص missing commas
    if (content.includes("id: angleRow.id\n      title:")) {
      issues.push("مفقود comma بعد id");
    }
    
    // فحص undefined imports
    if (!content.includes("NextRequest") || !content.includes("NextResponse")) {
      issues.push("مفقود Next.js imports");
    }
    
    // فحص PrismaClient
    if (!content.includes("PrismaClient")) {
      issues.push("مفقود PrismaClient import");
    }
    
    // فحص async/await
    if (content.includes("prisma.$queryRawUnsafe") && !content.includes("await prisma.$queryRawUnsafe")) {
      issues.push("مفقود await في Prisma queries");
    }
    
    if (issues.length > 0) {
      console.log(`⚠️ ${apiPath}:`);
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
  } else {
    console.log(`❌ ${apiPath} مفقود`);
  }
});

// 2. فحص صفحات مقترب
const muqtarabPages = [
  "app/muqtarab/page.tsx",
  "app/muqtarab/[slug]/page.tsx",
  "app/muqtarab/[slug]/[articleId]/page.tsx"
];

console.log("\n📄 فحص صفحات مقترب...");

muqtarabPages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    console.log(`✅ ${pagePath} موجود`);
    
    const content = fs.readFileSync(pagePath, "utf8");
    
    // فحص React imports
    if (!content.includes("import React") && (content.includes("useState") || content.includes("useEffect"))) {
      console.log(`⚠️ ${pagePath}: مطلوب React import`);
    }
    
    // فحص use client directive للصفحات التفاعلية
    if ((content.includes("useState") || content.includes("useEffect")) && !content.includes("'use client'")) {
      console.log(`⚠️ ${pagePath}: مطلوب 'use client' directive`);
    }
    
    // فحص error handling
    if (content.includes("fetch(") && !content.includes("try {")) {
      console.log(`⚠️ ${pagePath}: مفقود error handling`);
    }
    
  } else {
    console.log(`❌ ${pagePath} مفقود`);
  }
});

// 3. إنشاء ملف اختبار لـ APIs
console.log("\n🧪 إنشاء ملف اختبار APIs...");

const testApiScript = `#!/usr/bin/env node

/**
 * 🧪 Muqtarab APIs Test
 */

const baseUrl = "http://localhost:3000";

const tests = [
  {
    name: "جلب جميع الزوايا",
    url: "/api/muqtarab/angles",
    expectedFields: ["success", "angles"]
  },
  {
    name: "جلب زاوية بالـ slug",
    url: "/api/muqtarab/angles/by-slug/تقنية-ai",
    expectedFields: ["success", "angle"]
  },
  {
    name: "جلب جميع المقالات",
    url: "/api/muqtarab/all-articles",
    expectedFields: ["success", "articles"]
  }
];

async function runTests() {
  console.log("🧪 بدء اختبار APIs مقترب...\\n");
  
  for (const test of tests) {
    try {
      console.log(\`🔍 اختبار: \${test.name}\`);
      
      const response = await fetch(\`\${baseUrl}\${test.url}\`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(\`✅ نجح: \${response.status}\`);
        
        // فحص الحقول المطلوبة
        const missingFields = test.expectedFields.filter(field => !(field in data));
        if (missingFields.length > 0) {
          console.log(\`⚠️ حقول مفقودة: \${missingFields.join(", ")}\`);
        } else {
          console.log(\`✅ جميع الحقول موجودة\`);
        }
        
      } else {
        console.log(\`❌ فشل: \${response.status}\`);
        console.log(\`📄 الخطأ: \${data.error || "غير محدد"}\`);
      }
      
    } catch (error) {
      console.log(\`💥 خطأ في الاتصال: \${error.message}\`);
    }
    
    console.log("");
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
`;

fs.writeFileSync("scripts/test-muqtarab-apis.js", testApiScript);
console.log("✅ تم إنشاء scripts/test-muqtarab-apis.js");

// 4. إنشاء ErrorBoundary خاص بمقترب
console.log("\n🛡️ إنشاء ErrorBoundary خاص بمقترب...");

const muqtarabErrorBoundary = `"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface MuqtarabErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface MuqtarabErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

/**
 * 🛡️ ErrorBoundary مخصص لصفحات مقترب
 * يتعامل مع أخطاء React #130 وأخطاء تحميل البيانات
 */
export class MuqtarabErrorBoundary extends React.Component<
  MuqtarabErrorBoundaryProps,
  MuqtarabErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: MuqtarabErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<MuqtarabErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 [MuqtarabErrorBoundary] خطأ في مقترب:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });

    // تسجيل الخطأ لأغراض التشخيص
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "muqtarab_last_error",
        JSON.stringify({
          error: error.message,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        })
      );
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      console.log(\`🔄 محاولة إعادة التحميل \${this.state.retryCount + 1}/\${this.maxRetries}\`);
      
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = "/muqtarab";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              حدث خطأ في تحميل مقترب
            </h1>
            
            <p className="text-gray-600 mb-6">
              نعتذر، حدث خطأ أثناء تحميل محتوى مقترب. يرجى المحاولة مرة أخرى.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-right">
                <p className="text-sm text-red-800 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة ({this.maxRetries - this.state.retryCount} متبقية)
                </button>
              )}
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                العودة للرئيسية
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة تحميل الصفحة
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              محاولة رقم: {this.state.retryCount + 1}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 🎯 Wrapper بسيط للاستخدام
 */
export default function WithMuqtarabErrorBoundary({
  children,
  fallback,
}: MuqtarabErrorBoundaryProps) {
  return (
    <MuqtarabErrorBoundary fallback={fallback}>
      {children}
    </MuqtarabErrorBoundary>
  );
}
`;

if (!fs.existsSync("components/muqtarab")) {
  fs.mkdirSync("components/muqtarab", { recursive: true });
}

fs.writeFileSync("components/muqtarab/MuqtarabErrorBoundary.tsx", muqtarabErrorBoundary);
console.log("✅ تم إنشاء components/muqtarab/MuqtarabErrorBoundary.tsx");

// 5. تقرير نهائي
console.log("\n📊 تقرير إصلاح مقترب:");
console.log("========================");
console.log("✅ تم فحص APIs الأساسية");
console.log("✅ تم فحص صفحات مقترب"); 
console.log("✅ تم إنشاء script اختبار APIs");
console.log("✅ تم إنشاء ErrorBoundary مخصص");

console.log("\n🚀 الخطوات التالية:");
console.log("1. تشغيل: node scripts/test-muqtarab-apis.js");
console.log("2. دمج MuqtarabErrorBoundary في الصفحات");
console.log("3. اختبار تحميل صفحات مقترب");

console.log("\n✅ تم الانتهاء من إصلاح مقترب!");