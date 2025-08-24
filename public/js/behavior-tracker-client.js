/**
 * سكريبت تتبع السلوك الذكي - الجانب العميل
 * يتتبع جميع تفاعلات المستخدم في الوقت الفعلي
 */

class SmartBehaviorTracker {
    constructor(userId, sessionId) {
        this.userId = userId;
        this.sessionId = sessionId || this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.currentPage = window.location.pathname;
        this.scrollDepth = 0;
        this.maxScrollDepth = 0;
        this.clickCount = 0;
        this.isActive = true;
        this.lastActivity = Date.now();
        this.heartbeatInterval = null;
        this.syncInterval = null;
        
        // معلومات الجهاز والمتصفح
        this.deviceInfo = this.getDeviceInfo();
        
        this.init();
    }
    
    init() {
        if (!this.userId) {
            console.warn('تتبع السلوك: معرف المستخدم غير متوفر');
            return;
        }

        console.log('🎯 بدء تتبع السلوك الذكي للمستخدم:', this.userId);
        
        // تتبع الأنشطة المختلفة
        this.trackPageView();
        this.trackTimeSpent();
        this.trackScrollDepth();
        this.trackClicks();
        this.trackUserActivity();
        this.trackPageExit();
        
        // بدء المزامنة الدورية
        this.startPeriodicSync();
        
        // تتبع الأحداث الخاصة
        this.trackSpecialEvents();
    }
    
    /**
     * تتبع عرض الصفحة
     */
    trackPageView() {
        const contentId = this.getContentId();
        const contentCategory = this.getContentCategory();
        
        this.sendEvent('page_view', {
            contentId,
            contentCategory,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        });

        // منح نقاط عرض المقال إذا كانت صفحة مقال
        if (contentId && contentCategory) {
            this.awardLoyaltyPoints('article_view', contentId);
        }
    }
    
    /**
     * تتبع الوقت المقضي
     */
    trackTimeSpent() {
        // تحديث كل 30 ثانية
        this.heartbeatInterval = setInterval(() => {
            if (this.isUserActive()) {
                const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
                
                this.sendEvent('time_update', {
                    timeSpent,
                    isActive: this.isActive,
                    timestamp: new Date().toISOString()
                });

                // فحص القراءة العميقة (3 دقائق)
                if (timeSpent >= 180 && !this.deepReadAwarded) {
                    this.deepReadAwarded = true;
                    const contentId = this.getContentId();
                    if (contentId) {
                        this.awardLoyaltyPoints('deep_read', contentId);
                    }
                }
            }
        }, 30000);
    }
    
