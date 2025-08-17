#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار طرق المصادقة المختلفة لـ API وكالة الأنباء السعودية
"""

import requests
import json
import time
from datetime import datetime
import urllib3
import base64

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class SPAAuthTester:
    def __init__(self):
        self.base_url = "https://nwdistapi.spa.gov.sa"
        self.api_key = "owuDXImzoEIyRUJ4564zZ2O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsdgdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkf894jksjds456d56i327893289kj89389d889jkjkjkdk49043656d5asklskGGP"
        self.customer_key = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4="
        self.results = []

    def test_auth_method(self, method_name, headers, test_endpoint="/ClientAppV1/GetStatus"):
        """اختبار طريقة مصادقة محددة"""
        url = f"{self.base_url}{test_endpoint}"
        
        body_data = {
            "clientName": "sara",
            "clientKey": "asdasdasda",
            "languageId": 0
        }
        
        print(f"\n🔐 اختبار طريقة المصادقة: {method_name}")
        print(f"📍 المسار: {test_endpoint}")
        
        try:
            start_time = time.time()
            response = requests.get(
                url,
                headers=headers,
                json=body_data,
                timeout=30,
                verify=False
            )
            end_time = time.time()
            response_time = round(end_time - start_time, 3)
            
            try:
                response_json = response.json()
                response_text = json.dumps(response_json, ensure_ascii=False, indent=2)
            except:
                response_text = response.text[:500] + "..." if len(response.text) > 500 else response.text
            
            result = {
                'method_name': method_name,
                'status_code': response.status_code,
                'response_time': response_time,
                'response_size': len(response.content),
                'response_text': response_text,
                'headers_sent': headers,
                'success': 200 <= response.status_code < 300,
                'timestamp': datetime.now().isoformat()
            }
            
            status_emoji = "✅" if result['success'] else "❌"
            print(f"{status_emoji} الحالة: {response.status_code}")
            print(f"⏱️ زمن الاستجابة: {response_time} ثانية")
            
            if result['success']:
                print(f"🎉 نجح! المصادقة تعمل!")
                print(f"📄 محتوى الاستجابة:")
                print(response_text[:300] + "..." if len(response_text) > 300 else response_text)
            elif response.status_code == 401:
                print(f"🔒 فشل المصادقة (401 Unauthorized)")
            elif response.status_code == 403:
                print(f"🚫 ممنوع (403 Forbidden)")
            elif response.status_code == 404:
                print(f"❓ غير موجود (404 Not Found)")
            else:
                print(f"⚠️ خطأ آخر: {response.status_code}")
                print(f"📄 الاستجابة: {response_text[:200]}")
            
            self.results.append(result)
            return result
            
        except Exception as e:
            print(f"❌ خطأ: {str(e)}")
            error_result = {
                'method_name': method_name,
                'status_code': 'ERROR',
                'error': str(e),
                'success': False,
                'timestamp': datetime.now().isoformat()
            }
            self.results.append(error_result)
            return error_result

    def run_auth_tests(self):
        """تشغيل اختبارات طرق المصادقة المختلفة"""
        print("🔐 بدء اختبار طرق المصادقة المختلفة")
        print("=" * 60)
        
        # طرق المصادقة المختلفة للاختبار
        auth_methods = [
            {
                'name': 'X-API-Key في الهيدر',
                'headers': {
                    'X-API-Key': self.api_key,
                    'Content-Type': 'application/json'
                }
            },
            {
                'name': 'Authorization Bearer',
                'headers': {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
            },
            {
                'name': 'Authorization API Key',
                'headers': {
                    'Authorization': f'ApiKey {self.api_key}',
                    'Content-Type': 'application/json'
                }
            },
            {
                'name': 'Customer Key في الهيدر',
                'headers': {
                    'X-Customer-Key': self.customer_key,
                    'Content-Type': 'application/json'
                }
            },
            {
                'name': 'API Key + Customer Key',
                'headers': {
                    'X-API-Key': self.api_key,
                    'X-Customer-Key': self.customer_key,
                    'Content-Type': 'application/json'
                }
            },
            {
                'name': 'Authorization Bearer Customer Key',
                'headers': {
                    'Authorization': f'Bearer {self.customer_key}',
                    'Content-Type': 'application/json'
                }
            },
            {
                'name': 'Basic Auth (API Key)',
                'headers': {
                    'Authorization': f'Basic {base64.b64encode(f"{self.api_key}:".encode()).decode()}',
                    'Content-Type': 'application/json'
                }
            },
            {
                'name': 'Custom SPA Headers',
                'headers': {
                    'X-SPA-API-Key': self.api_key,
                    'X-SPA-Client-Key': self.customer_key,
                    'Content-Type': 'application/json'
                }
            },
            {
                'name': 'API Key في Query Parameter',
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
        ]
        
        # اختبار كل طريقة
        for method in auth_methods:
            if method['name'] == 'API Key في Query Parameter':
                # اختبار خاص للـ query parameter
                self.test_query_param_auth()
            else:
                self.test_auth_method(method['name'], method['headers'])
            time.sleep(1)
        
        # طباعة الملخص
        self.print_summary()
        self.save_results()

    def test_query_param_auth(self):
        """اختبار API Key كـ query parameter"""
        url = f"{self.base_url}/ClientAppV1/GetStatus?api_key={self.api_key}"
        
        headers = {'Content-Type': 'application/json'}
        body_data = {
            "clientName": "sara",
            "clientKey": "asdasdasda",
            "languageId": 0
        }
        
        print(f"\n🔐 اختبار طريقة المصادقة: API Key في Query Parameter")
        
        try:
            response = requests.get(url, headers=headers, json=body_data, timeout=30, verify=False)
            
            result = {
                'method_name': 'API Key في Query Parameter',
                'status_code': response.status_code,
                'success': 200 <= response.status_code < 300,
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"{'✅' if result['success'] else '❌'} الحالة: {response.status_code}")
            self.results.append(result)
            
        except Exception as e:
            print(f"❌ خطأ: {str(e)}")

    def print_summary(self):
        """طباعة ملخص النتائج"""
        print("\n" + "=" * 60)
        print("📊 ملخص نتائج اختبار المصادقة")
        print("=" * 60)
        
        total_tests = len(self.results)
        successful_tests = len([r for r in self.results if r.get('success', False)])
        
        print(f"📈 إجمالي طرق المصادقة المختبرة: {total_tests}")
        print(f"✅ نجح: {successful_tests}")
        print(f"❌ فشل: {total_tests - successful_tests}")
        
        if successful_tests > 0:
            print(f"\n🎉 طرق المصادقة الناجحة:")
            for result in self.results:
                if result.get('success', False):
                    print(f"  ✅ {result['method_name']}")
        
        print(f"\n📋 جميع النتائج:")
        for result in self.results:
            status = "✅ نجح" if result.get('success', False) else "❌ فشل"
            status_code = result.get('status_code', 'N/A')
            print(f"  • {result['method_name']}: {status} ({status_code})")

    def save_results(self):
        """حفظ النتائج"""
        with open('/home/ubuntu/spa_api_auth_results.json', 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 تم حفظ نتائج المصادقة في: spa_api_auth_results.json")

if __name__ == "__main__":
    tester = SPAAuthTester()
    tester.run_auth_tests()

