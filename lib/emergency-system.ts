/**
 * نظام التشغيل الطارئ
 * يستخدم هذا الملف لتفعيل وضع الطوارئ عند بدء التشغيل
 * يتم استدعاؤه في مكون layout الرئيسي
 */

class EmergencySystem {
  private static instance: EmergencySystem;
  private isActive: boolean = false;
  private startTime: Date = new Date();
  private emergencyModeEnabled: boolean = false;
  private dbConnectionStatus: "unknown" | "connected" | "disconnected" =
    "unknown";
  private emergencyArticles: string[] = [];

  // منع إنشاء نسخة مباشرة
  private constructor() {
    this.initialize();
  }

  // الحصول على النسخة الوحيدة (singleton)
  public static getInstance(): EmergencySystem {
    if (!EmergencySystem.instance) {
      EmergencySystem.instance = new EmergencySystem();
    }
    return EmergencySystem.instance;
  }

  // تهيئة النظام
  private initialize(): void {
    this.isActive = true;
    console.log("🚨 تم تهيئة نظام الطوارئ");

    // بدء مراقبة قاعدة البيانات في المتصفح فقط
    if (typeof window !== "undefined") {
      this.startDatabaseMonitoring();
    }
  }

  // بدء مراقبة قاعدة البيانات
  private startDatabaseMonitoring(): void {
    // فحص حالة قاعدة البيانات عند بدء التشغيل
    this.checkDatabaseStatus();

    // فحص دوري كل دقيقة
    setInterval(() => {
      this.checkDatabaseStatus();
    }, 60000); // كل دقيقة
  }

  // فحص حالة قاعدة البيانات
  private async checkDatabaseStatus(): Promise<void> {
    try {
      const response = await fetch("/api/db-status", {
        cache: "no-store",
        headers: { pragma: "no-cache" },
      });

      const data = await response.json();

      const wasConnected = this.dbConnectionStatus === "connected";
      this.dbConnectionStatus = data.success ? "connected" : "disconnected";

      // تفعيل وضع الطوارئ إذا تم قطع الاتصال
      if (wasConnected && this.dbConnectionStatus === "disconnected") {
        this.activateEmergencyMode();
      }

      // تعطيل وضع الطوارئ إذا تم استعادة الاتصال
      if (!wasConnected && this.dbConnectionStatus === "connected") {
        this.deactivateEmergencyMode();
      }
    } catch (error) {
      console.error("خطأ في فحص حالة قاعدة البيانات:", error);
      this.dbConnectionStatus = "disconnected";
      this.activateEmergencyMode();
    }
  }

  // تفعيل وضع الطوارئ
  private activateEmergencyMode(): void {
    if (!this.emergencyModeEnabled) {
      this.emergencyModeEnabled = true;
      console.log("🚨 تم تفعيل وضع الطوارئ");

      // عرض تنبيه للمستخدم
      this.showEmergencyNotification();

      // جلب قائمة المقالات الطارئة المتوفرة
      this.fetchEmergencyArticles();
    }
  }

  // تعطيل وضع الطوارئ
  private deactivateEmergencyMode(): void {
    if (this.emergencyModeEnabled) {
      this.emergencyModeEnabled = false;
      console.log("✅ تم تعطيل وضع الطوارئ");
    }
  }

  // عرض تنبيه للمستخدم
  private showEmergencyNotification(): void {
    if (typeof window !== "undefined" && !this.isNotificationShown()) {
      // إنشاء عنصر التنبيه
      const alertDiv = document.createElement("div");
      alertDiv.id = "db-emergency-alert";
      alertDiv.className =
        "fixed top-4 left-4 right-4 bg-red-100 border-r-4 border-red-400 text-red-700 p-4 rounded shadow-lg z-50";
      alertDiv.dir = "rtl";

      alertDiv.innerHTML = `
        <div class="flex items-start">
          <div class="mr-2">
            <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-bold">تنبيه: مشكلة في الاتصال بقاعدة البيانات</p>
            <p class="text-sm">تم تفعيل وضع الطوارئ. بعض المحتوى قد لا يظهر بشكل صحيح.</p>
            <div class="mt-2">
              <a href="/emergency" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">صفحة الطوارئ</a>
            </div>
          </div>
          <button id="close-emergency-alert" class="text-red-500 hover:text-red-700">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      `;

      document.body.appendChild(alertDiv);

      // إضافة سلوك زر الإغلاق
      document
        .getElementById("close-emergency-alert")
        ?.addEventListener("click", () => {
          alertDiv.remove();
          localStorage.setItem("emergency-alert-dismissed", "true");
        });
    }
  }

  // التحقق من عرض التنبيه
  private isNotificationShown(): boolean {
    return (
      !!document.getElementById("db-emergency-alert") ||
      localStorage.getItem("emergency-alert-dismissed") === "true"
    );
  }

  // جلب قائمة المقالات الطارئة
  private async fetchEmergencyArticles(): Promise<void> {
    try {
      const response = await fetch("/api/emergency/status", {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.supportedArticleIds) {
          this.emergencyArticles = data.supportedArticleIds;
        }
      }
    } catch (error) {
      console.error("فشل في جلب قائمة المقالات الطارئة:", error);
    }
  }

  // الوظائف العامة

  // الحصول على حالة النظام
  public getStatus(): {
    isActive: boolean;
    emergencyModeEnabled: boolean;
    dbConnectionStatus: string;
    uptime: number;
    emergencyArticles: string[];
  } {
    const now = new Date();
    const uptimeMs = now.getTime() - this.startTime.getTime();
    const uptimeSec = Math.floor(uptimeMs / 1000);

    return {
      isActive: this.isActive,
      emergencyModeEnabled: this.emergencyModeEnabled,
      dbConnectionStatus: this.dbConnectionStatus,
      uptime: uptimeSec,
      emergencyArticles: this.emergencyArticles,
    };
  }

  // تفعيل وضع الطوارئ يدويًا
  public manualActivate(): void {
    this.activateEmergencyMode();
  }

  // تعطيل وضع الطوارئ يدويًا
  public manualDeactivate(): void {
    this.deactivateEmergencyMode();
  }

  // إعادة التحقق من حالة قاعدة البيانات
  public async recheckDatabaseStatus(): Promise<string> {
    await this.checkDatabaseStatus();
    return this.dbConnectionStatus;
  }
}

// تصدير النسخة الوحيدة
const emergencySystem =
  typeof window !== "undefined" ? EmergencySystem.getInstance() : null;

export default emergencySystem;
