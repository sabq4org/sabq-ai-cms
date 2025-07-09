#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار API وكالة الأنباء السعودية
Saudi Press Agency API Test
"""

import requests
import json
import sys
from datetime import datetime
from spa_api_config import API_BASE_URL, API_KEY, CUSTOMER_KEY, HEADERS, TIMEOUT

class SPAAPITester:
    """فئة اختبار API وكالة الأنباء السعودية"""
    
    def __init__(self):
        self.base_url = API_BASE_URL.rstrip('/')
        self.api_key = API_KEY
        self.customer_key = CUSTOMER_KEY
        self.headers = HEADERS.copy()
        self.session = requests.Session()
        
    def test_connection(self):
        """اختبار الاتصال الأساسي"""
        print("🔗 اختبار الاتصال الأساسي...")
        print(f"📍 الرابط: {self.base_url}")
        
        try:
            # اختبار الوصول إلى الرابط الأساسي
            response = self.session.get(self.base_url, headers=self.headers, timeout=TIMEOUT)
            print(f"✅ حالة الاستجابة: {response.status_code}")
            print(f"📊 حجم الاستجابة: {len(response.content)} بايت")
            
            if response.headers.get('content-type'):
                print(f"📄 نوع المحتوى: {response.headers['content-type']}")
                
            return True, response
            
        except requests.exceptions.RequestException as e:
            print(f"❌ خطأ في الاتصال: {e}")
            return False, None
    
    def test_authentication(self):
        """اختبار المصادقة"""
        print("\n🔐 اختبار المصادقة...")
        
        # تجربة طرق مختلفة للمصادقة
        auth_methods = [
            # طريقة 1: API Key في الهيدر
            {
                'name': 'API Key في الهيدر',
                'headers': {**self.headers, 'X-API-Key': self.api_key, 'X-Customer-Key': self.customer_key}
            },
            # طريقة 2: Authorization Bearer
            {
                'name': 'Authorization Bearer',
                'headers': {**self.headers, 'Authorization': f'Bearer {self.api_key}'}
            },
            # طريقة 3: API Key كمعامل
            {
                'name': 'API Key كمعامل',
                'headers': self.headers,
                'params': {'api_key': self.api_key, 'customer_key': self.customer_key}
            }
        ]
        
        for method in auth_methods:
            print(f"\n🧪 تجربة: {method['name']}")
            try:
                params = method.get('params', {})
                response = self.session.get(
                    self.base_url, 
                    headers=method['headers'], 
                    params=params,
                    timeout=TIMEOUT
                )
                print(f"   حالة الاستجابة: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"   ✅ نجحت المصادقة!")
                    return True, method, response
                elif response.status_code == 401:
                    print(f"   ❌ فشل في المصادقة")
                elif response.status_code == 403:
                    print(f"   ❌ غير مخول")
                else:
                    print(f"   ⚠️ استجابة غير متوقعة")
                    
            except requests.exceptions.RequestException as e:
                print(f"   ❌ خطأ: {e}")
        
        return False, None, None
    
    def discover_endpoints(self):
        """استكشاف نقاط النهاية المتاحة"""
        print("\n🔍 استكشاف نقاط النهاية...")
        
        # نقاط نهاية محتملة
        endpoints = [
            '',
            '/api',
            '/v1',
            '/news',
            '/articles',
            '/feeds',
            '/health',
            '/status',
            '/docs',
            '/swagger',
            '/openapi.json'
        ]
        
        available_endpoints = []
        
        for endpoint in endpoints:
            url = f"{self.base_url}{endpoint}"
            try:
                response = self.session.get(url, headers=self.headers, timeout=10)
                print(f"📍 {endpoint or '/'}: {response.status_code}")
                
                if response.status_code in [200, 201, 202]:
                    available_endpoints.append((endpoint, response.status_code))
                    
            except requests.exceptions.RequestException:
                print(f"📍 {endpoint or '/'}: غير متاح")
        
        return available_endpoints
    
    def run_full_test(self):
        """تشغيل الاختبار الكامل"""
        print("=" * 60)
        print("🚀 بدء اختبار API وكالة الأنباء السعودية")
        print("=" * 60)
        print(f"⏰ الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # اختبار الاتصال
        connection_success, connection_response = self.test_connection()
        
        if not connection_success:
            print("\n❌ فشل في الاتصال الأساسي. توقف الاختبار.")
            return False
        
        # اختبار المصادقة
        auth_success, auth_method, auth_response = self.test_authentication()
        
        # استكشاف نقاط النهاية
        endpoints = self.discover_endpoints()
        
        # تلخيص النتائج
        print("\n" + "=" * 60)
        print("📋 ملخص النتائج")
        print("=" * 60)
        print(f"🔗 الاتصال الأساسي: {'✅ نجح' if connection_success else '❌ فشل'}")
        print(f"🔐 المصادقة: {'✅ نجحت' if auth_success else '❌ فشلت'}")
        
        if auth_success:
            print(f"   الطريقة الناجحة: {auth_method['name']}")
        
        print(f"📍 نقاط النهاية المتاحة: {len(endpoints)}")
        for endpoint, status in endpoints:
            print(f"   {endpoint or '/'}: {status}")
        
        return connection_success

if __name__ == "__main__":
    tester = SPAAPITester()
    success = tester.run_full_test()
    sys.exit(0 if success else 1)

