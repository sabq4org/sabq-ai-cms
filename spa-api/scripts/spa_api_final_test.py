#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار نهائي لـ API وكالة الأنباء السعودية - بيانات محدثة
تاريخ الإنشاء: 9 يوليو 2025
"""

import requests
import json
import time
from datetime import datetime
import urllib3

# تعطيل تحذيرات SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class SPAFinalTester:
    def __init__(self):
        self.base_url = "https://nwdistapi.spa.gov.sa"
        # API Key المحدث
        self.api_key = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP"
        self.customer_key = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4="
        self.results = []
        
    def test_endpoint_comprehensive(self, endpoint_name, path, method, body_data, auth_methods):
        """اختبار شامل لنقطة نهاية واحدة مع طرق مصادقة متعددة"""
        url = f"{self.base_url}{path}"
        
        print(f"\n🔍 اختبار شامل: {endpoint_name}")
        print(f"📍 المسار: {path}")
        print("=" * 50)
        
        endpoint_results = []
        
        for auth_method in auth_methods:
            print(f"\n🔐 طريقة المصادقة: {auth_method['name']}")
            
            try:
                start_time = time.time()
                
                response = requests.request(
                    method.upper(),
                    url,
                    headers=auth_method['headers'],
                    json=body_data,
                    timeout=30,
                    verify=False
                )
                
                end_time = time.time()
                response_time = round(end_time - start_time, 3)
                
                # محاولة تحليل الاستجابة كـ JSON
                try:
                    response_json = response.json()
                    response_text = json.dumps(response_json, ensure_ascii=False, indent=2)
                    has_json = True
                except:
                    response_text = response.text[:1000] + "..." if len(response.text) > 1000 else response.text
                    has_json = False
                
                result = {
                    'endpoint_name': endpoint_name,
                    'path': path,
                    'method': method,
                    'auth_method': auth_method['name'],
                    'status_code': response.status_code,
                    'response_time': response_time,
                    'response_size': len(response.content),
                    'headers': dict(response.headers),
                    'response_text': response_text,
                    'has_json_response': has_json,
                    'success': 200 <= response.status_code < 300,
                    'timestamp': datetime.now().isoformat()
                }
                
                # طباعة النتيجة
                status_emoji = "✅" if result['success'] else "❌"
                print(f"{status_emoji} الحالة: {response.status_code}")
                print(f"⏱️ زمن الاستجابة: {response_time} ثانية")
                print(f"📦 حجم الاستجابة: {len(response.content)} بايت")
                
                if result['success']:
                    print(f"🎉 نجح الطلب!")
                    if has_json and response_json:
                        print(f"📄 محتوى الاستجابة (JSON):")
                        print(response_text[:300] + "..." if len(response_text) > 300 else response_text)
                    else:
                        print(f"📄 محتوى الاستجابة (نص):")
                        print(response_text[:200] + "..." if len(response_text) > 200 else response_text)
                elif response.status_code == 401:
                    print(f"🔒 فشل المصادقة (401 Unauthorized)")
                elif response.status_code == 403:
                    print(f"🚫 ممنوع (403 Forbidden)")
                elif response.status_code == 404:
                    print(f"❓ غير موجود (404 Not Found)")
                else:
                    print(f"⚠️ خطأ آخر: {response.status_code}")
                    if response_text:
                        print(f"📄 الاستجابة: {response_text[:200]}")
                
                endpoint_results.append(result)
                
            except requests.exceptions.Timeout:
                print("⏰ انتهت مهلة الطلب")
                error_result = {
                    'endpoint_name': endpoint_name,
                    'path': path,
                    'method': method,
                    'auth_method': auth_method['name'],
                    'status_code': 'TIMEOUT',
                    'response_time': 30.0,
                    'error': 'Request timeout',
                    'success': False,
                    'timestamp': datetime.now().isoformat()
                }
                endpoint_results.append(error_result)
                
            except requests.exceptions.ConnectionError:
                print("🔌 خطأ في الاتصال")
                error_result = {
                    'endpoint_name': endpoint_name,
                    'path': path,
                    'method': method,
                    'auth_method': auth_method['name'],
                    'status_code': 'CONNECTION_ERROR',
                    'error': 'Connection error',
                    'success': False,
                    'timestamp': datetime.now().isoformat()
                }
                endpoint_results.append(error_result)
                
            except Exception as e:
                print(f"❌ خطأ غير متوقع: {str(e)}")
                error_result = {
                    'endpoint_name': endpoint_name,
                    'path': path,
                    'method': method,
                    'auth_method': auth_method['name'],
                    'status_code': 'ERROR',
                    'error': str(e),
                    'success': False,
                    'timestamp': datetime.now().isoformat()
                }
                endpoint_results.append(error_result)
            
            time.sleep(0.5)  # توقف قصير بين طرق المصادقة
        
        self.results.extend(endpoint_results)
        return endpoint_results

    def run_comprehensive_test(self):
        """تشغيل اختبار شامل لجميع نقاط النهاية"""
        print("🚀 بدء الاختبار الشامل النهائي - API وكالة الأنباء السعودية")
        print("🔑 استخدام API Key المحدث")
        print("=" * 70)
        
        # طرق المصادقة للاختبار
        auth_methods = [
            {
                'name': 'X-API-Key (المعياري)',
                'headers': {
                    'X-API-Key': self.api_key,
                    'Content-Type': 'application/json',
                    'User-Agent': 'SPA-API-Tester/2.0'
                }
            },
            {
                'name': 'API Key + Customer Key',
                'headers': {
                    'X-API-Key': self.api_key,
                    'X-Customer-Key': self.customer_key,
                    'Content-Type': 'application/json',
                    'User-Agent': 'SPA-API-Tester/2.0'
                }
            },
            {
                'name': 'Authorization Bearer',
                'headers': {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json',
                    'User-Agent': 'SPA-API-Tester/2.0'
                }
            }
        ]
        
        # نقاط النهاية للاختبار (الأهم أولاً)
        endpoints = [
            {
                'name': 'GetStatus',
                'path': '/ClientAppV1/GetStatus',
                'method': 'GET',
                'body': {
                    "clientName": "TestClient",
                    "clientKey": "TestKey123",
                    "languageId": 1
                }
            },
            {
                'name': 'GetBaskets',
                'path': '/ClientAppV1/GetBaskets',
                'method': 'GET',
                'body': {
                    "clientName": "TestClient",
                    "clientKey": "TestKey123",
                    "languageId": 1
                }
            },
            {
                'name': 'GetNextNews',
                'path': '/ClientAppV1/GetNextNews',
                'method': 'GET',
                'body': {
                    "Client": {
                        "ClientName": "TestClient",
                        "ClientKey": "TestKey123",
                        "LanguageId": 1
                    },
                    "LastNewsId": 0,
                    "BasketId": 1,
                    "IsRecived": False,
                    "LoadMedia": False
                }
            }
        ]
        
        # تشغيل الاختبارات
        for endpoint in endpoints:
            self.test_endpoint_comprehensive(
                endpoint['name'],
                endpoint['path'],
                endpoint['method'],
                endpoint['body'],
                auth_methods
            )
            print("\n" + "="*50)
            time.sleep(1)  # توقف بين نقاط النهاية
        
        # طباعة الملخص
        self.print_comprehensive_summary()
        
        # حفظ النتائج
        self.save_comprehensive_results()

    def print_comprehensive_summary(self):
        """طباعة ملخص شامل للنتائج"""
        print("\n" + "=" * 70)
        print("📊 ملخص شامل لنتائج الاختبار النهائي")
        print("=" * 70)
        
        total_tests = len(self.results)
        successful_tests = len([r for r in self.results if r.get('success', False)])
        failed_tests = total_tests - successful_tests
        
        print(f"📈 إجمالي الاختبارات: {total_tests}")
        print(f"✅ نجح: {successful_tests}")
        print(f"❌ فشل: {failed_tests}")
        
        if total_tests > 0:
            print(f"📊 معدل النجاح: {(successful_tests/total_tests)*100:.1f}%")
        
        # تجميع النتائج حسب نقطة النهاية
        endpoints_summary = {}
        for result in self.results:
            endpoint = result['endpoint_name']
            if endpoint not in endpoints_summary:
                endpoints_summary[endpoint] = {'success': 0, 'total': 0, 'status_codes': set()}
            
            endpoints_summary[endpoint]['total'] += 1
            if result.get('success', False):
                endpoints_summary[endpoint]['success'] += 1
            endpoints_summary[endpoint]['status_codes'].add(str(result.get('status_code', 'N/A')))
        
        print(f"\n📋 ملخص حسب نقطة النهاية:")
        for endpoint, summary in endpoints_summary.items():
            success_rate = (summary['success'] / summary['total']) * 100 if summary['total'] > 0 else 0
            status_codes = ', '.join(summary['status_codes'])
            print(f"  • {endpoint}: {summary['success']}/{summary['total']} ({success_rate:.1f}%) - رموز: {status_codes}")
        
        # البحث عن أي نجاح
        successful_results = [r for r in self.results if r.get('success', False)]
        if successful_results:
            print(f"\n🎉 تم العثور على {len(successful_results)} اختبار ناجح!")
            for result in successful_results:
                print(f"  ✅ {result['endpoint_name']} مع {result['auth_method']}")
        else:
            print(f"\n⚠️ لم ينجح أي اختبار - جميع الطلبات فشلت")
            
            # تحليل أسباب الفشل
            status_codes = {}
            for result in self.results:
                code = str(result.get('status_code', 'N/A'))
                status_codes[code] = status_codes.get(code, 0) + 1
            
            print(f"\n📊 توزيع رموز الحالة:")
            for code, count in status_codes.items():
                print(f"  • {code}: {count} مرة")

    def save_comprehensive_results(self):
        """حفظ النتائج الشاملة"""
        # حفظ النتائج كـ JSON
        with open('/home/ubuntu/spa_api_final_results.json', 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        # حفظ تقرير نصي مفصل
        with open('/home/ubuntu/spa_api_final_report.txt', 'w', encoding='utf-8') as f:
            f.write("تقرير شامل نهائي - اختبار API وكالة الأنباء السعودية\n")
            f.write("=" * 60 + "\n")
            f.write(f"تاريخ الاختبار: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"API Key المستخدم: {self.api_key[:20]}...\n")
            f.write(f"عدد الاختبارات: {len(self.results)}\n\n")
            
            for result in self.results:
                f.write(f"نقطة النهاية: {result['endpoint_name']}\n")
                f.write(f"المسار: {result['path']}\n")
                f.write(f"طريقة المصادقة: {result['auth_method']}\n")
                f.write(f"رمز الحالة: {result.get('status_code', 'N/A')}\n")
                f.write(f"زمن الاستجابة: {result.get('response_time', 0):.3f} ثانية\n")
                f.write(f"النجاح: {'نعم' if result.get('success', False) else 'لا'}\n")
                
                if result.get('success', False) and result.get('response_text'):
                    f.write(f"محتوى الاستجابة:\n{result['response_text'][:500]}\n")
                elif 'error' in result:
                    f.write(f"الخطأ: {result['error']}\n")
                
                f.write("-" * 40 + "\n")
        
        print(f"\n💾 تم حفظ النتائج النهائية في:")
        print(f"  • spa_api_final_results.json")
        print(f"  • spa_api_final_report.txt")

if __name__ == "__main__":
    tester = SPAFinalTester()
    tester.run_comprehensive_test()

