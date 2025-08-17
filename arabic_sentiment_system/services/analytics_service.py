# خدمة التحليلات لنظام تحليل المشاعر
# Analytics Service for Sentiment Analysis System

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import numpy as np
import pandas as pd
import redis.asyncio as redis
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder

logger = logging.getLogger(__name__)

@dataclass
class AnalyticsMetrics:
    """مقاييس التحليلات"""
    total_analyses: int = 0
    sentiment_distribution: Dict[str, int] = None
    emotion_distribution: Dict[str, int] = None
    average_confidence: float = 0.0
    processing_time_avg: float = 0.0
    dialect_distribution: Dict[str, int] = None
    hourly_distribution: Dict[int, int] = None
    daily_trends: Dict[str, float] = None
    
    def __post_init__(self):
        if self.sentiment_distribution is None:
            self.sentiment_distribution = {}
        if self.emotion_distribution is None:
            self.emotion_distribution = {}
        if self.dialect_distribution is None:
            self.dialect_distribution = {}
        if self.hourly_distribution is None:
            self.hourly_distribution = {}
        if self.daily_trends is None:
            self.daily_trends = {}

class SentimentAnalyticsService:
    """خدمة تحليلات المشاعر المتقدمة"""
    
    def __init__(self, redis_client: redis.Redis = None, db_session: AsyncSession = None):
        self.redis_client = redis_client
        self.db_session = db_session
        
        # مفاتيح Redis للإحصائيات
        self.keys = {
            'total_analyses': 'analytics:total_analyses',
            'sentiment_counts': 'analytics:sentiment_counts',
            'emotion_counts': 'analytics:emotion_counts',
            'confidence_sum': 'analytics:confidence_sum',
            'processing_time_sum': 'analytics:processing_time_sum',
            'dialect_counts': 'analytics:dialect_counts',
            'hourly_counts': 'analytics:hourly_counts',
            'daily_sentiment': 'analytics:daily_sentiment',
            'weekly_trends': 'analytics:weekly_trends',
            'monthly_stats': 'analytics:monthly_stats'
        }
        
        # إعدادات التحليل
        self.confidence_threshold = 0.7
        self.trend_window_days = 7
        self.peak_hours_threshold = 0.8
        
    async def record_analysis(self, analysis_result: Dict[str, Any]) -> bool:
        """تسجيل نتيجة تحليل في الإحصائيات"""
        try:
            if not self.redis_client:
                return False
            
            # استخراج البيانات من نتيجة التحليل
            sentiment_data = analysis_result.get('sentiment_analysis', {})
            emotion_data = analysis_result.get('emotion_analysis', {})
            metadata = analysis_result.get('summary', {})
            
            # الحصول على الوقت الحالي
            now = datetime.now()
            hour = now.hour
            date_str = now.strftime('%Y-%m-%d')
            
            # استخدام pipeline لتحسين الأداء
            pipe = self.redis_client.pipeline()
            
            # تحديث العدادات الأساسية
            pipe.incr(self.keys['total_analyses'])
            
            # تحديث توزيع المشاعر
            sentiment = sentiment_data.get('predicted_sentiment', 'neutral')
            pipe.hincrby(self.keys['sentiment_counts'], sentiment, 1)
            
            # تحديث توزيع العواطف
            if emotion_data and 'emotions' in emotion_data:
                for emotion, data in emotion_data['emotions'].items():
                    if data.get('present', False):
                        pipe.hincrby(self.keys['emotion_counts'], emotion, 1)
            
            # تحديث مجموع الثقة
            confidence = sentiment_data.get('confidence', 0.0)
            if confidence > 0:
                pipe.incrbyfloat(self.keys['confidence_sum'], confidence)
            
            # تحديث زمن المعالجة
            processing_time = metadata.get('processing_time', 0.0)
            if processing_time > 0:
                pipe.incrbyfloat(self.keys['processing_time_sum'], processing_time)
            
            # تحديث توزيع اللهجات
            dialect_info = sentiment_data.get('dialect_info', {})
            if dialect_info:
                dialect = dialect_info.get('predicted_dialect', 'unknown')
                pipe.hincrby(self.keys['dialect_counts'], dialect, 1)
            
            # تحديث التوزيع الساعي
            pipe.hincrby(self.keys['hourly_counts'], str(hour), 1)
            
            # تحديث الاتجاهات اليومية
            daily_key = f"{self.keys['daily_sentiment']}:{date_str}"
            pipe.hincrby(daily_key, sentiment, 1)
            pipe.expire(daily_key, 86400 * 30)  # انتهاء صلاحية بعد 30 يوم
            
            # تنفيذ العمليات
            await pipe.execute()
            
            # تسجيل أحداث خاصة
            await self._record_special_events(analysis_result, now)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في تسجيل التحليل: {str(e)}")
            return False
    
    async def _record_special_events(self, analysis_result: Dict[str, Any], timestamp: datetime):
        """تسجيل الأحداث الخاصة والتنبيهات"""
        try:
            sentiment_data = analysis_result.get('sentiment_analysis', {})
            emotion_data = analysis_result.get('emotion_analysis', {})
            advanced_data = analysis_result.get('advanced_analysis', {})
            
            # كشف المشاعر القوية
            confidence = sentiment_data.get('confidence', 0.0)
            if confidence > 0.9:
                await self._record_high_confidence_event(analysis_result, timestamp)
            
            # كشف العواطف المختلطة
            if emotion_data and 'emotional_intensity' in emotion_data:
                intensity = emotion_data['emotional_intensity']
                if intensity > 0.8:
                    await self._record_high_emotion_event(analysis_result, timestamp)
            
            # كشف التناقضات
            if advanced_data and 'emotional_coherence' in advanced_data:
                coherence = advanced_data['emotional_coherence']
                if coherence > 0.5:  # تناقض عالي
                    await self._record_contradiction_event(analysis_result, timestamp)
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تسجيل الأحداث الخاصة: {str(e)}")
    
    async def _record_high_confidence_event(self, analysis_result: Dict[str, Any], timestamp: datetime):
        """تسجيل حدث ثقة عالية"""
        event_key = f"events:high_confidence:{timestamp.strftime('%Y-%m-%d')}"
        event_data = {
            'timestamp': timestamp.isoformat(),
            'sentiment': analysis_result['sentiment_analysis']['predicted_sentiment'],
            'confidence': analysis_result['sentiment_analysis']['confidence'],
            'text_preview': analysis_result.get('text', '')[:100]
        }
        
        await self.redis_client.lpush(event_key, json.dumps(event_data))
        await self.redis_client.expire(event_key, 86400 * 7)  # احتفاظ لمدة أسبوع
    
    async def _record_high_emotion_event(self, analysis_result: Dict[str, Any], timestamp: datetime):
        """تسجيل حدث عاطفة قوية"""
        event_key = f"events:high_emotion:{timestamp.strftime('%Y-%m-%d')}"
        event_data = {
            'timestamp': timestamp.isoformat(),
            'dominant_emotion': analysis_result['emotion_analysis']['dominant_emotion'],
            'intensity': analysis_result['emotion_analysis']['emotional_intensity'],
            'text_preview': analysis_result.get('text', '')[:100]
        }
        
        await self.redis_client.lpush(event_key, json.dumps(event_data))
        await self.redis_client.expire(event_key, 86400 * 7)
    
    async def _record_contradiction_event(self, analysis_result: Dict[str, Any], timestamp: datetime):
        """تسجيل حدث تناقض عاطفي"""
        event_key = f"events:contradiction:{timestamp.strftime('%Y-%m-%d')}"
        event_data = {
            'timestamp': timestamp.isoformat(),
            'sentiment': analysis_result['sentiment_analysis']['predicted_sentiment'],
            'dominant_emotion': analysis_result['emotion_analysis']['dominant_emotion'],
            'coherence_score': analysis_result['advanced_analysis']['emotional_coherence'],
            'text_preview': analysis_result.get('text', '')[:100]
        }
        
        await self.redis_client.lpush(event_key, json.dumps(event_data))
        await self.redis_client.expire(event_key, 86400 * 7)
    
    async def get_analytics_summary(self, time_range: str = "24h") -> AnalyticsMetrics:
        """الحصول على ملخص التحليلات"""
        try:
            if not self.redis_client:
                return AnalyticsMetrics()
            
            # الحصول على البيانات الأساسية
            total_analyses = await self.redis_client.get(self.keys['total_analyses']) or 0
            total_analyses = int(total_analyses)
            
            if total_analyses == 0:
                return AnalyticsMetrics()
            
            # الحصول على توزيع المشاعر
            sentiment_dist = await self.redis_client.hgetall(self.keys['sentiment_counts'])
            sentiment_distribution = {k: int(v) for k, v in sentiment_dist.items()}
            
            # الحصول على توزيع العواطف
            emotion_dist = await self.redis_client.hgetall(self.keys['emotion_counts'])
            emotion_distribution = {k: int(v) for k, v in emotion_dist.items()}
            
            # حساب متوسط الثقة
            confidence_sum = await self.redis_client.get(self.keys['confidence_sum']) or 0
            average_confidence = float(confidence_sum) / total_analyses if total_analyses > 0 else 0.0
            
            # حساب متوسط زمن المعالجة
            processing_time_sum = await self.redis_client.get(self.keys['processing_time_sum']) or 0
            processing_time_avg = float(processing_time_sum) / total_analyses if total_analyses > 0 else 0.0
            
            # الحصول على توزيع اللهجات
            dialect_dist = await self.redis_client.hgetall(self.keys['dialect_counts'])
            dialect_distribution = {k: int(v) for k, v in dialect_dist.items()}
            
            # الحصول على التوزيع الساعي
            hourly_dist = await self.redis_client.hgetall(self.keys['hourly_counts'])
            hourly_distribution = {int(k): int(v) for k, v in hourly_dist.items()}
            
            # حساب الاتجاهات اليومية
            daily_trends = await self._calculate_daily_trends(time_range)
            
            return AnalyticsMetrics(
                total_analyses=total_analyses,
                sentiment_distribution=sentiment_distribution,
                emotion_distribution=emotion_distribution,
                average_confidence=average_confidence,
                processing_time_avg=processing_time_avg,
                dialect_distribution=dialect_distribution,
                hourly_distribution=hourly_distribution,
                daily_trends=daily_trends
            )
            
        except Exception as e:
            logger.error(f"❌ فشل في الحصول على ملخص التحليلات: {str(e)}")
            return AnalyticsMetrics()
    
    async def _calculate_daily_trends(self, time_range: str) -> Dict[str, float]:
        """حساب الاتجاهات اليومية"""
        try:
            # تحديد النطاق الزمني
            days = 1
            if time_range == "7d":
                days = 7
            elif time_range == "30d":
                days = 30
            
            trends = {}
            now = datetime.now()
            
            for i in range(days):
                date = now - timedelta(days=i)
                date_str = date.strftime('%Y-%m-%d')
                daily_key = f"{self.keys['daily_sentiment']}:{date_str}"
                
                daily_data = await self.redis_client.hgetall(daily_key)
                if daily_data:
                    total_day = sum(int(v) for v in daily_data.values())
                    positive = int(daily_data.get('positive', 0))
                    negative = int(daily_data.get('negative', 0))
                    
                    if total_day > 0:
                        sentiment_score = (positive - negative) / total_day
                        trends[date_str] = sentiment_score
                    else:
                        trends[date_str] = 0.0
                else:
                    trends[date_str] = 0.0
            
            return trends
            
        except Exception as e:
            logger.error(f"❌ فشل في حساب الاتجاهات اليومية: {str(e)}")
            return {}
    
    async def generate_sentiment_report(self, time_range: str = "7d") -> Dict[str, Any]:
        """إنشاء تقرير شامل للمشاعر"""
        try:
            metrics = await self.get_analytics_summary(time_range)
            
            # تحليل الأنماط
            patterns = await self._analyze_patterns(metrics)
            
            # إنشاء التصورات
            visualizations = await self._generate_visualizations(metrics)
            
            # إنشاء التوصيات
            recommendations = await self._generate_recommendations(metrics, patterns)
            
            # الأحداث البارزة
            notable_events = await self._get_notable_events(time_range)
            
            report = {
                'summary': asdict(metrics),
                'patterns': patterns,
                'visualizations': visualizations,
                'recommendations': recommendations,
                'notable_events': notable_events,
                'report_metadata': {
                    'generated_at': datetime.now().isoformat(),
                    'time_range': time_range,
                    'total_analyses': metrics.total_analyses,
                    'report_version': '1.0'
                }
            }
            
            return report
            
        except Exception as e:
            logger.error(f"❌ فشل في إنشاء تقرير المشاعر: {str(e)}")
            return {}
    
    async def _analyze_patterns(self, metrics: AnalyticsMetrics) -> Dict[str, Any]:
        """تحليل الأنماط في البيانات"""
        patterns = {}
        
        # تحليل توزيع المشاعر
        if metrics.sentiment_distribution:
            total = sum(metrics.sentiment_distribution.values())
            if total > 0:
                patterns['sentiment_dominance'] = max(
                    metrics.sentiment_distribution.items(),
                    key=lambda x: x[1]
                )[0]
                
                patterns['sentiment_balance'] = {
                    'positive_ratio': metrics.sentiment_distribution.get('positive', 0) / total,
                    'negative_ratio': metrics.sentiment_distribution.get('negative', 0) / total,
                    'neutral_ratio': metrics.sentiment_distribution.get('neutral', 0) / total
                }
        
        # تحليل التوزيع الساعي
        if metrics.hourly_distribution:
            peak_hour = max(metrics.hourly_distribution.items(), key=lambda x: x[1])
            patterns['peak_activity_hour'] = peak_hour[0]
            patterns['peak_activity_count'] = peak_hour[1]
            
            # تحديد فترات النشاط
            total_hourly = sum(metrics.hourly_distribution.values())
            avg_hourly = total_hourly / 24 if total_hourly > 0 else 0
            
            patterns['active_hours'] = [
                hour for hour, count in metrics.hourly_distribution.items()
                if count > avg_hourly * 1.2
            ]
        
        # تحليل اللهجات
        if metrics.dialect_distribution:
            total_dialect = sum(metrics.dialect_distribution.values())
            patterns['dominant_dialect'] = max(
                metrics.dialect_distribution.items(),
                key=lambda x: x[1]
            )[0]
            
            patterns['dialect_diversity'] = len(metrics.dialect_distribution) / 6  # 6 لهجات رئيسية
        
        # تحليل الاتجاهات
        if metrics.daily_trends:
            trend_values = list(metrics.daily_trends.values())
            if len(trend_values) > 1:
                patterns['trend_direction'] = 'increasing' if trend_values[-1] > trend_values[0] else 'decreasing'
                patterns['trend_volatility'] = np.std(trend_values) if len(trend_values) > 1 else 0
                patterns['sentiment_stability'] = 1 - patterns['trend_volatility']
        
        return patterns
    
    async def _generate_visualizations(self, metrics: AnalyticsMetrics) -> Dict[str, str]:
        """إنشاء التصورات البيانية"""
        visualizations = {}
        
        try:
            # رسم توزيع المشاعر
            if metrics.sentiment_distribution:
                fig_sentiment = px.pie(
                    values=list(metrics.sentiment_distribution.values()),
                    names=list(metrics.sentiment_distribution.keys()),
                    title="توزيع المشاعر"
                )
                visualizations['sentiment_pie'] = json.dumps(fig_sentiment, cls=PlotlyJSONEncoder)
            
            # رسم التوزيع الساعي
            if metrics.hourly_distribution:
                hours = list(range(24))
                counts = [metrics.hourly_distribution.get(h, 0) for h in hours]
                
                fig_hourly = px.bar(
                    x=hours,
                    y=counts,
                    title="النشاط حسب الساعة",
                    labels={'x': 'الساعة', 'y': 'عدد التحليلات'}
                )
                visualizations['hourly_bar'] = json.dumps(fig_hourly, cls=PlotlyJSONEncoder)
            
            # رسم الاتجاهات اليومية
            if metrics.daily_trends:
                dates = list(metrics.daily_trends.keys())
                values = list(metrics.daily_trends.values())
                
                fig_trends = px.line(
                    x=dates,
                    y=values,
                    title="اتجاهات المشاعر اليومية",
                    labels={'x': 'التاريخ', 'y': 'نقاط المشاعر'}
                )
                visualizations['daily_trends'] = json.dumps(fig_trends, cls=PlotlyJSONEncoder)
            
            # رسم توزيع العواطف
            if metrics.emotion_distribution:
                emotions = list(metrics.emotion_distribution.keys())
                emotion_counts = list(metrics.emotion_distribution.values())
                
                fig_emotions = px.bar(
                    x=emotions,
                    y=emotion_counts,
                    title="توزيع العواطف",
                    labels={'x': 'العاطفة', 'y': 'التكرار'}
                )
                visualizations['emotions_bar'] = json.dumps(fig_emotions, cls=PlotlyJSONEncoder)
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في إنشاء بعض التصورات: {str(e)}")
        
        return visualizations
    
    async def _generate_recommendations(self, metrics: AnalyticsMetrics, patterns: Dict[str, Any]) -> List[Dict[str, str]]:
        """إنشاء التوصيات بناءً على التحليل"""
        recommendations = []
        
        # توصيات بناءً على توزيع المشاعر
        if 'sentiment_balance' in patterns:
            balance = patterns['sentiment_balance']
            if balance['negative_ratio'] > 0.4:
                recommendations.append({
                    'type': 'content_strategy',
                    'priority': 'high',
                    'title': 'نسبة عالية من المشاعر السلبية',
                    'description': 'يُنصح بمراجعة استراتيجية المحتوى لتحسين المشاعر العامة',
                    'action': 'تطوير محتوى أكثر إيجابية ومفيد للجمهور'
                })
            
            if balance['neutral_ratio'] > 0.6:
                recommendations.append({
                    'type': 'engagement',
                    'priority': 'medium',
                    'title': 'نسبة عالية من المشاعر المحايدة',
                    'description': 'المحتوى قد لا يثير تفاعلاً قوياً من الجمهور',
                    'action': 'إضافة عناصر أكثر إثارة وتفاعلية للمحتوى'
                })
        
        # توصيات بناءً على التوزيع الساعي
        if 'peak_activity_hour' in patterns:
            peak_hour = patterns['peak_activity_hour']
            recommendations.append({
                'type': 'timing',
                'priority': 'medium',
                'title': f'ذروة النشاط في الساعة {peak_hour}',
                'description': 'يمكن استغلال هذا التوقيت لنشر المحتوى المهم',
                'action': f'جدولة المحتوى الأساسي حول الساعة {peak_hour}'
            })
        
        # توصيات بناءً على اللهجات
        if 'dominant_dialect' in patterns:
            dialect = patterns['dominant_dialect']
            if dialect != 'msa':
                recommendations.append({
                    'type': 'localization',
                    'priority': 'low',
                    'title': f'هيمنة اللهجة {dialect}',
                    'description': 'الجمهور يفضل المحتوى بهذه اللهجة',
                    'action': f'تخصيص المزيد من المحتوى باللهجة {dialect}'
                })
        
        # توصيات بناءً على الثقة
        if metrics.average_confidence < 0.7:
            recommendations.append({
                'type': 'quality',
                'priority': 'high',
                'title': 'انخفاض متوسط الثقة في التحليل',
                'description': 'قد تحتاج النصوص إلى تحسين في الوضوح',
                'action': 'مراجعة جودة النصوص وتحسين وضوح المحتوى'
            })
        
        return recommendations
    
    async def _get_notable_events(self, time_range: str) -> List[Dict[str, Any]]:
        """الحصول على الأحداث البارزة"""
        notable_events = []
        
        try:
            # تحديد النطاق الزمني
            days = 1
            if time_range == "7d":
                days = 7
            elif time_range == "30d":
                days = 30
            
            # جمع الأحداث من الأيام الماضية
            for i in range(days):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                
                # أحداث الثقة العالية
                high_conf_events = await self.redis_client.lrange(
                    f"events:high_confidence:{date}", 0, 5
                )
                for event_str in high_conf_events:
                    event = json.loads(event_str)
                    event['type'] = 'high_confidence'
                    notable_events.append(event)
                
                # أحداث العاطفة القوية
                high_emotion_events = await self.redis_client.lrange(
                    f"events:high_emotion:{date}", 0, 5
                )
                for event_str in high_emotion_events:
                    event = json.loads(event_str)
                    event['type'] = 'high_emotion'
                    notable_events.append(event)
                
                # أحداث التناقض
                contradiction_events = await self.redis_client.lrange(
                    f"events:contradiction:{date}", 0, 3
                )
                for event_str in contradiction_events:
                    event = json.loads(event_str)
                    event['type'] = 'contradiction'
                    notable_events.append(event)
            
            # ترتيب الأحداث حسب الوقت
            notable_events.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return notable_events[:20]  # أحدث 20 حدث
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في جمع الأحداث البارزة: {str(e)}")
            return []
    
    async def get_real_time_metrics(self) -> Dict[str, Any]:
        """الحصول على المقاييس في الوقت الفعلي"""
        try:
            now = datetime.now()
            current_hour = now.hour
            today = now.strftime('%Y-%m-%d')
            
            # إحصائيات الساعة الحالية
            current_hour_count = await self.redis_client.hget(
                self.keys['hourly_counts'], str(current_hour)
            ) or 0
            
            # إحصائيات اليوم الحالي
            today_key = f"{self.keys['daily_sentiment']}:{today}"
            today_stats = await self.redis_client.hgetall(today_key)
            
            # معدل المعالجة (تحليلات في الدقيقة)
            minute_key = f"analytics:minute:{now.strftime('%Y-%m-%d:%H:%M')}"
            current_minute_count = await self.redis_client.get(minute_key) or 0
            
            return {
                'current_hour_analyses': int(current_hour_count),
                'current_minute_analyses': int(current_minute_count),
                'today_sentiment_breakdown': {k: int(v) for k, v in today_stats.items()},
                'processing_rate_per_minute': int(current_minute_count),
                'timestamp': now.isoformat(),
                'is_peak_hour': int(current_hour_count) > 50  # عتبة الذروة
            }
            
        except Exception as e:
            logger.error(f"❌ فشل في الحصول على المقاييس الفورية: {str(e)}")
            return {}
    
    async def cleanup_old_data(self, retention_days: int = 90):
        """تنظيف البيانات القديمة"""
        try:
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            
            # تنظيف الإحصائيات اليومية
            for i in range(retention_days, retention_days + 30):  # تنظيف 30 يوم إضافي
                old_date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                old_keys = [
                    f"{self.keys['daily_sentiment']}:{old_date}",
                    f"events:high_confidence:{old_date}",
                    f"events:high_emotion:{old_date}",
                    f"events:contradiction:{old_date}"
                ]
                
                for key in old_keys:
                    await self.redis_client.delete(key)
            
            logger.info(f"✅ تم تنظيف البيانات الأقدم من {retention_days} يوم")
            
        except Exception as e:
            logger.error(f"❌ فشل في تنظيف البيانات القديمة: {str(e)}")
    
    async def export_analytics_data(self, time_range: str = "30d", format: str = "json") -> Dict[str, Any]:
        """تصدير بيانات التحليلات"""
        try:
            metrics = await self.get_analytics_summary(time_range)
            report = await self.generate_sentiment_report(time_range)
            
            export_data = {
                'export_metadata': {
                    'generated_at': datetime.now().isoformat(),
                    'time_range': time_range,
                    'format': format,
                    'version': '1.0'
                },
                'metrics': asdict(metrics),
                'detailed_report': report
            }
            
            if format == "csv":
                # تحويل إلى DataFrame للتصدير كـ CSV
                df = pd.DataFrame([asdict(metrics)])
                export_data['csv_data'] = df.to_csv(index=False)
            
            return export_data
            
        except Exception as e:
            logger.error(f"❌ فشل في تصدير البيانات: {str(e)}")
            return {}

