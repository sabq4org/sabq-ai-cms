// نظام جمع بيانات السياق المتقدم - سبق الذكية
import { NextRequest } from 'next/server';
import { SecurityManager } from '../auth/user-management';
import { AdvancedEncryption } from '../auth/security-standards';
import { z } from 'zod';

// Schema لبيانات السياق
export const ContextDataSchema = z.object({
  // معلومات الجلسة
  session_id: z.string().min(1, 'معرف الجلسة مطلوب'),
  user_id: z.string().optional(),
  
  // معلومات الوقت
  timestamp: z.string().datetime('تاريخ غير صحيح'),
  timezone: z.string().optional(),
  local_time: z.string().optional(),
  
  // معلومات الجهاز
  device: z.object({
    type: z.enum(['mobile', 'tablet', 'desktop', 'unknown']),
    os: z.string().optional(),
    os_version: z.string().optional(),
    browser: z.string().optional(),
    browser_version: z.string().optional(),
    screen_resolution: z.object({
      width: z.number(),
      height: z.number(),
      pixel_ratio: z.number().optional()
    }).optional(),
    viewport: z.object({
      width: z.number(),
      height: z.number()
    }).optional(),
    orientation: z.enum(['portrait', 'landscape']).optional(),
    touch_support: z.boolean().optional(),
    connection_type: z.string().optional(),
    memory: z.number().optional(), // GB
    cpu_cores: z.number().optional()
  }),
  
  // معلومات الموقع (مع الخصوصية)
  location: z.object({
    country: z.string().optional(),
    country_code: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    is_vpn: z.boolean().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number()
    }).optional() // فقط بموافقة صريحة
  }).optional(),
  
  // معلومات الشبكة
  network: z.object({
    ip_address: z.string().optional(), // مشفر
    isp: z.string().optional(),
    connection_speed: z.enum(['slow-2g', '2g', '3g', '4g', '5g', 'wifi', 'ethernet']).optional(),
    bandwidth_estimate: z.number().optional(), // Mbps
    rtt: z.number().optional(), // milliseconds
    downlink: z.number().optional(),
    effective_type: z.string().optional()
  }).optional(),
  
  // سياق التطبيق
  app_context: z.object({
    page_url: z.string(),
    page_title: z.string().optional(),
    referrer: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),
    search_query: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
  
  // تفضيلات المستخدم
  user_preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    font_size: z.enum(['small', 'medium', 'large', 'extra-large']).optional(),
    language: z.string().optional(),
    notifications_enabled: z.boolean().optional(),
    accessibility_features: z.array(z.string()).optional(),
    reading_mode: z.boolean().optional()
  }).optional(),
  
  // معلومات البيئة
  environment: z.object({
    is_incognito: z.boolean().optional(),
    cookies_enabled: z.boolean().optional(),
    local_storage_available: z.boolean().optional(),
    session_storage_available: z.boolean().optional(),
    webgl_support: z.boolean().optional(),
    webrtc_support: z.boolean().optional(),
    battery_level: z.number().optional(), // 0-100
    is_charging: z.boolean().optional(),
    memory_usage: z.number().optional(),
    online_status: z.boolean().optional()
  }).optional(),
  
  // معلومات الأداء
  performance: z.object({
    page_load_time: z.number().optional(),
    dom_ready_time: z.number().optional(),
    first_paint: z.number().optional(),
    first_contentful_paint: z.number().optional(),
    largest_contentful_paint: z.number().optional(),
    cumulative_layout_shift: z.number().optional(),
    first_input_delay: z.number().optional(),
    total_blocking_time: z.number().optional()
  }).optional()
});

export type ContextData = z.infer<typeof ContextDataSchema>;

// فئة جمع بيانات السياق
export class ContextDataCollector {
  private static readonly GEO_CACHE_TTL = 3600000; // ساعة واحدة
  private static geoCache = new Map<string, { data: any; timestamp: number }>();