    /**
     * تتبع عمق التمرير
     */
    trackScrollDepth() {
        let ticking = false;
        
        const updateScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = documentHeight > 0 ? Math.round((scrollTop / documentHeight) * 100) : 0;
            
            if (scrollPercent > this.maxScrollDepth) {
                this.maxScrollDepth = scrollPercent;
                this.scrollDepth = scrollPercent;
                
                // إرسال معالم مهمة
                this.checkScrollMilestones(scrollPercent);
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            this.updateLastActivity();
            
            if (!ticking) {
                requestAnimationFrame(updateScrollDepth);
                ticking = true;
            }
        });
    }
    
    /**
     * فحص معالم التمرير
     */
    checkScrollMilestones(scrollPercent) {
        const milestones = [25, 50, 75, 90];
        
        for (const milestone of milestones) {
            if (scrollPercent >= milestone && !this[`scroll_${milestone}_sent`]) {
                this[`scroll_${milestone}_sent`] = true;
                
                this.sendEvent('scroll_milestone', {
                    milestone,
                    scrollPercent,
                    timestamp: new Date().toISOString()
                });
                
                // منح نقاط للقراءة الكاملة
                if (milestone === 90) {
                    const contentId = this.getContentId();
                    if (contentId) {
                        this.awardLoyaltyPoints('scroll_complete', contentId);
                        this.awardLoyaltyPoints('article_read', contentId);
                    }
                }
            }
        }
    }
    
    /**
     * تتبع النقرات
     */
    trackClicks() {
        document.addEventListener('click', (e) => {
            this.clickCount++;
            this.updateLastActivity();
            
            const element = e.target;
            const elementInfo = this.getElementInfo(element);
            
            this.sendEvent('click', {
                ...elementInfo,
                clickCount: this.clickCount,
                timestamp: new Date().toISOString()
            });
            
            // تتبع النقرات الخاصة
            this.trackSpecialClicks(element, elementInfo);
        });
    }
    
    /**
     * تتبع النقرات الخاصة
     */
    trackSpecialClicks(element, elementInfo) {
        const contentId = this.getContentId();
        
        // أزرار الإعجاب
        if (element.matches('.like-btn, [data-action="like"]')) {
            this.awardLoyaltyPoints('article_like', contentId);
        }
        
        // أزرار المشاركة
        if (element.matches('.share-btn, [data-action="share"], .social-share')) {
            this.awardLoyaltyPoints('article_share', contentId);
        }
        
        // أزرار الحفظ
        if (element.matches('.bookmark-btn, [data-action="bookmark"]')) {
            this.awardLoyaltyPoints('article_bookmark', contentId);
        }
        
        // روابط البحث
        if (element.matches('input[type="search"], .search-btn')) {
            this.awardLoyaltyPoints('search_usage');
        }
        
        // روابط الفئات
        if (element.matches('.category-link, [data-category]')) {
            this.awardLoyaltyPoints('category_exploration');
        }
        
        // المقالات المشابهة
        if (element.matches('.related-article, .recommendation-item')) {
            this.awardLoyaltyPoints('related_articles_click');
        }
    }
    
    /**
     * تتبع نشاط المستخدم
     */
    trackUserActivity() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });
        
        // تتبع عدم النشاط
        setInterval(() => {
            const timeSinceLastActivity = Date.now() - this.lastActivity;
            const wasActive = this.isActive;
            this.isActive = timeSinceLastActivity < 60000; // نشط إذا كان آخر نشاط خلال دقيقة
            
            if (wasActive && !this.isActive) {
                this.sendEvent('user_inactive', {
                    inactiveDuration: timeSinceLastActivity,
                    timestamp: new Date().toISOString()
                });
            } else if (!wasActive && this.isActive) {
                this.sendEvent('user_active', {
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000);
    }
    
    /**
     * تتبع مغادرة الصفحة
     */
    trackPageExit() {
        const sendExitEvent = () => {
            const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            
            const exitData = {
                timeSpent,
                maxScrollDepth: this.maxScrollDepth,
                clickCount: this.clickCount,
                exitType: 'beforeunload',
                timestamp: new Date().toISOString()
            };
            
            // استخدام sendBeacon للإرسال الموثوق
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/behavior/track', JSON.stringify({
                    userId: this.userId,
                    sessionId: this.sessionId,
                    eventType: 'page_exit',
                    pageUrl: this.currentPage,
                    contentId: this.getContentId(),
                    contentCategory: this.getContentCategory(),
                    timeSpent,
                    scrollDepth: this.maxScrollDepth,
                    clickCount: this.clickCount,
                    metadata: exitData
                }));
            }
        };
        
        window.addEventListener('beforeunload', sendExitEvent);
        window.addEventListener('pagehide', sendExitEvent);
        
        // تنظيف الموارد
        window.addEventListener('unload', () => {
            this.cleanup();
        });
    }
    
    /**
     * تتبع الأحداث الخاصة
     */
    trackSpecialEvents() {
        // تتبع إرسال التعليقات
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form[data-type="comment"], .comment-form')) {
                const contentId = this.getContentId();
                this.awardLoyaltyPoints('article_comment', contentId);
            }
        });
        
        // تتبع تشغيل الفيديو/الصوت
        document.addEventListener('play', (e) => {
            if (e.target.matches('video')) {
                this.awardLoyaltyPoints('video_watch');
            } else if (e.target.matches('audio')) {
                this.awardLoyaltyPoints('audio_listen');
            }
        }, true);
        
        // تتبع المشاركة في الاستطلاعات
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[name*="poll"], input[name*="survey"]')) {
                this.awardLoyaltyPoints('poll_participate');
            }
        });
    }
    
    /**
     * بدء المزامنة الدورية
     */
    startPeriodicSync() {
        // إرسال البيانات كل دقيقتين
        this.syncInterval = setInterval(() => {
            this.syncPendingEvents();
        }, 120000);
    }
    
    /**
     * إرسال حدث سلوكي
     */
    sendEvent(eventType, metadata = {}) {
        const eventData = {
            userId: this.userId,
            sessionId: this.sessionId,
            eventType,
            pageUrl: this.currentPage,
            contentId: this.getContentId(),
            contentCategory: this.getContentCategory(),
            timeSpent: Math.floor((Date.now() - this.startTime) / 1000),
            scrollDepth: this.scrollDepth,
            clickCount: this.clickCount,
            metadata: {
                ...this.deviceInfo,
                ...metadata
            }
        };
        
        // إضافة إلى قائمة الانتظار
        this.events.push(eventData);
        
        // إرسال فوري للأحداث المهمة
        const immediateEvents = ['page_view', 'click', 'scroll_milestone'];
        if (immediateEvents.includes(eventType)) {
            this.sendToServer(eventData);
        }
    }
    
    /**
     * منح نقاط الولاء
     */
    async awardLoyaltyPoints(actionType, contentId = null) {
        try {
            const response = await fetch('/api/loyalty/award', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    actionType,
                    contentId,
                    metadata: {
                        sessionId: this.sessionId,
                        pageUrl: this.currentPage,
                        timestamp: new Date().toISOString(),
                        ...this.deviceInfo
                    }
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.points > 0) {
                    this.showPointsNotification(result.points, result.message);
                    
                    // إشعار ترقية المستوى
                    if (result.newLevel) {
                        this.showLevelUpNotification(result.newLevel);
                    }
                }
            }
        } catch (error) {
            console.error('خطأ في منح نقاط الولاء:', error);
        }
    }
    
    /**
     * إرسال البيانات للخادم
     */
    async sendToServer(eventData) {
        try {
            const response = await fetch('/api/behavior/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                console.error('فشل في إرسال بيانات السلوك:', response.statusText);
            }
        } catch (error) {
            console.error('خطأ في إرسال بيانات السلوك:', error);
        }
    }
    
    /**
     * مزامنة الأحداث المعلقة
     */
    async syncPendingEvents() {
        if (this.events.length === 0) return;
        
        const eventsToSync = [...this.events];
        this.events = [];
        
        try {
            const response = await fetch('/api/behavior/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events: eventsToSync })
            });
            
            if (!response.ok) {
                // إعادة الأحداث للقائمة في حالة الفشل
                this.events.unshift(...eventsToSync);
            }
        } catch (error) {
            console.error('خطأ في مزامنة الأحداث:', error);
            this.events.unshift(...eventsToSync);
        }
    }
    
    /**
     * عرض إشعار النقاط
     */
    showPointsNotification(points, message) {
        // إنشاء إشعار بسيط
        const notification = document.createElement('div');
        notification.className = 'loyalty-points-notification';
        notification.innerHTML = `
            <div class="points-badge">+${points}</div>
            <div class="points-message">${message}</div>
        `;
        
        // إضافة الأنماط
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease-out;
            direction: rtl;
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * عرض إشعار ترقية المستوى
     */
    showLevelUpNotification(newLevel) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div class="level-up-icon">🎉</div>
            <div class="level-up-text">
                <div class="level-up-title">تهانينا!</div>
                <div class="level-up-message">وصلت إلى مستوى ${newLevel}</div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            animation: levelUpAnimation 0.5s ease-out;
            direction: rtl;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    /**
     * الحصول على معرف المحتوى
     */
    getContentId() {
        // محاولة استخراج معرف المقال من الرابط
        const pathMatch = window.location.pathname.match(/\/article\/(\d+)/);
        if (pathMatch) return pathMatch[1];
        
        // محاولة الحصول من البيانات الوصفية
        const metaContentId = document.querySelector('meta[name="content-id"]');
        if (metaContentId) return metaContentId.getAttribute('content');
        
        // محاولة الحصول من عنصر البيانات
        const dataElement = document.querySelector('[data-content-id]');
        if (dataElement) return dataElement.getAttribute('data-content-id');
        
        return null;
    }
    
    /**
     * الحصول على فئة المحتوى
     */
    getContentCategory() {
        // محاولة الحصول من البيانات الوصفية
        const metaCategory = document.querySelector('meta[name="article:section"]');
        if (metaCategory) return metaCategory.getAttribute('content');
        
        // محاولة الحصول من عنصر البيانات
        const dataElement = document.querySelector('[data-category]');
        if (dataElement) return dataElement.getAttribute('data-category');
        
        // محاولة استخراج من الرابط
        const pathSegments = window.location.pathname.split('/');
        if (pathSegments.includes('category') && pathSegments.length > 2) {
            const categoryIndex = pathSegments.indexOf('category');
            return pathSegments[categoryIndex + 1];
        }
        
        return null;
    }
    
    /**
     * الحصول على معلومات الجهاز
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            deviceType: this.getDeviceType(),
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ipAddress: null // سيتم تحديده من الخادم
        };
    }
    
    /**
     * تحديد نوع الجهاز
     */
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
        return 'desktop';
    }
    
    /**
     * الحصول على معلومات العنصر
     */
    getElementInfo(element) {
        return {
            tag: element.tagName?.toLowerCase(),
            className: element.className,
            id: element.id,
            text: element.textContent?.substring(0, 100),
            href: element.href,
            dataAttributes: this.getDataAttributes(element)
        };
    }
    
    /**
     * الحصول على خصائص البيانات
     */
    getDataAttributes(element) {
        const dataAttrs = {};
        for (let attr of element.attributes) {
            if (attr.name.startsWith('data-')) {
                dataAttrs[attr.name] = attr.value;
            }
        }
        return dataAttrs;
    }
    
    /**
     * توليد معرف الجلسة
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * تحديث آخر نشاط
     */
    updateLastActivity() {
        this.lastActivity = Date.now();
        this.isActive = true;
    }
    
    /**
     * فحص نشاط المستخدم
     */
    isUserActive() {
        return this.isActive && (Date.now() - this.lastActivity) < 60000;
    }
    
    /**
     * تنظيف الموارد
     */
    cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // إرسال الأحداث المعلقة
        this.syncPendingEvents();
    }
}

