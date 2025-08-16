# خدمة تحليل الاتجاهات العاطفية
# Emotional Trends Analysis Service

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import numpy as np
import pandas as pd
from scipy import stats
from scipy.signal import find_peaks
import redis.asyncio as redis
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder

logger = logging.getLogger(__name__)

@dataclass
class TrendPoint:
    """نقطة في الاتجاه"""
    timestamp: datetime
    sentiment_score: float
    emotion_scores: Dict[str, float]
    volume: int
    confidence: float
    category: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'timestamp': self.timestamp.isoformat(),
            'sentiment_score': self.sentiment_score,
            'emotion_scores': self.emotion_scores,
            'volume': self.volume,
            'confidence': self.confidence,
            'category': self.category
        }

@dataclass
class TrendAnalysis:
    """تحليل الاتجاه"""
    trend_direction: str  # 'increasing', 'decreasing', 'stable', 'volatile'
    trend_strength: float  # 0-1
    trend_duration: timedelta
    peak_points: List[TrendPoint]
    valley_points: List[TrendPoint]
    anomalies: List[TrendPoint]
    correlation_factors: Dict[str, float]
    predictions: Dict[str, Any]
    confidence_interval: Tuple[float, float]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'trend_direction': self.trend_direction,
            'trend_strength': self.trend_strength,
            'trend_duration': str(self.trend_duration),
            'peak_points': [p.to_dict() for p in self.peak_points],
            'valley_points': [v.to_dict() for v in self.valley_points],
            'anomalies': [a.to_dict() for a in self.anomalies],
            'correlation_factors': self.correlation_factors,
            'predictions': self.predictions,
            'confidence_interval': self.confidence_interval
        }

