#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
محرك التوصيات الذكي - سبق الذكية
اختبار الأداء وضمان زمن الاستجابة
Sabq AI Recommendation Engine - Performance Testing
"""

import asyncio
import time
import statistics
import aiohttp
import psutil
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor
import pytest
import logging

# إعداد السجلات
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerformanceTest:
    """فئة اختبار الأداء الشامل"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results = {}
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """بدء جلسة HTTP"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=100)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """إنهاء جلسة HTTP"""
        if self.session:
            await self.session.close()
    
    async def health_check(self) -> bool:
        """فحص صحة النظام"""
        try:
            async with self.session.get(f"{self.base_url}/health") as response:
                data = await response.json()
                return data.get('status') == 'healthy'
        except Exception as e:
            logger.error(f"فشل فحص الصحة: {e}")
            return False
    
    async def measure_response_time(self, endpoint: str, method: str = "GET", 
                                  data: Optional[Dict] = None, 
                                  iterations: int = 100) -> Dict[str, Any]:
        """قياس زمن الاستجابة"""
        times = []
        errors = 0
        
        logger.info(f"بدء اختبار {endpoint} مع {iterations} طلب...")
        
        for i in range(iterations):
            start_time = time.time()
            
            try:
                if method.upper() == "POST":
                    async with self.session.post(
                        f"{self.base_url}{endpoint}", 
                        json=data
                    ) as response:
                        await response.read()
                        if response.status == 200:
                            times.append((time.time() - start_time) * 1000)  # تحويل للملي ثانية
                        else:
                            errors += 1
                else:
                    async with self.session.get(f"{self.base_url}{endpoint}") as response:
                        await response.read()
                        if response.status == 200:
                            times.append((time.time() - start_time) * 1000)
                        else:
                            errors += 1
                            
            except Exception as e:
                logger.error(f"خطأ في الطلب {i+1}: {e}")
                errors += 1
            
            # انتظار قصير لتجنب إغراق الخادم
            if i % 10 == 0 and i > 0:
                await asyncio.sleep(0.1)
        
        if not times:
            return {"error": "لم تنجح أي طلبات"}
        
        return {
            "endpoint": endpoint,
            "total_requests": iterations,
            "successful_requests": len(times),
            "failed_requests": errors,
            "success_rate": (len(times) / iterations) * 100,
            "min_time": min(times),
            "max_time": max(times),
            "avg_time": statistics.mean(times),
            "median_time": statistics.median(times),
            "p95_time": self.percentile(times, 95),
            "p99_time": self.percentile(times, 99),
            "under_200ms": sum(1 for t in times if t < 200),
            "under_200ms_percentage": (sum(1 for t in times if t < 200) / len(times)) * 100
        }
    
    def percentile(self, data: List[float], p: int) -> float:
        """حساب المئين"""
        sorted_data = sorted(data)
        index = (p / 100) * (len(sorted_data) - 1)
        lower = int(index)
        upper = lower + 1
        
        if upper >= len(sorted_data):
            return sorted_data[-1]
        
        weight = index - lower
        return sorted_data[lower] * (1 - weight) + sorted_data[upper] * weight
    
    async def load_test(self, endpoint: str, concurrent_users: int = 50, 
                       duration_seconds: int = 60) -> Dict[str, Any]:
        """اختبار الحمولة"""
        logger.info(f"بدء اختبار الحمولة: {concurrent_users} مستخدم متزامن لمدة {duration_seconds} ثانية")
        
        start_time = time.time()
        end_time = start_time + duration_seconds
        total_requests = 0
        successful_requests = 0
        response_times = []
        
        async def worker():
            """عامل معالجة الطلبات"""
            nonlocal total_requests, successful_requests, response_times
            
            while time.time() < end_time:
                request_start = time.time()
                
                try:
                    async with self.session.get(f"{self.base_url}{endpoint}") as response:
                        await response.read()
                        
                        total_requests += 1
                        if response.status == 200:
                            successful_requests += 1
                            response_times.append((time.time() - request_start) * 1000)
                            
                except Exception as e:
                    logger.error(f"خطأ في الطلب: {e}")
                    total_requests += 1
                
                # انتظار قصير
                await asyncio.sleep(0.01)
        
        # تشغيل العمال المتزامنين
        tasks = [worker() for _ in range(concurrent_users)]
        await asyncio.gather(*tasks)
        
        actual_duration = time.time() - start_time
        
        return {
            "endpoint": endpoint,
            "concurrent_users": concurrent_users,
            "duration": actual_duration,
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "failed_requests": total_requests - successful_requests,
            "requests_per_second": total_requests / actual_duration,
            "success_rate": (successful_requests / total_requests) * 100 if total_requests > 0 else 0,
            "avg_response_time": statistics.mean(response_times) if response_times else 0,
            "p95_response_time": self.percentile(response_times, 95) if response_times else 0,
            "under_200ms_percentage": (sum(1 for t in response_times if t < 200) / len(response_times)) * 100 if response_times else 0
        }
    
    async def memory_usage_test(self, duration_seconds: int = 300) -> Dict[str, Any]:
        """اختبار استخدام الذاكرة"""
        logger.info(f"بدء مراقبة الذاكرة لمدة {duration_seconds} ثانية...")
        
        memory_readings = []
        cpu_readings = []
        start_time = time.time()
        
        while time.time() - start_time < duration_seconds:
            memory_info = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent(interval=1)
            
            memory_readings.append(memory_info.percent)
            cpu_readings.append(cpu_percent)
            
            await asyncio.sleep(5)  # قراءة كل 5 ثوان
        
        return {
            "duration": duration_seconds,
            "memory_usage": {
                "min": min(memory_readings),
                "max": max(memory_readings),
                "avg": statistics.mean(memory_readings),
                "final": memory_readings[-1] if memory_readings else 0
            },
            "cpu_usage": {
                "min": min(cpu_readings),
                "max": max(cpu_readings),
                "avg": statistics.mean(cpu_readings),
                "final": cpu_readings[-1] if cpu_readings else 0
            }
        }
    
    async def cache_performance_test(self) -> Dict[str, Any]:
        """اختبار أداء التخزين المؤقت"""
        logger.info("اختبار أداء التخزين المؤقت...")
        
        # طلب أولي لتعبئة التخزين المؤقت
        test_endpoint = "/api/v1/recommendations/user/test_user_123"
        
        # قياس أول طلب (بدون تخزين مؤقت)
        first_request = await self.measure_response_time(test_endpoint, iterations=1)
        
        # انتظار قصير
        await asyncio.sleep(0.5)
        
        # قياس الطلب الثاني (مع تخزين مؤقت)
        second_request = await self.measure_response_time(test_endpoint, iterations=1)
        
        # اختبار عدة طلبات متتالية للتخزين المؤقت
        cached_requests = await self.measure_response_time(test_endpoint, iterations=50)
        
        return {
            "first_request_time": first_request.get("avg_time", 0),
            "second_request_time": second_request.get("avg_time", 0),
            "cached_avg_time": cached_requests.get("avg_time", 0),
            "cache_improvement": (
                (first_request.get("avg_time", 0) - cached_requests.get("avg_time", 0)) 
                / first_request.get("avg_time", 1) * 100
            ),
            "cached_under_200ms_percentage": cached_requests.get("under_200ms_percentage", 0)
        }
    
    async def run_comprehensive_test(self) -> Dict[str, Any]:
        """تشغيل اختبار شامل"""
        logger.info("🚀 بدء الاختبار الشامل للأداء...")
        
        # فحص صحة النظام
        is_healthy = await self.health_check()
        if not is_healthy:
            return {"error": "النظام غير صحي، لا يمكن تشغيل الاختبارات"}
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "system_health": is_healthy
        }
        
        # اختبارات نقاط النهاية المختلفة
        endpoints_to_test = [
            "/health",
            "/api/v1/recommendations/user/test_user_123",
            "/api/v1/recommendations/trending",
            "/api/v1/recommendations/similar/test_article_456",
            "/info"
        ]
        
        logger.info("📊 اختبار زمن الاستجابة للنقاط المختلفة...")
        for endpoint in endpoints_to_test:
            try:
                result = await self.measure_response_time(endpoint, iterations=100)
                results[f"endpoint_{endpoint.replace('/', '_').replace(':', '')}"] = result
                
                # التحقق من المتطلب (< 200ms)
                meets_requirement = result.get("under_200ms_percentage", 0) >= 90
                logger.info(f"✅ {endpoint}: {result.get('avg_time', 0):.2f}ms متوسط، "
                          f"{result.get('under_200ms_percentage', 0):.1f}% < 200ms "
                          f"{'✅ يلبي المتطلب' if meets_requirement else '❌ لا يلبي المتطلب'}")
                
            except Exception as e:
                logger.error(f"❌ خطأ في اختبار {endpoint}: {e}")
                results[f"endpoint_{endpoint.replace('/', '_').replace(':', '')}"] = {"error": str(e)}
        
        # اختبار الحمولة
        logger.info("🔥 اختبار الحمولة...")
        try:
            load_result = await self.load_test("/api/v1/recommendations/trending", 
                                             concurrent_users=25, duration_seconds=30)
            results["load_test"] = load_result
            
            rps = load_result.get("requests_per_second", 0)
            success_rate = load_result.get("success_rate", 0)
            logger.info(f"🔥 اختبار الحمولة: {rps:.1f} طلب/ثانية، {success_rate:.1f}% نجاح")
            
        except Exception as e:
            logger.error(f"❌ خطأ في اختبار الحمولة: {e}")
            results["load_test"] = {"error": str(e)}
        
        # اختبار التخزين المؤقت
        logger.info("💾 اختبار التخزين المؤقت...")
        try:
            cache_result = await self.cache_performance_test()
            results["cache_test"] = cache_result
            
            improvement = cache_result.get("cache_improvement", 0)
            logger.info(f"💾 تحسن التخزين المؤقت: {improvement:.1f}%")
            
        except Exception as e:
            logger.error(f"❌ خطأ في اختبار التخزين المؤقت: {e}")
            results["cache_test"] = {"error": str(e)}
        
        # تقييم شامل
        results["evaluation"] = self.evaluate_performance(results)
        
        logger.info("✅ انتهى الاختبار الشامل")
        return results
    
    def evaluate_performance(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """تقييم الأداء الشامل"""
        evaluation = {
            "overall_score": 0,
            "requirements_met": {},
            "recommendations": []
        }
        
        # تقييم زمن الاستجابة (< 200ms)
        response_time_scores = []
        for key, value in results.items():
            if key.startswith("endpoint_") and isinstance(value, dict):
                under_200ms = value.get("under_200ms_percentage", 0)
                avg_time = value.get("avg_time", 1000)
                
                if under_200ms >= 90:
                    response_time_scores.append(100)
                elif under_200ms >= 75:
                    response_time_scores.append(75)
                elif under_200ms >= 50:
                    response_time_scores.append(50)
                else:
                    response_time_scores.append(25)
                
                evaluation["requirements_met"][f"{key}_under_200ms"] = under_200ms >= 90
        
        # تقييم معدل النجاح
        success_rate_score = 100
        for key, value in results.items():
            if key.startswith("endpoint_") and isinstance(value, dict):
                success_rate = value.get("success_rate", 0)
                if success_rate < 95:
                    success_rate_score = min(success_rate_score, success_rate)
        
        # تقييم اختبار الحمولة
        load_test_score = 100
        if "load_test" in results and isinstance(results["load_test"], dict):
            load_result = results["load_test"]
            rps = load_result.get("requests_per_second", 0)
            success_rate = load_result.get("success_rate", 0)
            
            # المتطلب: > 1000 طلب/ثانية مع معدل نجاح > 95%
            if rps >= 1000 and success_rate >= 95:
                load_test_score = 100
            elif rps >= 500 and success_rate >= 90:
                load_test_score = 75
            elif rps >= 250 and success_rate >= 85:
                load_test_score = 50
            else:
                load_test_score = 25
            
            evaluation["requirements_met"]["load_test"] = rps >= 1000 and success_rate >= 95
        
        # حساب النتيجة الإجمالية
        response_time_avg = statistics.mean(response_time_scores) if response_time_scores else 0
        evaluation["overall_score"] = (response_time_avg * 0.5 + success_rate_score * 0.3 + load_test_score * 0.2)
        
        # التوصيات
        if response_time_avg < 75:
            evaluation["recommendations"].append("تحسين خوارزميات التوصيات لتقليل زمن المعالجة")
        
        if success_rate_score < 95:
            evaluation["recommendations"].append("مراجعة استقرار النظام وإصلاح الأخطاء")
        
        if load_test_score < 75:
            evaluation["recommendations"].append("تحسين قابلية التوسع وإضافة موارد إضافية")
        
        # تقييم التخزين المؤقت
        if "cache_test" in results and isinstance(results["cache_test"], dict):
            cache_improvement = results["cache_test"].get("cache_improvement", 0)
            if cache_improvement < 50:
                evaluation["recommendations"].append("تحسين استراتيجية التخزين المؤقت")
        
        return evaluation

# دوال اختبار pytest
@pytest.mark.asyncio
async def test_response_time_under_200ms():
    """اختبار أن زمن الاستجابة أقل من 200ms"""
    async with PerformanceTest() as tester:
        result = await tester.measure_response_time("/api/v1/recommendations/trending")
        assert result["under_200ms_percentage"] >= 90, f"فقط {result['under_200ms_percentage']:.1f}% من الطلبات كانت أقل من 200ms"

@pytest.mark.asyncio
async def test_system_health():
    """اختبار صحة النظام"""
    async with PerformanceTest() as tester:
        is_healthy = await tester.health_check()
        assert is_healthy, "النظام غير صحي"

@pytest.mark.asyncio
async def test_load_handling():
    """اختبار تحمل الحمولة"""
    async with PerformanceTest() as tester:
        result = await tester.load_test("/health", concurrent_users=10, duration_seconds=10)
        assert result["success_rate"] >= 95, f"معدل النجاح منخفض: {result['success_rate']:.1f}%"

# دالة تشغيل الاختبار من سطر الأوامر
async def main():
    """تشغيل الاختبار الشامل"""
    async with PerformanceTest() as tester:
        results = await tester.run_comprehensive_test()
        
        # حفظ النتائج
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"performance_test_results_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n📊 تم حفظ نتائج الاختبار في: {filename}")
        
        # طباعة ملخص
        evaluation = results.get("evaluation", {})
        overall_score = evaluation.get("overall_score", 0)
        
        print(f"\n🎯 النتيجة الإجمالية: {overall_score:.1f}/100")
        
        if overall_score >= 90:
            print("🏆 أداء ممتاز!")
        elif overall_score >= 75:
            print("✅ أداء جيد")
        elif overall_score >= 60:
            print("⚠️ أداء مقبول - يحتاج تحسين")
        else:
            print("❌ أداء ضعيف - يحتاج تحسين عاجل")
        
        # طباعة التوصيات
        recommendations = evaluation.get("recommendations", [])
        if recommendations:
            print("\n💡 التوصيات:")
            for i, rec in enumerate(recommendations, 1):
                print(f"  {i}. {rec}")

if __name__ == "__main__":
    asyncio.run(main())
