#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار نهائي لـ API وكالة الأنباء السعودية - نسخة محدثة
بناءً على النتائج الناجحة
"""

import requests
import json
import time
from datetime import datetime
import urllib3

# تعطيل تحذيرات SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# بيانات المصادقة
API_KEY = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP"
CUSTOMER_KEY = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4="
BASE_URL = "https://nwdistapi.spa.gov.sa"

def test_endpoint(endpoint_name, path, method='GET', headers=None, data=None):
    """اختبار نقطة نهاية واحدة"""
    url = f"{BASE_URL}{path}"
    
    print(f"\n🔍 اختبار: {endpoint_name}")
    print(f"📍 المسار: {path}")
    print(f"📋 الطريقة: {method}")
    
    try:
        start_time = time.time()
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=data,
            timeout=30,
            verify=False
        )
        
        end_time = time.time()
        response_time = round(end_time - start_time, 3)
        
        print(f"✅ الحالة: {response.status_code}")
        print(f"⏱️ زمن الاستجابة: {response_time} ثانية")
        
        # محاولة تحليل الاستجابة كـ JSON
        try:
            response_json = response.json()
            print(f"📄 الاستجابة:")
            print(json.dumps(response_json, ensure_ascii=False, indent=2))
        except:
            print(f"📄 الاستجابة (نص): {response.text[:200]}...")
        
        return {
            'success': response.status_code in [200, 201, 202],
            'status_code': response.status_code,
            'response_time': response_time,
            'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        }
        
    except Exception as e:
        print(f"❌ خطأ: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def run_tests():
    """تشغيل جميع الاختبارات"""
    print("🚀 بدء اختبار API وكالة الأنباء السعودية")
    print("=" * 60)
    print(f"⏰ الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    results = []
    
    # 1. اختبار GetStatus - الطريقة الناجحة
    print("\n1️⃣ اختبار GetStatus (X-API-Key)...")
    result = test_endpoint(
        "GetStatus",
        "/ClientAppV1/GetStatus",
        "GET",
        headers={
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "SPA-API-Tester/2.0"
        }
    )
    results.append(result)
    
    # 2. اختبار GetStatus مع Customer Key
    print("\n2️⃣ اختبار GetStatus (API Key + Customer Key)...")
    result = test_endpoint(
        "GetStatus with Customer Key",
        "/ClientAppV1/GetStatus",
        "GET",
        headers={
            "X-API-Key": API_KEY,
            "X-Customer-Key": CUSTOMER_KEY,
            "Content-Type": "application/json",
            "User-Agent": "SPA-API-Tester/2.0"
        }
    )
    results.append(result)
    
    # 3. اختبار GetBaskets
    print("\n3️⃣ اختبار GetBaskets...")
    result = test_endpoint(
        "GetBaskets",
        "/ClientAppV1/GetBaskets",
        "GET",
        headers={
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "SPA-API-Tester/2.0"
        }
    )
    results.append(result)
    
    # 4. اختبار GetNextNews
    print("\n4️⃣ اختبار GetNextNews...")
    result = test_endpoint(
        "GetNextNews",
        "/ClientAppV1/GetNextNews",
        "GET",
        headers={
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "SPA-API-Tester/2.0"
        }
    )
    results.append(result)
    
    # طباعة الملخص
    print("\n" + "=" * 60)
    print("📊 ملخص النتائج")
    print("=" * 60)
    
    successful = sum(1 for r in results if r.get('success'))
    total = len(results)
    
    print(f"✅ نجح: {successful}")
    print(f"❌ فشل: {total - successful}")
    print(f"📊 معدل النجاح: {(successful/total)*100:.1f}%")
    
    # إذا كان هناك نجاح مع GetStatus، اعرض الحالة
    for i, result in enumerate(results[:2]):  # أول اثنين هما GetStatus
        if result.get('success') and isinstance(result.get('data'), dict):
            print(f"\n🎉 حالة الحساب (اختبار {i+1}):")
            print(f"   - نشط: {'نعم' if result['data'].get('isActiveClient') else 'لا'}")
            print(f"   - الرسالة: {result['data'].get('message', 'غير متوفر')}")
    
    print("\n✅ انتهى الاختبار")
    
    # حفظ النتائج
    with open('was_api_test_results.json', 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'results': results
        }, f, ensure_ascii=False, indent=2)
    
    print("💾 تم حفظ النتائج في: was_api_test_results.json")

if __name__ == "__main__":
    run_tests() 