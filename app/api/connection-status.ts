import { ensureConnection } from "@/lib/prisma";

let connectionStatus: "connected" | "connecting" | "disconnected" =
  "connecting";
let lastCheckTime = 0;
let connectionCheckPromise: Promise<boolean> | null = null;

/**
 * التحقق من حالة الاتصال بقاعدة البيانات مع حد أدنى من التأخير بين المحاولات
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  const now = Date.now();

  // إذا كان هناك تحقق جاري، انتظر نتيجته
  if (connectionCheckPromise) {
    return connectionCheckPromise;
  }

  // إذا تم التحقق خلال الـ 5 ثواني الماضية، استخدم النتيجة المخزنة مؤقتًا
  if (now - lastCheckTime < 5000 && connectionStatus !== "connecting") {
    return connectionStatus === "connected";
  }

  try {
    // إنشاء وعد جديد للتحقق
    connectionCheckPromise = ensureConnection();
    const isConnected = await connectionCheckPromise;

    connectionStatus = isConnected ? "connected" : "disconnected";
    lastCheckTime = Date.now();

    return isConnected;
  } catch (error) {
    console.error("❌ فشل التحقق من حالة الاتصال بقاعدة البيانات:", error);
    connectionStatus = "disconnected";
    lastCheckTime = Date.now();

    return false;
  } finally {
    connectionCheckPromise = null;
  }
}

/**
 * التحقق من جاهزية قاعدة البيانات، مع إعادة المحاولة عدة مرات
 */
export async function waitForDatabaseConnection(
  maxRetries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const isConnected = await checkDatabaseConnection();

    if (isConnected) {
      return true;
    }

    console.log(
      `⏳ محاولة الاتصال بقاعدة البيانات ${attempt}/${maxRetries}...`
    );

    // انتظار بين المحاولات، مع زيادة وقت الانتظار تدريجيًا
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return false;
}

/**
 * محاولة تنفيذ استعلام مع معالجة حالة عدم الاتصال
 */
export async function safeQueryExecution<T>(
  queryFn: () => Promise<T>,
  fallbackFn: () => Promise<T> | T
): Promise<T> {
  try {
    // محاولة الاتصال بقاعدة البيانات أولاً
    const isConnected = await waitForDatabaseConnection(2);

    if (!isConnected) {
      console.warn("⚠️ قاعدة البيانات غير متصلة، استخدام البيانات الاحتياطية");
      return await fallbackFn();
    }

    // تنفيذ الاستعلام
    return await queryFn();
  } catch (error) {
    console.error("❌ فشل تنفيذ الاستعلام:", error);
    return await fallbackFn();
  }
}

// إنشاء كائن للتصدير
const ConnectionManager = {
  checkDatabaseConnection,
  waitForDatabaseConnection,
  safeQueryExecution,
};

export default ConnectionManager;
