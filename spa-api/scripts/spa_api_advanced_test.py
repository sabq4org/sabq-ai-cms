#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار متقدم لـ API وكالة الأنباء السعودية
Advanced Saudi Press Agency API Test
"""

import requests
import json
import sys
from datetime import datetime
from spa_api_config import API_BASE_URL, API_KEY, CUSTOMER_KEY, HEADERS, TIMEOUT

class AdvancedSPAAPITester:
    """فئة اختبار متقدمة لـ API وكالة الأنباء السعودية"""
    
    def __init__(self):
        self.base_url = API_BASE_URL.rstrip('/')
        self.api_key = API_KEY
        self.customer_key = CUSTOMER_KEY
        self.headers = HEADERS.copy()
        self.session = requests.Session()
        
    def test_common_api_patterns(self):
        """اختبار أنماط API الشائعة"""
        print("🔍 اختبار أنماط API الشائعة...")
        
        # أنماط مختلفة للمسارات
        patterns = [
            # REST API patterns
            '/api/v1/news',
            '/api/v1/articles',
            '/api/v1/feeds',
            '/api/news',
            '/api/articles',
            '/v1/news',
            '/v1/articles',
            '/news',
            '/articles',
            '/feeds',
            '/rss',
            '/json',
            
            # Common endpoints
            '/api/v1/health',
            '/api/health',
            '/health',
            '/status',
            '/ping',
            '/version',
            '/info',
            
            # Documentation endpoints
            '/docs',
            '/api-docs',
            '/swagger',
            '/openapi',
            '/redoc',
            
            # Authentication endpoints
            '/auth',
            '/login',
            '/token',
            '/oauth',
        ]
        
        successful_endpoints = []
        
        for pattern in patterns:
            url = f"{self.base_url}{pattern}"
            try:
                # اختبار GET
                response = self.session.get(url, headers=self.headers, timeout=10)
                status = response.status_code
                
                if status in [200, 201, 202]:
                    print(f"✅ {pattern}: {status} - متاح")
                    successful_endpoints.append((pattern, status, 'GET'))
                elif status == 401:
                    print(f"🔐 {pattern}: {status} - يتطلب مصادقة")
                    successful_endpoints.append((pattern, status, 'GET'))
                elif status == 403:
                    print(f"🚫 {pattern}: {status} - غير مخول")
                elif status == 405:
                    print(f"⚠️ {pattern}: {status} - طريقة غير مسموحة")
                    # جرب POST
                    try:
                        post_response = self.session.post(url, headers=self.headers, timeout=10)
                        if post_response.status_code in [200, 201, 202]:
                            print(f"✅ {pattern}: {post_response.status_code} - متاح (POST)")
                            successful_endpoints.append((pattern, post_response.status_code, 'POST'))
                    except:
                        pass
                elif status == 404:
                    print(f"❌ {pattern}: {status} - غير موجود")
                else:
                    print(f"❓ {pattern}: {status} - استجابة غير متوقعة")
                    
            except requests.exceptions.RequestException as e:
                print(f"💥 {pattern}: خطأ في الاتصال")
        
        return successful_endpoints
    
    def test_with_authentication_headers(self, endpoints):
        """اختبار نقاط النهاية مع هيدرز المصادقة"""
        print("\n🔐 اختبار نقاط النهاية مع المصادقة...")
        
        auth_headers_variants = [
            # Variant 1: X-API-Key
            {**self.headers, 'X-API-Key': self.api_key, 'X-Customer-Key': self.customer_key},
            # Variant 2: Authorization Bearer
            {**self.headers, 'Authorization': f'Bearer {self.api_key}'},
            # Variant 3: API-Key
            {**self.headers, 'API-Key': self.api_key, 'Customer-Key': self.customer_key},
            # Variant 4: Custom headers
            {**self.headers, 'SPA-API-Key': self.api_key, 'SPA-Customer-Key': self.customer_key},
        ]
        
        successful_auth = []
        
        for endpoint, status, method in endpoints:
            print(f"\n📍 اختبار {endpoint}:")
            
            for i, auth_headers in enumerate(auth_headers_variants, 1):
                try:
                    url = f"{self.base_url}{endpoint}"
                    
                    if method == 'POST':
                        response = self.session.post(url, headers=auth_headers, timeout=10)
                    else:
                        response = self.session.get(url, headers=auth_headers, timeout=10)
                    
                    print(f"   طريقة {i}: {response.status_code}")
                    
                    if response.status_code in [200, 201, 202]:
                        print(f"   ✅ نجحت المصادقة!")
                        successful_auth.append((endpoint, i, response.status_code))
                        
                        # محاولة عرض جزء من الاستجابة
                        try:
                            if response.headers.get('content-type', '').startswith('application/json'):
                                data = response.json()
                                print(f"   📄 نوع الاستجابة: JSON")
                                print(f"   📊 حجم البيانات: {len(str(data))} حرف")
                            else:
                                print(f"   📄 نوع الاستجابة: {response.headers.get('content-type', 'غير محدد')}")
                                print(f"   📊 حجم البيانات: {len(response.content)} بايت")
                        except:
                            pass
                        
                        break
                        
                except requests.exceptions.RequestException as e:
                    print(f"   💥 خطأ: {e}")
        
        return successful_auth
    
    def test_with_query_parameters(self):
        """اختبار مع معاملات الاستعلام"""
        print("\n🔍 اختبار مع معاملات الاستعلام...")
        
        base_endpoints = ['', '/api', '/v1', '/news', '/api/news', '/api/v1/news']
        
        param_variants = [
            {'api_key': self.api_key, 'customer_key': self.customer_key},
            {'apikey': self.api_key, 'customerkey': self.customer_key},
            {'key': self.api_key, 'customer': self.customer_key},
            {'token': self.api_key},
            {'access_token': self.api_key},
        ]
        
        successful_params = []
        
        for endpoint in base_endpoints:
            for i, params in enumerate(param_variants, 1):
                try:
                    url = f"{self.base_url}{endpoint}"
                    response = self.session.get(url, headers=self.headers, params=params, timeout=10)
                    
                    print(f"📍 {endpoint or '/'} (معاملات {i}): {response.status_code}")
                    
                    if response.status_code in [200, 201, 202]:
                        print(f"   ✅ نجح!")
                        successful_params.append((endpoint, params, response.status_code))
                        
                except requests.exceptions.RequestException:
                    pass
        
        return successful_params
    
    def run_advanced_test(self):
        """تشغيل الاختبار المتقدم"""
        print("=" * 70)
        print("🚀 بدء الاختبار المتقدم لـ API وكالة الأنباء السعودية")
        print("=" * 70)
        print(f"⏰ الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # اختبار أنماط API الشائعة
        endpoints = self.test_common_api_patterns()
        
        # اختبار مع هيدرز المصادقة
        auth_results = []
        if endpoints:
            auth_results = self.test_with_authentication_headers(endpoints)
        
        # اختبار مع معاملات الاستعلام
        param_results = self.test_with_query_parameters()
        
        # تلخيص النتائج
        print("\n" + "=" * 70)
        print("📋 ملخص النتائج المتقدمة")
        print("=" * 70)
        
        print(f"🔍 نقاط النهاية المكتشفة: {len(endpoints)}")
        for endpoint, status, method in endpoints:
            print(f"   {endpoint}: {status} ({method})")
        
        print(f"\n🔐 المصادقة الناجحة: {len(auth_results)}")
        for endpoint, method, status in auth_results:
            print(f"   {endpoint}: طريقة {method} - {status}")
        
        print(f"\n🔍 معاملات الاستعلام الناجحة: {len(param_results)}")
        for endpoint, params, status in param_results:
            print(f"   {endpoint}: {status}")
        
        return len(endpoints) > 0 or len(auth_results) > 0 or len(param_results) > 0

if __name__ == "__main__":
    tester = AdvancedSPAAPITester()
    success = tester.run_advanced_test()
    sys.exit(0 if success else 1)