// إضافة الأنماط المطلوبة
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes levelUpAnimation {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    .loyalty-points-notification .points-badge {
        background: rgba(255,255,255,0.2);
        border-radius: 20px;
        padding: 4px 8px;
        font-weight: bold;
        font-size: 12px;
    }
`;
document.head.appendChild(style);

// تصدير للاستخدام العام
window.SmartBehaviorTracker = SmartBehaviorTracker;

// بدء التتبع التلقائي إذا كان معرف المستخدم متوفراً
document.addEventListener('DOMContentLoaded', function() {
    // البحث عن معرف المستخدم من مصادر مختلفة
    let userId = null;
    
    // من المتغيرات العامة
    if (typeof window.userId !== 'undefined' && window.userId) {
        userId = window.userId;
    }
    
    // من البيانات الوصفية
    if (!userId) {
        const metaUserId = document.querySelector('meta[name="user-id"]');
        if (metaUserId) userId = metaUserId.getAttribute('content');
    }
    
    // من التخزين المحلي
    if (!userId) {
        userId = localStorage.getItem('userId');
    }
    
    // بدء التتبع إذا وجد معرف المستخدم
    if (userId && userId !== 'null' && userId !== 'undefined') {
        window.behaviorTracker = new SmartBehaviorTracker(userId);
        console.log('✅ تم بدء تتبع السلوك الذكي');
    } else {
        console.log('ℹ️ تتبع السلوك: لم يتم العثور على معرف المستخدم');
    }
});