  /**
   * جمع بيانات السياق الشاملة
   */
  static async collectContextData(
    request: NextRequest,
    sessionId: string,
    userId?: string,
    additionalData?: Partial<ContextData>
  ): Promise<{ success: boolean; contextData?: ContextData; error?: string }> {
    try {
      // جمع بيانات السياق الأساسية
      const baseContext = await this.extractBaseContext(request, sessionId, userId);
      
      // دمج البيانات الإضافية
      const contextData = {
        ...baseContext,
        ...additionalData
      };

      // التحقق من صحة البيانات
      const validatedContext = ContextDataSchema.parse(contextData);

      // إثراء البيانات بمعلومات إضافية
      const enrichedContext = await this.enrichContextData(validatedContext, request);

      // تحليل وتصنيف السياق
      const analyzedContext = await this.analyzeContext(enrichedContext);

      console.log(`🔍 تم جمع بيانات السياق للجلسة: ${sessionId}`);

      return {
        success: true,
        contextData: {
          ...enrichedContext,
          ...analyzedContext
        }
      };

    } catch (error: any) {
      console.error('❌ خطأ في جمع بيانات السياق:', error);
      return {
        success: false,
        error: error.message || 'فشل في جمع بيانات السياق'
      };
    }
  }

  /**
   * استخراج السياق الأساسي من الطلب
   */
  private static async extractBaseContext(
    request: NextRequest,
    sessionId: string,
    userId?: string
  ): Promise<Partial<ContextData>> {
    const userAgent = request.headers.get('user-agent') || '';
    const clientHints = this.extractClientHints(request);
    const ip = SecurityManager.cleanIpAddress(request as any);

    // تحليل User Agent
    const deviceInfo = this.parseUserAgent(userAgent);
    
    // معلومات الشبكة
    const networkInfo = await this.gatherNetworkInfo(request, ip);

    // معلومات الصفحة
    const appContext = this.extractAppContext(request);

    return {
      session_id: sessionId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      device: {
        ...deviceInfo,
        ...clientHints
      },
      network: networkInfo,
      app_context: appContext
    };
  }

  /**
   * تحليل User Agent
   */
  private static parseUserAgent(userAgent: string): any {
    const deviceInfo = {
      type: 'unknown' as const,
      os: 'unknown',
      browser: 'unknown',
      touch_support: false
    };

    // كشف نوع الجهاز
    if (/mobile/i.test(userAgent)) {
      deviceInfo.type = 'mobile';
      deviceInfo.touch_support = true;
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceInfo.type = 'tablet';
      deviceInfo.touch_support = true;
    } else {
      deviceInfo.type = 'desktop';
    }

    // كشف نظام التشغيل
    if (/windows/i.test(userAgent)) {
      deviceInfo.os = 'Windows';
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      deviceInfo.os = 'macOS';
    } else if (/android/i.test(userAgent)) {
      deviceInfo.os = 'Android';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      deviceInfo.os = 'iOS';
    } else if (/linux/i.test(userAgent)) {
      deviceInfo.os = 'Linux';
    }

    // كشف المتصفح
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) {
      deviceInfo.browser = 'Chrome';
    } else if (/firefox/i.test(userAgent)) {
      deviceInfo.browser = 'Firefox';
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      deviceInfo.browser = 'Safari';
    } else if (/edg/i.test(userAgent)) {
      deviceInfo.browser = 'Edge';
    }