class TrendAnalysisService:
    """خدمة تحليل الاتجاهات العاطفية المتقدمة"""
    
    def __init__(self, redis_client: redis.Redis = None):
        self.redis_client = redis_client
        
        # إعدادات التحليل
        self.min_data_points = 10
        self.smoothing_window = 5
        self.anomaly_threshold = 2.0  # عدد الانحرافات المعيارية
        self.trend_strength_threshold = 0.3
        self.peak_prominence = 0.1
        
        # أنواع العواطف المتتبعة
        self.emotions = [
            'joy', 'sadness', 'anger', 'fear', 
            'surprise', 'disgust', 'trust', 'anticipation'
        ]
        
        # فئات المحتوى
        self.content_categories = [
            'news', 'sports', 'politics', 'technology', 
            'entertainment', 'health', 'education', 'business'
        ]
        
        # مفاتيح Redis
        self.keys = {
            'trend_data': 'trends:data',
            'trend_cache': 'trends:cache',
            'anomalies': 'trends:anomalies',
            'predictions': 'trends:predictions',
            'correlations': 'trends:correlations'
        }
    
    async def record_trend_point(self, analysis_result: Dict[str, Any], 
                                category: Optional[str] = None) -> bool:
        """تسجيل نقطة اتجاه جديدة"""
        try:
            if not self.redis_client:
                return False
            
            # استخراج البيانات من التحليل
            sentiment_data = analysis_result.get('sentiment_analysis', {})
            emotion_data = analysis_result.get('emotion_analysis', {})
            
            # حساب نقاط المشاعر
            sentiment_score = self._calculate_sentiment_score(sentiment_data)
            emotion_scores = self._extract_emotion_scores(emotion_data)
            
            # إنشاء نقطة الاتجاه
            trend_point = TrendPoint(
                timestamp=datetime.now(),
                sentiment_score=sentiment_score,
                emotion_scores=emotion_scores,
                volume=1,  # يمكن تحسينه ليمثل حجم التفاعل الحقيقي
                confidence=sentiment_data.get('confidence', 0.0),
                category=category
            )
            
            # تخزين النقطة
            await self._store_trend_point(trend_point)
            
            # تحديث التحليلات في الوقت الفعلي
            await self._update_real_time_analysis(trend_point)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في تسجيل نقطة الاتجاه: {str(e)}")
            return False
    
    def _calculate_sentiment_score(self, sentiment_data: Dict[str, Any]) -> float:
        """حساب نقاط المشاعر"""
        probs = sentiment_data.get('probabilities', {})
        positive = probs.get('positive', 0.0)
        negative = probs.get('negative', 0.0)
        neutral = probs.get('neutral', 0.0)
        
        # تحويل إلى نقاط من -1 إلى +1
        return positive - negative
    
    def _extract_emotion_scores(self, emotion_data: Dict[str, Any]) -> Dict[str, float]:
        """استخراج نقاط العواطف"""
        emotions = emotion_data.get('emotions', {})
        return {
            emotion: data.get('probability', 0.0)
            for emotion, data in emotions.items()
            if emotion in self.emotions
        }
    
    async def _store_trend_point(self, trend_point: TrendPoint):
        """تخزين نقطة الاتجاه في Redis"""
        # تخزين في قائمة زمنية مرتبة
        timestamp_key = int(trend_point.timestamp.timestamp())
        
        # تخزين البيانات الأساسية
        await self.redis_client.zadd(
            f"{self.keys['trend_data']}:sentiment",
            {json.dumps(trend_point.to_dict()): timestamp_key}
        )
        
        # تخزين حسب الفئة إذا توفرت
        if trend_point.category:
            await self.redis_client.zadd(
                f"{self.keys['trend_data']}:category:{trend_point.category}",
                {json.dumps(trend_point.to_dict()): timestamp_key}
            )
        
        # تخزين العواطف منفصلة
        for emotion, score in trend_point.emotion_scores.items():
            await self.redis_client.zadd(
                f"{self.keys['trend_data']}:emotion:{emotion}",
                {score: timestamp_key}
            )
        
        # حذف البيانات القديمة (أكثر من 90 يوم)
        cutoff = int((datetime.now() - timedelta(days=90)).timestamp())
        await self.redis_client.zremrangebyscore(
            f"{self.keys['trend_data']}:sentiment", 0, cutoff
        )
    
    async def _update_real_time_analysis(self, trend_point: TrendPoint):
        """تحديث التحليل في الوقت الفعلي"""
        # كشف الشذوذ
        if await self._is_anomaly(trend_point):
            await self._record_anomaly(trend_point)
        
        # تحديث التنبؤات
        await self._update_predictions(trend_point)
    
    async def _is_anomaly(self, trend_point: TrendPoint) -> bool:
        """كشف الشذوذ في النقطة الحالية"""
        try:
            # الحصول على البيانات الأخيرة
            recent_data = await self._get_recent_trend_data(hours=24)
            
            if len(recent_data) < self.min_data_points:
                return False
            
            # حساب الإحصائيات
            sentiment_scores = [p.sentiment_score for p in recent_data]
            mean_sentiment = np.mean(sentiment_scores)
            std_sentiment = np.std(sentiment_scores)
            
            # كشف الشذوذ بناءً على الانحراف المعياري
            if std_sentiment > 0:
                z_score = abs(trend_point.sentiment_score - mean_sentiment) / std_sentiment
                return z_score > self.anomaly_threshold
            
            return False
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في كشف الشذوذ: {str(e)}")
            return False
    
    async def _record_anomaly(self, trend_point: TrendPoint):
        """تسجيل نقطة شاذة"""
        anomaly_data = {
            'timestamp': trend_point.timestamp.isoformat(),
            'sentiment_score': trend_point.sentiment_score,
            'category': trend_point.category,
            'confidence': trend_point.confidence,
            'type': 'sentiment_spike'
        }
        
        await self.redis_client.lpush(
            self.keys['anomalies'],
            json.dumps(anomaly_data)
        )
        
        # الاحتفاظ بأحدث 1000 شذوذ
        await self.redis_client.ltrim(self.keys['anomalies'], 0, 999)
    
    async def _update_predictions(self, trend_point: TrendPoint):
        """تحديث التنبؤات"""
        try:
            # الحصول على البيانات الأخيرة
            recent_data = await self._get_recent_trend_data(hours=72)
            
            if len(recent_data) >= 20:  # الحد الأدنى للتنبؤ
                predictions = await self._generate_predictions(recent_data)
                
                await self.redis_client.setex(
                    self.keys['predictions'],
                    3600,  # صالح لساعة واحدة
                    json.dumps(predictions, default=str)
                )
        
        except Exception as e:
            logger.warning(f"⚠️ فشل في تحديث التنبؤات: {str(e)}")
    
    async def _get_recent_trend_data(self, hours: int = 24) -> List[TrendPoint]:
        """الحصول على بيانات الاتجاه الأخيرة"""
        try:
            cutoff = int((datetime.now() - timedelta(hours=hours)).timestamp())
            current = int(datetime.now().timestamp())
            
            # جلب البيانات من Redis
            raw_data = await self.redis_client.zrangebyscore(
                f"{self.keys['trend_data']}:sentiment",
                cutoff, current
            )
            
            trend_points = []
            for data_str in raw_data:
                try:
                    data = json.loads(data_str)
                    trend_point = TrendPoint(
                        timestamp=datetime.fromisoformat(data['timestamp']),
                        sentiment_score=data['sentiment_score'],
                        emotion_scores=data['emotion_scores'],
                        volume=data['volume'],
                        confidence=data['confidence'],
                        category=data.get('category')
                    )
                    trend_points.append(trend_point)
                except (json.JSONDecodeError, KeyError) as e:
                    logger.warning(f"⚠️ فشل في تحليل نقطة اتجاه: {str(e)}")
                    continue
            
            # ترتيب حسب الوقت
            trend_points.sort(key=lambda x: x.timestamp)
            return trend_points
            
        except Exception as e:
            logger.error(f"❌ فشل في جلب بيانات الاتجاه: {str(e)}")
            return []
    
    async def analyze_trends(self, category: Optional[str] = None,
                           time_range: str = "24h",
                           include_emotions: bool = True,
                           min_samples: int = 10) -> Dict[str, Any]:
        """تحليل الاتجاهات العاطفية"""
        try:
            # تحويل النطاق الزمني إلى ساعات
            hours = self._parse_time_range(time_range)
            
            # جلب البيانات
            if category:
                trend_data = await self._get_category_trend_data(category, hours)
            else:
                trend_data = await self._get_recent_trend_data(hours)
            
            if len(trend_data) < min_samples:
                return {
                    'error': 'insufficient_data',
                    'message': f'البيانات غير كافية للتحليل. المطلوب: {min_samples}, المتوفر: {len(trend_data)}',
                    'available_data_points': len(trend_data)
                }
            
            # تحليل الاتجاه الرئيسي
            trend_analysis = await self._analyze_sentiment_trend(trend_data)
            
            # تحليل العواطف إذا طُلب ذلك
            emotion_analysis = {}
            if include_emotions:
                emotion_analysis = await self._analyze_emotion_trends(trend_data)
            
            # كشف الأنماط
            patterns = await self._detect_patterns(trend_data)
            
            # التنبؤات
            predictions = await self._generate_predictions(trend_data)
            
            # الأحداث البارزة
            notable_events = await self._identify_notable_events(trend_data)
            
            # التصورات البيانية
            visualizations = await self._generate_trend_visualizations(
                trend_data, emotion_analysis, category
            )
            
            return {
                'success': True,
                'data': {
                    'trend_analysis': trend_analysis.to_dict(),
                    'emotion_analysis': emotion_analysis,
                    'patterns': patterns,
                    'predictions': predictions,
                    'notable_events': notable_events,
                    'visualizations': visualizations,
                    'metadata': {
                        'category': category,
                        'time_range': time_range,
                        'data_points': len(trend_data),
                        'analysis_timestamp': datetime.now().isoformat(),
                        'includes_emotions': include_emotions
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"❌ فشل في تحليل الاتجاهات: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تحليل الاتجاهات'
            }
    
    def _parse_time_range(self, time_range: str) -> int:
        """تحويل النطاق الزمني إلى ساعات"""
        if time_range.endswith('h'):
            return int(time_range[:-1])
        elif time_range.endswith('d'):
            return int(time_range[:-1]) * 24
        else:
            return 24  # افتراضي
    
    async def _get_category_trend_data(self, category: str, hours: int) -> List[TrendPoint]:
        """جلب بيانات اتجاه فئة معينة"""
        try:
            cutoff = int((datetime.now() - timedelta(hours=hours)).timestamp())
            current = int(datetime.now().timestamp())
            
            raw_data = await self.redis_client.zrangebyscore(
                f"{self.keys['trend_data']}:category:{category}",
                cutoff, current
            )
            
            trend_points = []
            for data_str in raw_data:
                try:
                    data = json.loads(data_str)
                    trend_point = TrendPoint(
                        timestamp=datetime.fromisoformat(data['timestamp']),
                        sentiment_score=data['sentiment_score'],
                        emotion_scores=data['emotion_scores'],
                        volume=data['volume'],
                        confidence=data['confidence'],
                        category=data.get('category')
                    )
                    trend_points.append(trend_point)
                except (json.JSONDecodeError, KeyError):
                    continue
            
            trend_points.sort(key=lambda x: x.timestamp)
            return trend_points
            
        except Exception as e:
            logger.error(f"❌ فشل في جلب بيانات فئة {category}: {str(e)}")
            return []
    
    async def _analyze_sentiment_trend(self, trend_data: List[TrendPoint]) -> TrendAnalysis:
        """تحليل اتجاه المشاعر"""
        # استخراج البيانات الزمنية
        timestamps = [p.timestamp for p in trend_data]
        sentiment_scores = [p.sentiment_score for p in trend_data]
        
        # تنعيم البيانات
        if len(sentiment_scores) >= self.smoothing_window:
            smoothed_scores = self._smooth_data(sentiment_scores, self.smoothing_window)
        else:
            smoothed_scores = sentiment_scores
        
        # حساب الاتجاه
        if len(smoothed_scores) > 1:
            slope, intercept, r_value, p_value, std_err = stats.linregress(
                range(len(smoothed_scores)), smoothed_scores
            )
            
            # تحديد اتجاه الترند
            if abs(slope) < 0.001:
                trend_direction = 'stable'
            elif slope > 0:
                trend_direction = 'increasing'
            else:
                trend_direction = 'decreasing'
            
            # قوة الاتجاه
            trend_strength = abs(r_value)
            
            # التقلبات
            volatility = np.std(sentiment_scores)
            if volatility > 0.3:
                trend_direction = 'volatile'
        else:
            trend_direction = 'stable'
            trend_strength = 0.0
            slope = 0.0
        
        # كشف القمم والوديان
        peaks = self._find_peaks(smoothed_scores)
        valleys = self._find_valleys(smoothed_scores)
        
        peak_points = [trend_data[i] for i in peaks]
        valley_points = [trend_data[i] for i in valleys]
        
        # كشف الشذوذ
        anomalies = self._detect_anomalies(trend_data)
        
        # عوامل الارتباط
        correlation_factors = self._calculate_correlations(trend_data)
        
        # فترة الاتجاه
        if len(timestamps) > 1:
            trend_duration = timestamps[-1] - timestamps[0]
        else:
            trend_duration = timedelta(0)
        
        # التنبؤات
        predictions = await self._generate_predictions(trend_data)
        
        # فترة الثقة
        if len(sentiment_scores) > 2:
            confidence_interval = stats.t.interval(
                0.95, len(sentiment_scores)-1,
                loc=np.mean(sentiment_scores),
                scale=stats.sem(sentiment_scores)
            )
        else:
            confidence_interval = (0.0, 0.0)
        
        return TrendAnalysis(
            trend_direction=trend_direction,
            trend_strength=trend_strength,
            trend_duration=trend_duration,
            peak_points=peak_points,
            valley_points=valley_points,
            anomalies=anomalies,
            correlation_factors=correlation_factors,
            predictions=predictions,
            confidence_interval=confidence_interval
        )
    
    def _smooth_data(self, data: List[float], window_size: int) -> List[float]:
        """تنعيم البيانات باستخدام المتوسط المتحرك"""
        if len(data) < window_size:
            return data
        
        smoothed = []
        for i in range(len(data)):
            start = max(0, i - window_size // 2)
            end = min(len(data), i + window_size // 2 + 1)
            smoothed.append(np.mean(data[start:end]))
        
        return smoothed
    
    def _find_peaks(self, data: List[float]) -> List[int]:
        """العثور على القمم في البيانات"""
        if len(data) < 3:
            return []
        
        peaks, _ = find_peaks(data, prominence=self.peak_prominence)
        return peaks.tolist()
    
    def _find_valleys(self, data: List[float]) -> List[int]:
        """العثور على الوديان في البيانات"""
        if len(data) < 3:
            return []
        
        # قلب البيانات للعثور على الوديان
        inverted_data = [-x for x in data]
        valleys, _ = find_peaks(inverted_data, prominence=self.peak_prominence)
        return valleys.tolist()
    
    def _detect_anomalies(self, trend_data: List[TrendPoint]) -> List[TrendPoint]:
        """كشف النقاط الشاذة"""
        if len(trend_data) < self.min_data_points:
            return []
        
        sentiment_scores = [p.sentiment_score for p in trend_data]
        mean_score = np.mean(sentiment_scores)
        std_score = np.std(sentiment_scores)
        
        anomalies = []
        for point in trend_data:
            if std_score > 0:
                z_score = abs(point.sentiment_score - mean_score) / std_score
                if z_score > self.anomaly_threshold:
                    anomalies.append(point)
        
        return anomalies
    
    def _calculate_correlations(self, trend_data: List[TrendPoint]) -> Dict[str, float]:
        """حساب عوامل الارتباط"""
        correlations = {}
        
        if len(trend_data) < 3:
            return correlations
        
        try:
            # الارتباط بين المشاعر والثقة
            sentiment_scores = [p.sentiment_score for p in trend_data]
            confidence_scores = [p.confidence for p in trend_data]
            
            if len(set(confidence_scores)) > 1:  # تجنب الارتباط مع القيم الثابتة
                corr_sentiment_confidence = np.corrcoef(sentiment_scores, confidence_scores)[0, 1]
                if not np.isnan(corr_sentiment_confidence):
                    correlations['sentiment_confidence'] = corr_sentiment_confidence
            
            # الارتباط بين المشاعر والحجم
            volumes = [p.volume for p in trend_data]
            if len(set(volumes)) > 1:
                corr_sentiment_volume = np.corrcoef(sentiment_scores, volumes)[0, 1]
                if not np.isnan(corr_sentiment_volume):
                    correlations['sentiment_volume'] = corr_sentiment_volume
            
            # الارتباط بالوقت (اتجاه زمني)
            time_indices = list(range(len(sentiment_scores)))
            corr_sentiment_time = np.corrcoef(sentiment_scores, time_indices)[0, 1]
            if not np.isnan(corr_sentiment_time):
                correlations['sentiment_time'] = corr_sentiment_time
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في حساب بعض الارتباطات: {str(e)}")
        
        return correlations
    
    async def _analyze_emotion_trends(self, trend_data: List[TrendPoint]) -> Dict[str, Any]:
        """تحليل اتجاهات العواطف"""
        emotion_trends = {}
        
        for emotion in self.emotions:
            emotion_scores = []
            timestamps = []
            
            for point in trend_data:
                if emotion in point.emotion_scores:
                    emotion_scores.append(point.emotion_scores[emotion])
                    timestamps.append(point.timestamp)
            
            if len(emotion_scores) >= 3:
                # حساب الاتجاه
                if len(emotion_scores) > 1:
                    slope, _, r_value, _, _ = stats.linregress(
                        range(len(emotion_scores)), emotion_scores
                    )
                    
                    direction = 'stable'
                    if abs(slope) > 0.001:
                        direction = 'increasing' if slope > 0 else 'decreasing'
                    
                    strength = abs(r_value)
                else:
                    direction = 'stable'
                    strength = 0.0
                
                emotion_trends[emotion] = {
                    'direction': direction,
                    'strength': strength,
                    'average_intensity': np.mean(emotion_scores),
                    'peak_intensity': np.max(emotion_scores),
                    'volatility': np.std(emotion_scores),
                    'data_points': len(emotion_scores)
                }
        
        return emotion_trends
    
    async def _detect_patterns(self, trend_data: List[TrendPoint]) -> Dict[str, Any]:
        """كشف الأنماط في البيانات"""
        patterns = {}
        
        if len(trend_data) < self.min_data_points:
            return patterns
        
        try:
            # نمط الدورية (التكرار اليومي/الأسبوعي)
            patterns['cyclical'] = self._detect_cyclical_patterns(trend_data)
            
            # نمط التجميع (clustering)
            patterns['clustering'] = self._detect_clustering_patterns(trend_data)
            
            # نمط الموسمية
            patterns['seasonality'] = self._detect_seasonal_patterns(trend_data)
            
            # أنماط العواطف
            patterns['emotion_patterns'] = self._detect_emotion_patterns(trend_data)
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في كشف بعض الأنماط: {str(e)}")
        
        return patterns
    
    def _detect_cyclical_patterns(self, trend_data: List[TrendPoint]) -> Dict[str, Any]:
        """كشف الأنماط الدورية"""
        # تحليل التكرار اليومي
        hourly_sentiment = defaultdict(list)
        
        for point in trend_data:
            hour = point.timestamp.hour
            hourly_sentiment[hour].append(point.sentiment_score)
        
        # حساب متوسط المشاعر لكل ساعة
        hourly_averages = {
            hour: np.mean(scores) 
            for hour, scores in hourly_sentiment.items()
            if len(scores) >= 2
        }
        
        # كشف ساعات الذروة والانخفاض
        if len(hourly_averages) >= 6:  # الحد الأدنى للتحليل
            peak_hour = max(hourly_averages.items(), key=lambda x: x[1])
            valley_hour = min(hourly_averages.items(), key=lambda x: x[1])
            
            return {
                'has_daily_cycle': True,
                'peak_hour': peak_hour[0],
                'peak_sentiment': peak_hour[1],
                'valley_hour': valley_hour[0],
                'valley_sentiment': valley_hour[1],
                'cycle_strength': peak_hour[1] - valley_hour[1],
                'hourly_distribution': hourly_averages
            }
        
        return {'has_daily_cycle': False}
    
    def _detect_clustering_patterns(self, trend_data: List[TrendPoint]) -> Dict[str, Any]:
        """كشف أنماط التجميع"""
        if len(trend_data) < 10:
            return {'has_clusters': False}
        
        try:
            # تحضير البيانات للتجميع
            features = []
            for point in trend_data:
                feature_vector = [
                    point.sentiment_score,
                    point.confidence,
                    point.timestamp.hour,  # ساعة اليوم
                    point.timestamp.weekday()  # يوم الأسبوع
                ]
                
                # إضافة العواطف الرئيسية
                for emotion in ['joy', 'sadness', 'anger']:
                    feature_vector.append(point.emotion_scores.get(emotion, 0.0))
                
                features.append(feature_vector)
            
            # تطبيق التجميع
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(features)
            
            clustering = DBSCAN(eps=0.5, min_samples=3)
            cluster_labels = clustering.fit_predict(scaled_features)
            
            # تحليل النتائج
            unique_clusters = set(cluster_labels)
            if -1 in unique_clusters:  # إزالة النقاط الشاذة
                unique_clusters.remove(-1)
            
            if len(unique_clusters) >= 2:
                cluster_analysis = {}
                for cluster_id in unique_clusters:
                    cluster_points = [
                        trend_data[i] for i, label in enumerate(cluster_labels)
                        if label == cluster_id
                    ]
                    
                    if cluster_points:
                        avg_sentiment = np.mean([p.sentiment_score for p in cluster_points])
                        avg_confidence = np.mean([p.confidence for p in cluster_points])
                        
                        cluster_analysis[f'cluster_{cluster_id}'] = {
                            'size': len(cluster_points),
                            'avg_sentiment': avg_sentiment,
                            'avg_confidence': avg_confidence,
                            'time_span': {
                                'start': min(p.timestamp for p in cluster_points).isoformat(),
                                'end': max(p.timestamp for p in cluster_points).isoformat()
                            }
                        }
                
                return {
                    'has_clusters': True,
                    'num_clusters': len(unique_clusters),
                    'cluster_analysis': cluster_analysis,
                    'outliers': sum(1 for label in cluster_labels if label == -1)
                }
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تحليل التجميع: {str(e)}")
        
        return {'has_clusters': False}
    
    def _detect_seasonal_patterns(self, trend_data: List[TrendPoint]) -> Dict[str, Any]:
        """كشف الأنماط الموسمية"""
        # تحليل حسب يوم الأسبوع
        weekday_sentiment = defaultdict(list)
        
        for point in trend_data:
            weekday = point.timestamp.weekday()
            weekday_sentiment[weekday].append(point.sentiment_score)
        
        weekday_analysis = {}
        weekday_names = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
        
        for weekday, scores in weekday_sentiment.items():
            if len(scores) >= 2:
                weekday_analysis[weekday_names[weekday]] = {
                    'average_sentiment': np.mean(scores),
                    'sentiment_std': np.std(scores),
                    'sample_size': len(scores)
                }
        
        # تحديد أفضل وأسوأ أيام الأسبوع
        if len(weekday_analysis) >= 3:
            best_day = max(weekday_analysis.items(), key=lambda x: x[1]['average_sentiment'])
            worst_day = min(weekday_analysis.items(), key=lambda x: x[1]['average_sentiment'])
            
            return {
                'has_weekly_pattern': True,
                'best_day': best_day[0],
                'best_day_sentiment': best_day[1]['average_sentiment'],
                'worst_day': worst_day[0],
                'worst_day_sentiment': worst_day[1]['average_sentiment'],
                'weekday_analysis': weekday_analysis
            }
        
        return {'has_weekly_pattern': False}
    
    def _detect_emotion_patterns(self, trend_data: List[TrendPoint]) -> Dict[str, Any]:
        """كشف أنماط العواطف"""
        emotion_correlations = {}
        
        # حساب الارتباط بين العواطف المختلفة
        for emotion1 in self.emotions:
            for emotion2 in self.emotions:
                if emotion1 != emotion2:
                    scores1 = [p.emotion_scores.get(emotion1, 0.0) for p in trend_data]
                    scores2 = [p.emotion_scores.get(emotion2, 0.0) for p in trend_data]
                    
                    if len(set(scores1)) > 1 and len(set(scores2)) > 1:
                        correlation = np.corrcoef(scores1, scores2)[0, 1]
                        if not np.isnan(correlation) and abs(correlation) > 0.3:
                            emotion_correlations[f'{emotion1}_{emotion2}'] = correlation
        
        # العثور على العواطف المهيمنة
        emotion_dominance = {}
        for emotion in self.emotions:
            scores = [p.emotion_scores.get(emotion, 0.0) for p in trend_data]
            if scores:
                emotion_dominance[emotion] = {
                    'average_intensity': np.mean(scores),
                    'max_intensity': np.max(scores),
                    'frequency': sum(1 for score in scores if score > 0.5) / len(scores)
                }
        
        # ترتيب العواطف حسب الهيمنة
        dominant_emotions = sorted(
            emotion_dominance.items(),
            key=lambda x: x[1]['average_intensity'],
            reverse=True
        )[:3]
        
        return {
            'emotion_correlations': emotion_correlations,
            'dominant_emotions': {name: data for name, data in dominant_emotions},
            'emotion_dominance_full': emotion_dominance
        }
    
    async def _generate_predictions(self, trend_data: List[TrendPoint]) -> Dict[str, Any]:
        """إنشاء التنبؤات"""
        if len(trend_data) < 5:
            return {'error': 'insufficient_data_for_prediction'}
        
        try:
            sentiment_scores = [p.sentiment_score for p in trend_data]
            timestamps = [p.timestamp for p in trend_data]
            
            # التنبؤ بالاتجاه (Linear Regression)
            time_indices = list(range(len(sentiment_scores)))
            slope, intercept, r_value, p_value, std_err = stats.linregress(
                time_indices, sentiment_scores
            )
            
            # التنبؤ للنقاط التالية
            future_points = 5  # التنبؤ لـ 5 نقاط مستقبلية
            predictions = []
            
            for i in range(1, future_points + 1):
                future_index = len(sentiment_scores) + i
                predicted_sentiment = slope * future_index + intercept
                
                # تقدير الوقت المستقبلي (بناءً على متوسط الفترات)
                if len(timestamps) > 1:
                    avg_interval = (timestamps[-1] - timestamps[0]) / (len(timestamps) - 1)
                    future_time = timestamps[-1] + avg_interval * i
                else:
                    future_time = datetime.now() + timedelta(hours=i)
                
                predictions.append({
                    'timestamp': future_time.isoformat(),
                    'predicted_sentiment': predicted_sentiment,
                    'confidence': max(0.1, abs(r_value))  # الثقة بناءً على جودة الاتساق
                })
            
            # تصنيف جودة التنبؤ
            prediction_quality = 'poor'
            if abs(r_value) > 0.7:
                prediction_quality = 'excellent'
            elif abs(r_value) > 0.5:
                prediction_quality = 'good'
            elif abs(r_value) > 0.3:
                prediction_quality = 'moderate'
            
            return {
                'predictions': predictions,
                'model_stats': {
                    'slope': slope,
                    'intercept': intercept,
                    'r_squared': r_value ** 2,
                    'p_value': p_value,
                    'standard_error': std_err
                },
                'prediction_quality': prediction_quality,
                'confidence_level': abs(r_value)
            }
            
        except Exception as e:
            logger.error(f"❌ فشل في إنشاء التنبؤات: {str(e)}")
            return {'error': str(e)}
    
    async def _identify_notable_events(self, trend_data: List[TrendPoint]) -> List[Dict[str, Any]]:
        """تحديد الأحداث البارزة"""
        notable_events = []
        
        if len(trend_data) < 3:
            return notable_events
        
        sentiment_scores = [p.sentiment_score for p in trend_data]
        mean_sentiment = np.mean(sentiment_scores)
        std_sentiment = np.std(sentiment_scores)
        
        for i, point in enumerate(trend_data):
            event = None
            
            # تحديد نوع الحدث
            if std_sentiment > 0:
                z_score = (point.sentiment_score - mean_sentiment) / std_sentiment
                
                if z_score > 2.0:
                    event = {
                        'type': 'sentiment_spike',
                        'description': 'ارتفاع حاد في المشاعر الإيجابية',
                        'severity': 'high' if z_score > 3.0 else 'medium'
                    }
                elif z_score < -2.0:
                    event = {
                        'type': 'sentiment_drop',
                        'description': 'انخفاض حاد في المشاعر',
                        'severity': 'high' if z_score < -3.0 else 'medium'
                    }
            
            # أحداث العواطف القوية
            max_emotion_score = max(point.emotion_scores.values()) if point.emotion_scores else 0
            if max_emotion_score > 0.8:
                dominant_emotion = max(point.emotion_scores.items(), key=lambda x: x[1])
                event = {
                    'type': 'strong_emotion',
                    'description': f'عاطفة قوية: {dominant_emotion[0]}',
                    'emotion': dominant_emotion[0],
                    'intensity': dominant_emotion[1],
                    'severity': 'high' if max_emotion_score > 0.9 else 'medium'
                }
            
            # تسجيل الحدث إذا وُجد
            if event:
                event.update({
                    'timestamp': point.timestamp.isoformat(),
                    'sentiment_score': point.sentiment_score,
                    'confidence': point.confidence,
                    'category': point.category,
                    'z_score': (point.sentiment_score - mean_sentiment) / std_sentiment if std_sentiment > 0 else 0
                })
                notable_events.append(event)
        
        # ترتيب الأحداث حسب الأهمية
        notable_events.sort(key=lambda x: abs(x.get('z_score', 0)), reverse=True)
        
        return notable_events[:10]  # أهم 10 أحداث
    
    async def _generate_trend_visualizations(self, trend_data: List[TrendPoint],
                                           emotion_analysis: Dict[str, Any],
                                           category: Optional[str]) -> Dict[str, str]:
        """إنشاء التصورات البيانية للاتجاهات"""
        visualizations = {}
        
        try:
            timestamps = [p.timestamp for p in trend_data]
            sentiment_scores = [p.sentiment_score for p in trend_data]
            
            # رسم الاتجاه الرئيسي
            fig_main = go.Figure()
            fig_main.add_trace(go.Scatter(
                x=timestamps,
                y=sentiment_scores,
                mode='lines+markers',
                name='اتجاه المشاعر',
                line=dict(color='blue', width=2)
            ))
            
            # إضافة خط الاتجاه
            if len(sentiment_scores) > 1:
                x_numeric = list(range(len(sentiment_scores)))
                slope, intercept, _, _, _ = stats.linregress(x_numeric, sentiment_scores)
                trend_line = [slope * x + intercept for x in x_numeric]
                
                fig_main.add_trace(go.Scatter(
                    x=timestamps,
                    y=trend_line,
                    mode='lines',
                    name='خط الاتجاه',
                    line=dict(color='red', width=1, dash='dash')
                ))
            
            fig_main.update_layout(
                title=f'اتجاه المشاعر - {category or "عام"}',
                xaxis_title='الوقت',
                yaxis_title='نقاط المشاعر',
                hovermode='x unified'
            )
            
            visualizations['main_trend'] = json.dumps(fig_main, cls=PlotlyJSONEncoder)
            
            # رسم العواطف إذا توفرت
            if emotion_analysis:
                fig_emotions = go.Figure()
                
                for emotion, data in emotion_analysis.items():
                    if 'average_intensity' in data:
                        emotion_scores = []
                        for point in trend_data:
                            emotion_scores.append(point.emotion_scores.get(emotion, 0.0))
                        
                        fig_emotions.add_trace(go.Scatter(
                            x=timestamps,
                            y=emotion_scores,
                            mode='lines',
                            name=emotion,
                            opacity=0.7
                        ))
                
                fig_emotions.update_layout(
                    title='اتجاهات العواطف',
                    xaxis_title='الوقت',
                    yaxis_title='شدة العاطفة',
                    hovermode='x unified'
                )
                
                visualizations['emotion_trends'] = json.dumps(fig_emotions, cls=PlotlyJSONEncoder)
            
            # رسم التوزيع
            fig_dist = px.histogram(
                x=sentiment_scores,
                nbins=20,
                title='توزيع نقاط المشاعر'
            )
            fig_dist.update_layout(
                xaxis_title='نقاط المشاعر',
                yaxis_title='التكرار'
            )
            
            visualizations['sentiment_distribution'] = json.dumps(fig_dist, cls=PlotlyJSONEncoder)
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في إنشاء بعض التصورات: {str(e)}")
        
        return visualizations
    
    async def get_trend_summary(self, category: Optional[str] = None) -> Dict[str, Any]:
        """الحصول على ملخص سريع للاتجاهات"""
        try:
            # جلب البيانات الأخيرة
            recent_data = await self._get_recent_trend_data(hours=24)
            
            if not recent_data:
                return {
                    'status': 'no_data',
                    'message': 'لا توجد بيانات متاحة للتحليل'
                }
            
            # حساب الإحصائيات الأساسية
            sentiment_scores = [p.sentiment_score for p in recent_data]
            
            current_sentiment = sentiment_scores[-1] if sentiment_scores else 0.0
            average_sentiment = np.mean(sentiment_scores)
            sentiment_change = current_sentiment - sentiment_scores[0] if len(sentiment_scores) > 1 else 0.0
            
            # تحديد الاتجاه
            if abs(sentiment_change) < 0.05:
                trend_status = 'stable'
                trend_emoji = '➡️'
            elif sentiment_change > 0:
                trend_status = 'improving'
                trend_emoji = '📈'
            else:
                trend_status = 'declining'
                trend_emoji = '📉'
            
            # العاطفة المهيمنة
            all_emotions = defaultdict(list)
            for point in recent_data:
                for emotion, score in point.emotion_scores.items():
                    all_emotions[emotion].append(score)
            
            dominant_emotion = None
            if all_emotions:
                avg_emotions = {emotion: np.mean(scores) for emotion, scores in all_emotions.items()}
                dominant_emotion = max(avg_emotions.items(), key=lambda x: x[1])
            
            return {
                'status': 'success',
                'summary': {
                    'current_sentiment': current_sentiment,
                    'average_sentiment': average_sentiment,
                    'sentiment_change_24h': sentiment_change,
                    'trend_status': trend_status,
                    'trend_emoji': trend_emoji,
                    'dominant_emotion': {
                        'emotion': dominant_emotion[0] if dominant_emotion else 'unknown',
                        'intensity': dominant_emotion[1] if dominant_emotion else 0.0
                    },
                    'data_points': len(recent_data),
                    'category': category,
                    'last_updated': recent_data[-1].timestamp.isoformat() if recent_data else None
                }
            }
            
        except Exception as e:
            logger.error(f"❌ فشل في الحصول على ملخص الاتجاهات: {str(e)}")
            return {
                'status': 'error',
                'message': f'فشل في التحليل: {str(e)}'
            }

# مثال على الاستخدام
if __name__ == "__main__":
    import asyncio
    
    async def test_trend_analysis():
        # إنشاء خدمة التحليل
        trend_service = TrendAnalysisService()
        
        # مثال على نقاط اتجاه متنوعة
        sample_points = []
        base_time = datetime.now() - timedelta(hours=24)
        
        for i in range(48):  # 48 نقطة خلال 24 ساعة
            timestamp = base_time + timedelta(minutes=30 * i)
            
            # محاكاة اتجاه متزايد مع بعض التقلبات
            base_sentiment = 0.3 + (i * 0.01) + np.random.normal(0, 0.1)
            base_sentiment = max(-1, min(1, base_sentiment))  # تحديد النطاق
            
            point = TrendPoint(
                timestamp=timestamp,
                sentiment_score=base_sentiment,
                emotion_scores={
                    'joy': max(0, base_sentiment + np.random.normal(0, 0.1)),
                    'sadness': max(0, -base_sentiment + np.random.normal(0, 0.1)),
                    'anger': max(0, np.random.normal(0, 0.05)),
                    'fear': max(0, np.random.normal(0, 0.05))
                },
                volume=np.random.randint(1, 10),
                confidence=np.random.uniform(0.7, 0.95),
                category='news'
            )
            sample_points.append(point)
        
        # تشغيل التحليل
        analysis_result = await trend_service.analyze_trends(
            category='news',
            time_range='24h',
            include_emotions=True,
            min_samples=10
        )
        
        if analysis_result['success']:
            trend_data = analysis_result['data']['trend_analysis']
            print(f"🔍 اتجاه الترند: {trend_data['trend_direction']}")
            print(f"💪 قوة الاتجاه: {trend_data['trend_strength']:.2f}")
            print(f"⏰ مدة الاتجاه: {trend_data['trend_duration']}")
            print(f"📊 نقاط القمة: {len(trend_data['peak_points'])}")
            print(f"📉 نقاط الانخفاض: {len(trend_data['valley_points'])}")
            print(f"⚠️ نقاط شاذة: {len(trend_data['anomalies'])}")
            
            # عرض التنبؤات
            predictions = analysis_result['data']['predictions']
            if 'predictions' in predictions:
                print(f"\n🔮 التنبؤات:")
                for pred in predictions['predictions'][:3]:
                    print(f"  {pred['timestamp']}: {pred['predicted_sentiment']:.2f}")
            
            # الأحداث البارزة
            events = analysis_result['data']['notable_events']
            print(f"\n📌 الأحداث البارزة: {len(events)}")
            for event in events[:3]:
                print(f"  {event['type']}: {event['description']}")
        else:
            print(f"❌ فشل في التحليل: {analysis_result.get('message', 'خطأ غير معروف')}")
    
    # تشغيل الاختبار
    asyncio.run(test_trend_analysis())
