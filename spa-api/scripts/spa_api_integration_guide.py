#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
دليل التكامل المتقدم لـ API وكالة الأنباء السعودية
Advanced Integration Guide for Saudi Press Agency API

هذا الملف يحتوي على أمثلة متقدمة وأفضل الممارسات للتكامل مع API وكالة الأنباء السعودية
"""

import requests
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
import hashlib
import base64

# إعداد نظام السجلات
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('spa_api.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class SPAAPIClient:
    """
    عميل متقدم لـ API وكالة الأنباء السعودية
    Advanced Client for Saudi Press Agency API
    """
    
    def __init__(self, api_key: str, customer_key: str, base_url: str = "https://nwdistapi.spa.gov.sa"):
        """
        تهيئة العميل
        
        Args:
            api_key: مفتاح الـ API
            customer_key: مفتاح العميل
            base_url: الرابط الأساسي للـ API
        """
        self.api_key = api_key
        self.customer_key = customer_key
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # إعداد الهيدرز الافتراضية
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SPA-API-Advanced-Client/1.0',
            'Accept-Language': 'ar,en',
            'Accept-Encoding': 'gzip, deflate'
        })
        
        # إعدادات إعادة المحاولة
        self.max_retries = 3
        self.retry_delay = 1  # ثانية
        self.timeout = 30
        
        # تخزين مؤقت للاستجابات
        self.cache = {}
        self.cache_ttl = 300  # 5 دقائق
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """
        تنفيذ طلب HTTP مع إعادة المحاولة والتعامل مع الأخطاء
        
        Args:
            method: نوع الطلب (GET, POST, etc.)
            endpoint: نقطة النهاية
            **kwargs: معاملات إضافية للطلب
            
        Returns:
            كائن الاستجابة
        """
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                self.logger.info(f"محاولة {attempt + 1}: {method} {url}")
                
                response = self.session.request(
                    method=method,
                    url=url,
                    timeout=self.timeout,
                    **kwargs
                )
                
                # تسجيل تفاصيل الاستجابة
                self.logger.info(f"استجابة: {response.status_code} - {len(response.content)} بايت")
                
                return response
                
            except requests.exceptions.RequestException as e:
                self.logger.warning(f"فشل المحاولة {attempt + 1}: {e}")
                
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (2 ** attempt))  # تأخير متزايد
                else:
                    raise
    
    def _get_auth_headers(self, method: str = 'api_key') -> Dict[str, str]:
        """
        الحصول على هيدرز المصادقة
        
        Args:
            method: طريقة المصادقة
            
        Returns:
            قاموس الهيدرز
        """
        auth_methods = {
            'api_key': {
                'X-API-Key': self.api_key,
                'X-Customer-Key': self.customer_key
            },
            'bearer': {
                'Authorization': f'Bearer {self.api_key}'
            },
            'basic': {
                'Authorization': f'Basic {base64.b64encode(f"{self.api_key}:{self.customer_key}".encode()).decode()}'
            },
            'custom': {
                'SPA-API-Key': self.api_key,
                'SPA-Customer-Key': self.customer_key
            }
        }
        
        return auth_methods.get(method, auth_methods['api_key'])
    
    def _cache_key(self, endpoint: str, params: Dict = None) -> str:
        """إنشاء مفتاح للتخزين المؤقت"""
        cache_string = f"{endpoint}_{params or {}}"
        return hashlib.md5(cache_string.encode()).hexdigest()
    
    def _get_cached_response(self, cache_key: str) -> Optional[Dict]:
        """الحصول على استجابة من التخزين المؤقت"""
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                self.logger.info("تم استخدام البيانات المخزنة مؤقتاً")
                return cached_data
            else:
                del self.cache[cache_key]
        return None
    
    def _cache_response(self, cache_key: str, data: Dict):
        """حفظ الاستجابة في التخزين المؤقت"""
        self.cache[cache_key] = (data, time.time())
    
    def health_check(self) -> Dict:
        """فحص حالة الـ API"""
        try:
            response = self._make_request('GET', '/')
            
            return {
                'status': 'healthy' if response.status_code < 500 else 'unhealthy',
                'status_code': response.status_code,
                'response_time': response.elapsed.total_seconds(),
                'server': response.headers.get('Server', 'Unknown'),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def authenticate(self, method: str = 'api_key') -> Dict:
        """
        اختبار المصادقة
        
        Args:
            method: طريقة المصادقة
            
        Returns:
            نتيجة المصادقة
        """
        auth_headers = self._get_auth_headers(method)
        
        try:
            response = self._make_request(
                'GET', 
                '/',
                headers=auth_headers
            )
            
            return {
                'authenticated': response.status_code not in [401, 403],
                'status_code': response.status_code,
                'method': method,
                'message': self._get_status_message(response.status_code)
            }
            
        except Exception as e:
            return {
                'authenticated': False,
                'error': str(e),
                'method': method
            }
    
    def get_news(self, 
                 endpoint: str = '/news',
                 limit: int = 10,
                 category: str = None,
                 date_from: datetime = None,
                 date_to: datetime = None,
                 language: str = 'ar',
                 use_cache: bool = True) -> Dict:
        """
        استرجاع الأخبار مع خيارات متقدمة
        
        Args:
            endpoint: نقطة النهاية
            limit: عدد الأخبار
            category: فئة الأخبار
            date_from: تاريخ البداية
            date_to: تاريخ النهاية
            language: اللغة
            use_cache: استخدام التخزين المؤقت
            
        Returns:
            نتيجة الطلب
        """
        # إعداد المعاملات
        params = {'limit': limit, 'lang': language}
        
        if category:
            params['category'] = category
        if date_from:
            params['date_from'] = date_from.isoformat()
        if date_to:
            params['date_to'] = date_to.isoformat()
        
        # فحص التخزين المؤقت
        cache_key = self._cache_key(endpoint, params)
        if use_cache:
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                return cached_response
        
        # تجربة طرق مصادقة مختلفة
        auth_methods = ['api_key', 'bearer', 'basic', 'custom']
        
        for auth_method in auth_methods:
            try:
                auth_headers = self._get_auth_headers(auth_method)
                
                response = self._make_request(
                    'GET',
                    endpoint,
                    headers=auth_headers,
                    params=params
                )
                
                result = {
                    'success': response.status_code in [200, 201, 202],
                    'status_code': response.status_code,
                    'auth_method': auth_method,
                    'endpoint': endpoint,
                    'params': params,
                    'timestamp': datetime.now().isoformat()
                }
                
                if response.status_code in [200, 201, 202]:
                    try:
                        data = response.json()
                        result['data'] = data
                        result['count'] = len(data) if isinstance(data, list) else 1
                        result['data_type'] = 'json'
                    except:
                        result['data'] = response.text
                        result['data_type'] = 'text'
                    
                    # حفظ في التخزين المؤقت
                    if use_cache:
                        self._cache_response(cache_key, result)
                    
                    return result
                
            except Exception as e:
                self.logger.warning(f"فشل مع طريقة المصادقة {auth_method}: {e}")
                continue
        
        return {
            'success': False,
            'message': 'فشل في جميع محاولات الاتصال',
            'endpoint': endpoint,
            'timestamp': datetime.now().isoformat()
        }
    
    def search_news(self, query: str, **kwargs) -> Dict:
        """البحث في الأخبار"""
        params = {'q': query, **kwargs}
        return self.get_news('/search', **params)
    
    def get_categories(self) -> Dict:
        """الحصول على فئات الأخبار"""
        return self.get_news('/categories')
    
    def get_latest_news(self, count: int = 10) -> Dict:
        """الحصول على آخر الأخبار"""
        return self.get_news('/latest', limit=count)
    
    def _get_status_message(self, status_code: int) -> str:
        """الحصول على رسالة حالة الاستجابة"""
        messages = {
            200: 'نجح الطلب',
            201: 'تم إنشاء المورد بنجاح',
            400: 'طلب غير صحيح',
            401: 'غير مصرح - تحقق من بيانات المصادقة',
            403: 'ممنوع - ليس لديك صلاحية',
            404: 'غير موجود - تحقق من الرابط',
            429: 'تم تجاوز الحد المسموح',
            500: 'خطأ في الخادم',
            502: 'خطأ في البوابة',
            503: 'الخدمة غير متاحة'
        }
        return messages.get(status_code, f'حالة غير معروفة: {status_code}')
    
    def get_api_info(self) -> Dict:
        """الحصول على معلومات الـ API"""
        return {
            'base_url': self.base_url,
            'client_version': '1.0',
            'supported_methods': ['GET', 'POST'],
            'supported_formats': ['json', 'xml'],
            'rate_limits': 'غير محدد',
            'documentation': 'غير متاح',
            'support_contact': 'info@spa.gov.sa'
        }

class SPAAPIManager:
    """مدير متقدم لـ API وكالة الأنباء السعودية"""
    
    def __init__(self, api_key: str, customer_key: str):
        self.client = SPAAPIClient(api_key, customer_key)
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def run_comprehensive_test(self) -> Dict:
        """تشغيل اختبار شامل للـ API"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'tests': {}
        }
        
        # 1. فحص الحالة
        self.logger.info("تشغيل فحص الحالة...")
        results['tests']['health_check'] = self.client.health_check()
        
        # 2. اختبار المصادقة
        self.logger.info("اختبار طرق المصادقة...")
        auth_results = {}
        for method in ['api_key', 'bearer', 'basic', 'custom']:
            auth_results[method] = self.client.authenticate(method)
        results['tests']['authentication'] = auth_results
        
        # 3. اختبار نقاط النهاية
        self.logger.info("اختبار نقاط النهاية...")
        endpoints = ['/news', '/api/news', '/api/v1/news', '/articles', '/feeds', '/latest']
        endpoint_results = {}
        
        for endpoint in endpoints:
            endpoint_results[endpoint] = self.client.get_news(endpoint, limit=5)
        
        results['tests']['endpoints'] = endpoint_results
        
        # 4. معلومات الـ API
        results['api_info'] = self.client.get_api_info()
        
        return results
    
    def generate_report(self, results: Dict) -> str:
        """إنشاء تقرير مفصل"""
        report = []
        report.append("# تقرير اختبار API وكالة الأنباء السعودية")
        report.append("=" * 60)
        report.append(f"تاريخ الاختبار: {results['timestamp']}")
        report.append("")
        
        # فحص الحالة
        health = results['tests']['health_check']
        report.append("## 1. فحص حالة الـ API")
        report.append(f"الحالة: {health.get('status', 'غير معروف')}")
        report.append(f"كود الاستجابة: {health.get('status_code', 'غير متاح')}")
        report.append(f"زمن الاستجابة: {health.get('response_time', 'غير متاح')} ثانية")
        report.append("")
        
        # المصادقة
        auth = results['tests']['authentication']
        report.append("## 2. نتائج اختبار المصادقة")
        for method, result in auth.items():
            status = "✅ نجح" if result.get('authenticated') else "❌ فشل"
            report.append(f"- {method}: {status} ({result.get('status_code', 'غير متاح')})")
        report.append("")
        
        # نقاط النهاية
        endpoints = results['tests']['endpoints']
        report.append("## 3. نتائج اختبار نقاط النهاية")
        for endpoint, result in endpoints.items():
            status = "✅ متاح" if result.get('success') else "❌ غير متاح"
            report.append(f"- {endpoint}: {status} ({result.get('status_code', 'غير متاح')})")
        report.append("")
        
        # التوصيات
        report.append("## 4. التوصيات")
        if not any(r.get('authenticated') for r in auth.values()):
            report.append("- تحقق من صحة مفاتيح المصادقة")
            report.append("- تواصل مع فريق الدعم للحصول على الوثائق")
        
        if not any(r.get('success') for r in endpoints.values()):
            report.append("- قد يكون الـ API غير متاح حالياً")
            report.append("- تحقق من حالة الخدمة مع مقدم الخدمة")
        
        return "\n".join(report)

def main():
    """الدالة الرئيسية للاختبار المتقدم"""
    print("🚀 دليل التكامل المتقدم لـ API وكالة الأنباء السعودية")
    print("=" * 70)
    
    # بيانات الاتصال
    API_KEY = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP"
    CUSTOMER_KEY = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4="
    
    # إنشاء مدير الـ API
    manager = SPAAPIManager(API_KEY, CUSTOMER_KEY)
    
    # تشغيل الاختبار الشامل
    print("تشغيل الاختبار الشامل...")
    results = manager.run_comprehensive_test()
    
    # إنشاء التقرير
    report = manager.generate_report(results)
    print("\n" + report)
    
    # حفظ النتائج
    with open('spa_api_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    with open('spa_api_test_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n✅ تم حفظ النتائج في:")
    print("- spa_api_test_results.json")
    print("- spa_api_test_report.txt")
    print("- spa_api.log")

if __name__ == "__main__":
    main()

