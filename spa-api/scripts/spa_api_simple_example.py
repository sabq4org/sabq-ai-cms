#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
مثال بسيط للاتصال بـ API وكالة الأنباء السعودية
Simple Example for Saudi Press Agency API Connection

هذا المثال يوضح كيفية الاتصال الأساسي بـ API وكالة الأنباء السعودية
"""

import requests
import json
from datetime import datetime

class SimpleSPAAPI:
    """فئة بسيطة للاتصال بـ API وكالة الأنباء السعودية"""
    
    def __init__(self, api_key, customer_key, base_url="https://nwdistapi.spa.gov.sa"):
        """
        تهيئة الاتصال بـ API
        
        Args:
            api_key (str): مفتاح الـ API
            customer_key (str): مفتاح العميل
            base_url (str): الرابط الأساسي للـ API
        """
        self.api_key = api_key
        self.customer_key = customer_key
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        
        # إعداد الهيدرز الأساسية
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SPA-API-Client/1.0'
        })
    
    def test_connection(self):
        """
        اختبار الاتصال الأساسي
        
        Returns:
            dict: نتيجة الاختبار
        """
        try:
            response = self.session.get(self.base_url, timeout=30)
            
            return {
                'success': True,
                'status_code': response.status_code,
                'response_time': response.elapsed.total_seconds(),
                'server': response.headers.get('Server', 'Unknown'),
                'content_length': len(response.content),
                'message': 'تم الاتصال بنجاح' if response.status_code < 500 else 'خطأ في الخادم'
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في الاتصال'
            }
    
    def authenticate(self, method='headers'):
        """
        محاولة المصادقة مع الـ API
        
        Args:
            method (str): طريقة المصادقة ('headers', 'params', 'bearer')
            
        Returns:
            dict: نتيجة المصادقة
        """
        auth_configs = {
            'headers': {
                'headers': {
                    'X-API-Key': self.api_key,
                    'X-Customer-Key': self.customer_key
                },
                'params': {}
            },
            'params': {
                'headers': {},
                'params': {
                    'api_key': self.api_key,
                    'customer_key': self.customer_key
                }
            },
            'bearer': {
                'headers': {
                    'Authorization': f'Bearer {self.api_key}'
                },
                'params': {}
            }
        }
        
        config = auth_configs.get(method, auth_configs['headers'])
        
        try:
            # تحديث الهيدرز
            headers = {**self.session.headers, **config['headers']}
            
            response = self.session.get(
                self.base_url,
                headers=headers,
                params=config['params'],
                timeout=30
            )
            
            return {
                'success': response.status_code in [200, 201, 202],
                'status_code': response.status_code,
                'method': method,
                'authenticated': response.status_code != 401,
                'message': self._get_status_message(response.status_code)
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'method': method,
                'message': 'فشل في المصادقة'
            }
    
    def get_news(self, endpoint='/news', limit=10):
        """
        محاولة استرجاع الأخبار
        
        Args:
            endpoint (str): نقطة النهاية
            limit (int): عدد الأخبار المطلوبة
            
        Returns:
            dict: نتيجة الطلب
        """
        url = f"{self.base_url}{endpoint}"
        
        # تجربة طرق مختلفة للمصادقة
        auth_methods = [
            {'X-API-Key': self.api_key, 'X-Customer-Key': self.customer_key},
            {'Authorization': f'Bearer {self.api_key}'},
            {'API-Key': self.api_key, 'Customer-Key': self.customer_key}
        ]
        
        for i, auth_headers in enumerate(auth_methods, 1):
            try:
                headers = {**self.session.headers, **auth_headers}
                params = {'limit': limit} if limit else {}
                
                response = self.session.get(url, headers=headers, params=params, timeout=30)
                
                result = {
                    'success': response.status_code in [200, 201, 202],
                    'status_code': response.status_code,
                    'auth_method': i,
                    'endpoint': endpoint,
                    'message': self._get_status_message(response.status_code)
                }
                
                if response.status_code in [200, 201, 202]:
                    try:
                        result['data'] = response.json()
                        result['data_type'] = 'json'
                    except:
                        result['data'] = response.text[:500]  # أول 500 حرف
                        result['data_type'] = 'text'
                    
                    return result
                
            except requests.exceptions.RequestException as e:
                continue
        
        return {
            'success': False,
            'message': 'فشل في جميع محاولات الاتصال',
            'endpoint': endpoint
        }
    
    def _get_status_message(self, status_code):
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

def main():
    """الدالة الرئيسية للاختبار"""
    print("🚀 مثال بسيط لاختبار API وكالة الأنباء السعودية")
    print("=" * 60)
    
    # بيانات الاتصال (يجب استبدالها بالبيانات الحقيقية)
    API_KEY = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP"
    CUSTOMER_KEY = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4="
    
    # إنشاء كائن الـ API
    api = SimpleSPAAPI(API_KEY, CUSTOMER_KEY)
    
    # 1. اختبار الاتصال
    print("1️⃣ اختبار الاتصال الأساسي...")
    connection_result = api.test_connection()
    print(f"   النتيجة: {connection_result['message']}")
    print(f"   حالة الاستجابة: {connection_result.get('status_code', 'غير متاح')}")
    
    if connection_result['success']:
        print(f"   زمن الاستجابة: {connection_result['response_time']:.2f} ثانية")
        print(f"   الخادم: {connection_result['server']}")
    
    # 2. اختبار المصادقة
    print("\n2️⃣ اختبار المصادقة...")
    auth_methods = ['headers', 'params', 'bearer']
    
    for method in auth_methods:
        auth_result = api.authenticate(method)
        print(f"   طريقة {method}: {auth_result['message']} ({auth_result.get('status_code', 'غير متاح')})")
    
    # 3. اختبار استرجاع الأخبار
    print("\n3️⃣ اختبار استرجاع الأخبار...")
    endpoints = ['/news', '/api/news', '/api/v1/news', '/articles', '/feeds']
    
    for endpoint in endpoints:
        news_result = api.get_news(endpoint)
        print(f"   {endpoint}: {news_result['message']} ({news_result.get('status_code', 'غير متاح')})")
        
        if news_result['success']:
            print(f"      ✅ تم استرجاع البيانات بنجاح!")
            if 'data' in news_result:
                print(f"      نوع البيانات: {news_result['data_type']}")
            break
    
    print("\n" + "=" * 60)
    print("✅ انتهى الاختبار")
    print(f"⏰ الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()