    return deviceInfo;
  }

  /**
   * استخراج Client Hints
   */
  private static extractClientHints(request: NextRequest): any {
    const hints: any = {};

    // Client Hints الأساسية
    const deviceMemory = request.headers.get('device-memory');
    if (deviceMemory) hints.memory = parseFloat(deviceMemory);

    const viewport = request.headers.get('sec-ch-viewport-width');
    if (viewport) {
      hints.viewport = { width: parseInt(viewport), height: 0 };
    }

    const platform = request.headers.get('sec-ch-ua-platform');
    if (platform) hints.os = platform.replace(/"/g, '');

    const mobile = request.headers.get('sec-ch-ua-mobile');
    if (mobile) hints.type = mobile === '?1' ? 'mobile' : 'desktop';

    return hints;
  }

  /**
   * جمع معلومات الشبكة
   */
  private static async gatherNetworkInfo(request: NextRequest, ip: string): Promise<any> {
    const networkInfo: any = {
      ip_address: AdvancedEncryption.encryptPII(ip) // تشفير IP
    };

    // كشف معلومات الشبكة من الـ headers
    const connection = request.headers.get('connection');
    if (connection) networkInfo.connection_type = connection;

    // معلومات الـ CDN أو Proxy
    const cfRay = request.headers.get('cf-ray');
    if (cfRay) networkInfo.cdn = 'cloudflare';

    const xForwardedFor = request.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      const ips = xForwardedFor.split(',').map(ip => ip.trim());
      if (ips.length > 1) networkInfo.is_proxy = true;
    }

    return networkInfo;
  }

  /**
   * استخراج سياق التطبيق
   */
  private static extractAppContext(request: NextRequest): any {
    const url = new URL(request.url);
    const params = url.searchParams;

    return {
      page_url: url.pathname,
      referrer: request.headers.get('referer') || undefined,
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
      search_query: params.get('q') || params.get('search') || undefined
    };
  }

  /**
   * إثراء بيانات السياق
   */
  private static async enrichContextData(
    contextData: ContextData,
    request: NextRequest
  ): Promise<ContextData> {
    try {
      // إضافة معلومات الموقع الجغرافي (بدون إحداثيات دقيقة)
      const geoData = await this.getGeoLocation(contextData.network?.ip_address);
      if (geoData) {
        contextData.location = {
          country: geoData.country,
          country_code: geoData.country_code,
          region: geoData.region,
          city: geoData.city,
          timezone: geoData.timezone,
          is_vpn: geoData.is_vpn
        };
      }

      // إضافة معلومات المنطقة الزمنية
      if (!contextData.timezone && contextData.location?.timezone) {
        contextData.timezone = contextData.location.timezone;
      }

      // كشف Bot أو Crawler
      const isBot = this.detectBot(request.headers.get('user-agent') || '');
      if (isBot) {
        (contextData as any).is_bot = true;
        (contextData as any).bot_type = isBot;
      }

      return contextData;

    } catch (error) {
      console.error('⚠️ فشل في إثراء بيانات السياق:', error);
      return contextData;
    }
  }

  /**
   * الحصول على الموقع الجغرافي (مع التخزين المؤقت)
   */
  private static async getGeoLocation(encryptedIp?: string): Promise<any> {
    if (!encryptedIp) return null;

    try {
      // فك تشفير IP للاستعلام
      const ip = AdvancedEncryption.decryptPII(encryptedIp);
      
      // التحقق من التخزين المؤقت
      const cached = this.geoCache.get(ip);
      if (cached && Date.now() - cached.timestamp < this.GEO_CACHE_TTL) {
        return cached.data;
      }

      // استعلام خدمة GeoLocation (يمكن استخدام خدمة مجانية)
      // هنا مثال تقديري - يجب تطبيق خدمة حقيقية
      const geoData = await this.queryGeoService(ip);
      
      // حفظ في التخزين المؤقت
      this.geoCache.set(ip, {
        data: geoData,
        timestamp: Date.now()
      });

      return geoData;

    } catch (error) {
      console.error('⚠️ فشل في جلب الموقع الجغرافي:', error);
      return null;
    }
  }

  /**
   * استعلام خدمة الموقع الجغرافي
   */
  private static async queryGeoService(ip: string): Promise<any> {
    // مثال تقديري - يجب استبداله بخدمة حقيقية
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '127.0.0.1') {
      return {
        country: 'محلي',
        country_code: 'LOCAL',
        region: 'محلي',
        city: 'محلي',
        timezone: 'Asia/Riyadh',
        is_vpn: false
      };
    }

    // تقدير افتراضي للمملكة العربية السعودية
    return {
      country: 'المملكة العربية السعودية',
      country_code: 'SA',
      region: 'الرياض',
      city: 'الرياض',
      timezone: 'Asia/Riyadh',
      is_vpn: false
    };
  }

  /**
   * كشف البوتات
   */
  private static detectBot(userAgent: string): string | null {
    const botPatterns = [
      { pattern: /googlebot/i, name: 'Googlebot' },
      { pattern: /bingbot/i, name: 'Bingbot' },
      { pattern: /slurp/i, name: 'Yahoo' },
      { pattern: /duckduckbot/i, name: 'DuckDuckGo' },
      { pattern: /baiduspider/i, name: 'Baidu' },
      { pattern: /yandexbot/i, name: 'Yandex' },
      { pattern: /facebookexternalhit/i, name: 'Facebook' },
      { pattern: /twitterbot/i, name: 'Twitter' },
      { pattern: /linkedinbot/i, name: 'LinkedIn' },
      { pattern: /whatsapp/i, name: 'WhatsApp' },
      { pattern: /bot|crawl|spider|scrape/i, name: 'Generic Bot' }
    ];

    for (const { pattern, name } of botPatterns) {
      if (pattern.test(userAgent)) {
        return name;
      }
    }

    return null;
  }

  /**
   * تحليل السياق
   */
  private static async analyzeContext(contextData: ContextData): Promise<any> {
    const analysis = {
      user_segment: this.segmentUser(contextData),
      session_type: this.classifySession(contextData),
      traffic_source: this.identifyTrafficSource(contextData),
      device_characteristics: this.analyzeDevice(contextData),
      behavioral_indicators: this.extractBehavioralIndicators(contextData),
      risk_assessment: this.assessRisk(contextData),
      personalization_data: this.extractPersonalizationData(contextData)
    };

    return { analysis };
  }

  /**
   * تصنيف المستخدم
   */
  private static segmentUser(contextData: ContextData): any {
    const segments = [];

    // تصنيف حسب الجهاز
    segments.push(`${contextData.device.type}_user`);

    // تصنيف حسب الموقع
    if (contextData.location?.country_code) {
      segments.push(`${contextData.location.country_code.toLowerCase()}_user`);
    }

    // تصنيف حسب الوقت
    const hour = new Date(contextData.timestamp).getHours();
    if (hour >= 6 && hour < 12) segments.push('morning_reader');
    else if (hour >= 12 && hour < 18) segments.push('afternoon_reader');
    else if (hour >= 18 && hour < 22) segments.push('evening_reader');
    else segments.push('night_reader');

    // تصنيف حسب مصدر الزيارة
    if (contextData.app_context.utm_source) {
      segments.push(`${contextData.app_context.utm_source}_traffic`);
    }

    return {
      primary_segments: segments,
      device_category: contextData.device.type,
      time_category: segments.find(s => s.includes('reader')),
      geo_category: contextData.location?.country_code
    };
  }

  /**
   * تصنيف نوع الجلسة
   */
  private static classifySession(contextData: ContextData): string {
    // تحليل نوع الجلسة بناءً على السياق
    if (contextData.app_context.search_query) return 'search_session';
    if (contextData.app_context.utm_source === 'social') return 'social_session';
    if (contextData.app_context.referrer) return 'referral_session';
    return 'direct_session';
  }

  /**
   * تحديد مصدر الزيارة
   */
  private static identifyTrafficSource(contextData: ContextData): any {
    const source = {
      type: 'direct',
      medium: 'none',
      campaign: null,
      details: {}
    };

    if (contextData.app_context.utm_source) {
      source.type = 'campaign';
      source.medium = contextData.app_context.utm_medium || 'unknown';
      source.campaign = contextData.app_context.utm_campaign;
      source.details = {
        source: contextData.app_context.utm_source,
        term: contextData.app_context.utm_term,
        content: contextData.app_context.utm_content
      };
    } else if (contextData.app_context.referrer) {
      source.type = 'referral';
      source.medium = 'referral';
      source.details.referrer = contextData.app_context.referrer;
    }

    return source;
  }

  /**
   * تحليل خصائص الجهاز
   */
  private static analyzeDevice(contextData: ContextData): any {
    const device = contextData.device;
    
    return {
      performance_category: this.categorizeDevicePerformance(device),
      connectivity_type: device.connection_type || 'unknown',
      form_factor: device.type,
      capabilities: {
        touch: device.touch_support || false,
        high_res: (device.screen_resolution?.pixel_ratio || 1) > 1,
        modern_browser: this.isModernBrowser(device.browser || ''),
        sufficient_memory: (device.memory || 0) >= 4
      }
    };
  }

  /**
   * استخراج مؤشرات سلوكية
   */
  private static extractBehavioralIndicators(contextData: ContextData): any {
    const indicators = [];

    // مؤشرات من تفضيلات المستخدم
    if (contextData.user_preferences?.theme === 'dark') {
      indicators.push('prefers_dark_mode');
    }

    if (contextData.user_preferences?.accessibility_features?.length) {
      indicators.push('uses_accessibility_features');
    }

    // مؤشرات من البيئة
    if (contextData.environment?.is_incognito) {
      indicators.push('privacy_conscious');
    }

    // مؤشرات من الأداء
    if (contextData.performance?.page_load_time && contextData.performance.page_load_time > 3000) {
      indicators.push('slow_connection');
    }

    return {
      behavioral_tags: indicators,
      privacy_level: this.assessPrivacyLevel(contextData),
      engagement_potential: this.assessEngagementPotential(contextData)
    };
  }

  /**
   * تقييم المخاطر
   */
  private static assessRisk(contextData: ContextData): any {
    let riskScore = 0;
    const riskFactors = [];

    // فحص Bot
    if ((contextData as any).is_bot) {
      riskScore += 50;
      riskFactors.push('bot_detected');
    }

    // فحص VPN
    if (contextData.location?.is_vpn) {
      riskScore += 20;
      riskFactors.push('vpn_usage');
    }

    // فحص Incognito
    if (contextData.environment?.is_incognito) {
      riskScore += 10;
      riskFactors.push('incognito_mode');
    }

    return {
      risk_score: Math.min(riskScore, 100),
      risk_level: riskScore > 70 ? 'high' : riskScore > 30 ? 'medium' : 'low',
      risk_factors: riskFactors
    };
  }

  /**
   * استخراج بيانات التخصيص
   */
  private static extractPersonalizationData(contextData: ContextData): any {
    return {
      preferred_theme: contextData.user_preferences?.theme || 'auto',
      preferred_language: contextData.user_preferences?.language || contextData.location?.language || 'ar',
      device_optimization: contextData.device.type,
      timezone: contextData.timezone || contextData.location?.timezone || 'Asia/Riyadh',
      accessibility_needs: contextData.user_preferences?.accessibility_features || []
    };
  }

  // دوال مساعدة
  private static categorizeDevicePerformance(device: any): string {
    if (device.memory >= 8 && device.cpu_cores >= 4) return 'high';
    if (device.memory >= 4 && device.cpu_cores >= 2) return 'medium';
    return 'low';
  }

  private static isModernBrowser(browser: string): boolean {
    const modernBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    return modernBrowsers.includes(browser);
  }

  private static assessPrivacyLevel(contextData: ContextData): string {
    let privacyScore = 0;
    
    if (contextData.environment?.is_incognito) privacyScore += 30;
    if (contextData.location?.is_vpn) privacyScore += 40;
    if (!contextData.environment?.cookies_enabled) privacyScore += 20;
    
    if (privacyScore >= 60) return 'high';
    if (privacyScore >= 30) return 'medium';
    return 'low';
  }

  private static assessEngagementPotential(contextData: ContextData): string {
    let engagementScore = 50; // نقطة بداية

    // مؤشرات إيجابية
    if (contextData.app_context.utm_source) engagementScore += 20;
    if (contextData.user_preferences?.notifications_enabled) engagementScore += 15;
    if (contextData.device.type === 'mobile') engagementScore += 10;

    // مؤشرات سلبية
    if ((contextData as any).is_bot) engagementScore -= 50;
    if (contextData.environment?.is_incognito) engagementScore -= 10;

    if (engagementScore >= 70) return 'high';
    if (engagementScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * تنظيف البيانات الحساسة
   */
  static sanitizeContextData(contextData: ContextData): ContextData {
    const sanitized = { ...contextData };

    // إزالة أو تشفير البيانات الحساسة
    if (sanitized.location?.coordinates) {
      delete sanitized.location.coordinates; // إزالة الإحداثيات الدقيقة
    }

    // تشفير IP إذا لم يكن مشفراً
    if (sanitized.network?.ip_address && !sanitized.network.ip_address.includes(':')) {
      sanitized.network.ip_address = AdvancedEncryption.encryptPII(sanitized.network.ip_address);
    }

    return sanitized;
  }

  /**
   * تصدير بيانات السياق للتحليل
   */
  static exportContextForAnalysis(contextData: ContextData): any {
    const exported = this.sanitizeContextData(contextData);
    
    return {
      session_id: exported.session_id,
      timestamp: exported.timestamp,
      device_type: exported.device.type,
      os: exported.device.os,
      browser: exported.device.browser,
      country: exported.location?.country_code,
      timezone: exported.timezone,
      traffic_source: exported.app_context.utm_source,
      page_category: this.categorizePageType(exported.app_context.page_url),
      user_segment: (exported as any).analysis?.user_segment?.primary_segments || []
    };
  }

  private static categorizePageType(pageUrl: string): string {
    if (pageUrl.includes('/article/')) return 'article';
    if (pageUrl.includes('/news/')) return 'news';
    if (pageUrl.includes('/categories/')) return 'category';
    if (pageUrl.includes('/search')) return 'search';
    if (pageUrl === '/') return 'homepage';
    return 'other';
  }
}

export default ContextDataCollector;