# مثال على الاستخدام
if __name__ == "__main__":
    import asyncio
    
    async def test_analytics():
        # إنشاء خدمة التحليلات
        analytics = SentimentAnalyticsService()
        
        # مثال على تسجيل تحليل
        sample_analysis = {
            'text': 'مثال على نص للتحليل',
            'sentiment_analysis': {
                'predicted_sentiment': 'positive',
                'confidence': 0.85,
                'probabilities': {'positive': 0.85, 'negative': 0.10, 'neutral': 0.05}
            },
            'emotion_analysis': {
                'emotions': {
                    'joy': {'probability': 0.8, 'present': True},
                    'sadness': {'probability': 0.1, 'present': False}
                },
                'dominant_emotion': {'emotion': 'joy', 'probability': 0.8},
                'emotional_intensity': 0.7
            },
            'advanced_analysis': {
                'emotional_coherence': 0.2,
                'analysis_confidence': 0.85
            },
            'summary': {
                'processing_time': 150.5
            }
        }
        
        # تسجيل التحليل
        success = await analytics.record_analysis(sample_analysis)
        print(f"تسجيل التحليل: {'نجح' if success else 'فشل'}")
        
        # الحصول على ملخص التحليلات
        metrics = await analytics.get_analytics_summary("24h")
        print(f"إجمالي التحليلات: {metrics.total_analyses}")
        print(f"توزيع المشاعر: {metrics.sentiment_distribution}")
        
        # إنشاء تقرير شامل
        report = await analytics.generate_sentiment_report("7d")
        print(f"تم إنشاء تقرير بـ {len(report)} أقسام")
    
    # تشغيل الاختبار
    asyncio.run(test_analytics())
