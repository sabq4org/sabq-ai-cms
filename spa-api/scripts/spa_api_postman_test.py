#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار API وكالة الأنباء السعودية - ملف Postman المحدث
تاريخ الإنشاء: 9 يوليو 2025
"""

import requests
import json
import time
from datetime import datetime
import urllib3

# تعطيل تحذيرات SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class SPAAPITester:
    def __init__(self):
        self.base_url = "https://nwdistapi.spa.gov.sa"
        self.api_key = "owuDXImzoEIyRUJ4564zZ2O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsdgdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkf894jksjds456d56i327893289kj89389d889jkjkjkdk49043656d5asklskGGP"
        self.headers = {
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json',
            'User-Agent': 'SPA-API-Tester/1.0'
        }
        self.results = []
        
    def test_endpoint(self, endpoint_name, path, method, body_data):
        """اختبار نقطة نهاية واحدة"""
        url = f"{self.base_url}{path}"
        
        print(f"\n🔍 اختبار: {endpoint_name}")
        print(f"📍 المسار: {path}")
        print(f"🔧 الطريقة: {method}")
        
        try:
            start_time = time.time()
            
            if method.upper() == 'GET':
                response = requests.get(
                    url, 
                    headers=self.headers, 
                    json=body_data,
                    timeout=30,
                    verify=False
                )
            else:
                response = requests.request(
                    method.upper(),
                    url,
                    headers=self.headers,
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
            except:
                response_text = response.text[:500] + "..." if len(response.text) > 500 else response.text
            
            result = {
                'endpoint_name': endpoint_name,
                'path': path,
                'method': method,
                'status_code': response.status_code,
                'response_time': response_time,
                'response_size': len(response.content),
                'headers': dict(response.headers),
                'response_text': response_text,
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
                if response_json:
                    print(f"📄 محتوى الاستجابة:")
                    print(response_text[:200] + "..." if len(response_text) > 200 else response_text)
            else:
                print(f"⚠️ فشل الطلب: {response.status_code}")
                print(f"📄 رسالة الخطأ: {response_text[:200]}")
            
            self.results.append(result)
            return result
            
        except requests.exceptions.Timeout:
            print("⏰ انتهت مهلة الطلب")
            error_result = {
                'endpoint_name': endpoint_name,
                'path': path,
                'method': method,
                'status_code': 'TIMEOUT',
                'response_time': 30.0,
                'error': 'Request timeout',
                'success': False,
                'timestamp': datetime.now().isoformat()
            }
            self.results.append(error_result)
            return error_result
            
        except requests.exceptions.ConnectionError:
            print("🔌 خطأ في الاتصال")
            error_result = {
                'endpoint_name': endpoint_name,
                'path': path,
                'method': method,
                'status_code': 'CONNECTION_ERROR',
                'error': 'Connection error',
                'success': False,
                'timestamp': datetime.now().isoformat()
            }
            self.results.append(error_result)
            return error_result
            
        except Exception as e:
            print(f"❌ خطأ غير متوقع: {str(e)}")
            error_result = {
                'endpoint_name': endpoint_name,
                'path': path,
                'method': method,
                'status_code': 'ERROR',
                'error': str(e),
                'success': False,
                'timestamp': datetime.now().isoformat()
            }
            self.results.append(error_result)
            return error_result

    def run_all_tests(self):
        """تشغيل جميع الاختبارات"""
        print("🚀 بدء اختبار API وكالة الأنباء السعودية - ملف Postman المحدث")
        print("=" * 60)
        
        # تعريف نقاط النهاية للاختبار
        endpoints = [
            {
                'name': 'GetStatus',
                'path': '/ClientAppV1/GetStatus',
                'method': 'GET',
                'body': {
                    "clientName": "sara",
                    "clientKey": "asdasdasda",
                    "languageId": 0
                }
            },
            {
                'name': 'GetBaskets',
                'path': '/ClientAppV1/GetBaskets',
                'method': 'GET',
                'body': {
                    "clientName": "fdf",
                    "clientKey": "asdasdasdas",
                    "languageId": 1
                }
            },
            {
                'name': 'GetNextNews',
                'path': '/ClientAppV1/GetNextNews',
                'method': 'GET',
                'body': {
                    "Client": {
                        "ClientName": "Sara",
                        "ClientKey": "asdasdasdadfdgfdhgfsgggggggggggfdgsfdgsfdsadgdsgdsgsddsgdf",
                        "LanguageId": 1
                    },
                    "LastNewsId": 1,
                    "BasketId": 3,
                    "IsRecived": False,
                    "LoadMedia": False
                }
            },
            {
                'name': 'GetAllClassifications',
                'path': '/ClientAppV1/GetStatus',  # ملاحظة: يبدو أن هناك خطأ في ملف Postman
                'method': 'GET',
                'body': {
                    "clientName": "sara",
                    "clientKey": "aasdasdas",
                    "languageId": 0
                }
            },
            {
                'name': 'GetAllSiteSections',
                'path': '/ClientAppV1/GetAllSiteSections',
                'method': 'GET',
                'body': {
                    "clientName": "sara",
                    "clientKey": "asdasdasdas",
                    "languageId": 0
                }
            },
            {
                'name': 'GetAllPriorities',
                'path': '/ClientAppV1/GetAllPriorities',
                'method': 'GET',
                'body': {
                    "clientName": "sara",
                    "clientKey": "asdasdasdas",
                    "languageId": 0
                }
            },
            {
                'name': 'GetAllRegions',
                'path': '/ClientAppV1/GetAllRegions',
                'method': 'GET',
                'body': {
                    "clientName": "sara",
                    "clientKey": "asdasdasdas",
                    "languageId": 0
                }
            }
        ]
        
        # تشغيل الاختبارات
        for endpoint in endpoints:
            self.test_endpoint(
                endpoint['name'],
                endpoint['path'],
                endpoint['method'],
                endpoint['body']
            )
            time.sleep(1)  # توقف قصير بين الطلبات
        
        # طباعة الملخص
        self.print_summary()
        
        # حفظ النتائج
        self.save_results()

    def print_summary(self):
        """طباعة ملخص النتائج"""
        print("\n" + "=" * 60)
        print("📊 ملخص نتائج الاختبار")
        print("=" * 60)
        
        total_tests = len(self.results)
        successful_tests = len([r for r in self.results if r.get('success', False)])
        failed_tests = total_tests - successful_tests
        
        print(f"📈 إجمالي الاختبارات: {total_tests}")
        print(f"✅ نجح: {successful_tests}")
        print(f"❌ فشل: {failed_tests}")
        print(f"📊 معدل النجاح: {(successful_tests/total_tests)*100:.1f}%")
        
        if successful_tests > 0:
            avg_response_time = sum([r.get('response_time', 0) for r in self.results if r.get('success', False)]) / successful_tests
            print(f"⏱️ متوسط زمن الاستجابة: {avg_response_time:.3f} ثانية")
        
        print("\n📋 تفاصيل النتائج:")
        for result in self.results:
            status = "✅ نجح" if result.get('success', False) else "❌ فشل"
            status_code = result.get('status_code', 'N/A')
            response_time = result.get('response_time', 0)
            print(f"  • {result['endpoint_name']}: {status} ({status_code}) - {response_time:.3f}s")

    def save_results(self):
        """حفظ النتائج في ملفات"""
        # حفظ النتائج كـ JSON
        with open('/home/ubuntu/spa_api_postman_results.json', 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        # حفظ تقرير نصي
        with open('/home/ubuntu/spa_api_postman_report.txt', 'w', encoding='utf-8') as f:
            f.write("تقرير اختبار API وكالة الأنباء السعودية - ملف Postman المحدث\n")
            f.write("=" * 60 + "\n")
            f.write(f"تاريخ الاختبار: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"عدد نقاط النهاية المختبرة: {len(self.results)}\n\n")
            
            for result in self.results:
                f.write(f"نقطة النهاية: {result['endpoint_name']}\n")
                f.write(f"المسار: {result['path']}\n")
                f.write(f"الطريقة: {result['method']}\n")
                f.write(f"رمز الحالة: {result.get('status_code', 'N/A')}\n")
                f.write(f"زمن الاستجابة: {result.get('response_time', 0):.3f} ثانية\n")
                f.write(f"النجاح: {'نعم' if result.get('success', False) else 'لا'}\n")
                if 'error' in result:
                    f.write(f"الخطأ: {result['error']}\n")
                f.write("-" * 40 + "\n")
        
        print(f"\n💾 تم حفظ النتائج في:")
        print(f"  • spa_api_postman_results.json")
        print(f"  • spa_api_postman_report.txt")

if __name__ == "__main__":
    tester = SPAAPITester()
    tester.run_all_tests()

