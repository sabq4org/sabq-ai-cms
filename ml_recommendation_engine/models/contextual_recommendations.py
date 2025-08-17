# محرك التوصيات التكيفي حسب المزاج والسياق - سبق الذكية
# Adaptive Contextual and Mood-Based Recommendation Engine

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
import logging
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import defaultdict, deque
from enum import Enum
import json
import joblib
import pickle
import asyncio
from concurrent.futures import ThreadPoolExecutor
import threading
import time
import math
import random

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MoodState(Enum):
    """حالات المزاج"""
    POSITIVE = "إيجابي"
    NEUTRAL = "محايد"
    NEGATIVE = "سلبي"
    CURIOUS = "فضولي"
    RELAXED = "مسترخي"
    ENERGETIC = "نشيط"
    FOCUSED = "مركز"
    EXPLORATORY = "استكشافي"
    NOSTALGIC = "حنين"
    ANALYTICAL = "تحليلي"

class ContextType(Enum):
    """أنواع السياق"""
    TEMPORAL = "زمني"          # الوقت من اليوم، اليوم من الأسبوع
    ENVIRONMENTAL = "بيئي"      # الموقع، الطقس، الضوضاء
    SOCIAL = "اجتماعي"         # مع أصدقاء، وحيد، في مجموعة
    ACTIVITY = "نشاط"          # العمل، الراحة، السفر
    DEVICE = "جهاز"           # موبايل، حاسوب، تابلت
    BEHAVIORAL = "سلوكي"       # نمط الاستخدام الحالي

@dataclass
class ContextualFeatures:
    """معالم السياق"""
    # Temporal features
    hour_of_day: float = 0.0
    day_of_week: float = 0.0
    is_weekend: bool = False
    is_holiday: bool = False
    time_since_last_visit: float = 0.0
    
    # Environmental features
    location_type: str = "home"  # home, work, public, travel
    weather_condition: str = "clear"  # clear, rain, snow, cloudy
    ambient_light: float = 1.0  # 0.0 (dark) to 1.0 (bright)
    noise_level: float = 0.5  # 0.0 (silent) to 1.0 (loud)
    
    # Social features
    social_context: str = "alone"  # alone, with_friends, with_family, in_group
    social_activity: bool = False
    
    # Activity features
    current_activity: str = "browsing"  # working, relaxing, commuting, browsing
    multitasking: bool = False
    urgency_level: float = 0.5  # 0.0 (no rush) to 1.0 (urgent)
    
    # Device features
    device_type: str = "mobile"  # mobile, tablet, desktop
    connection_type: str = "wifi"  # wifi, mobile, slow
    battery_level: float = 1.0  # 0.0 to 1.0
    screen_size: str = "medium"  # small, medium, large
    
    # Behavioral features
    session_length: float = 0.0  # minutes
    pages_visited: int = 0
    scroll_speed: float = 1.0  # relative speed
    interaction_rate: float = 0.5  # interactions per minute
    
    # Mood indicators
    reading_speed: float = 1.0  # relative to user's average
    click_precision: float = 1.0  # accuracy of clicks
    time_between_actions: float = 1.0  # relative timing
    content_engagement: float = 0.5  # depth of engagement

@dataclass
class MoodIndicators:
    """مؤشرات المزاج"""
    # Behavioral indicators
    activity_level: float = 0.5  # 0.0 (passive) to 1.0 (active)
    exploration_tendency: float = 0.5  # tendency to explore new content
    focus_level: float = 0.5  # ability to focus on content
    patience_level: float = 0.5  # tolerance for long content
    
    # Interaction patterns
    interaction_frequency: float = 0.5
    content_completion_rate: float = 0.5
    sharing_propensity: float = 0.5
    commenting_activity: float = 0.5
    
    # Content preferences (mood-based)
    positive_content_preference: float = 0.5
    complex_content_tolerance: float = 0.5
    visual_content_preference: float = 0.5
    interactive_content_preference: float = 0.5
    
    # Temporal patterns
    consistency_with_routine: float = 0.5
    spontaneity_level: float = 0.5

@dataclass
class ContextualConfig:
    """إعدادات النظام السياقي"""
    # Mood detection
    mood_detection_window: int = 10  # minutes
    mood_smoothing_factor: float = 0.7
    min_interactions_for_mood: int = 3
    
    # Context analysis
    context_update_frequency: int = 30  # seconds
    context_history_length: int = 100
    context_similarity_threshold: float = 0.8
    
    # Adaptation parameters
    adaptation_learning_rate: float = 0.01
    context_weight_decay: float = 0.95
    mood_weight_decay: float = 0.9
    
    # Recommendation tuning
    context_influence_factor: float = 0.3
    mood_influence_factor: float = 0.4
    base_recommendation_weight: float = 0.3
    
    # Content matching
    mood_content_mapping: Dict[str, List[str]] = field(default_factory=dict)
    context_content_preferences: Dict[str, Dict[str, float]] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.mood_content_mapping:
            self.mood_content_mapping = {
                MoodState.POSITIVE.value: ["إيجابي", "ملهم", "نجاح", "أمل", "فرح"],
                MoodState.NEGATIVE.value: ["دعم", "حلول", "تحفيز", "تطوير"],
                MoodState.CURIOUS.value: ["علمي", "تقني", "اكتشاف", "معرفة"],
                MoodState.RELAXED.value: ["ترفيه", "فن", "طبيعة", "هدوء"],
                MoodState.ENERGETIC.value: ["رياضة", "حماس", "نشاط", "تحدي"],
                MoodState.FOCUSED.value: ["تحليل", "عمق", "دراسة", "تركيز"],
                MoodState.EXPLORATORY.value: ["جديد", "متنوع", "غريب", "مثير"],
                MoodState.NOSTALGIC.value: ["تاريخ", "ذكريات", "تراث", "ماضي"],
                MoodState.ANALYTICAL.value: ["إحصائيات", "بحث", "تحليل", "دراسة"]
            }
        
        if not self.context_content_preferences:
            self.context_content_preferences = {
                "morning": {"news": 0.8, "analysis": 0.6, "light": 0.4},
                "afternoon": {"work": 0.7, "professional": 0.8, "quick": 0.6},
                "evening": {"entertainment": 0.8, "deep": 0.7, "visual": 0.6},
                "night": {"light": 0.8, "short": 0.7, "relaxing": 0.8},
                "weekend": {"entertainment": 0.9, "deep": 0.8, "visual": 0.7},
                "work": {"professional": 0.9, "quick": 0.8, "relevant": 0.7},
                "mobile": {"short": 0.8, "visual": 0.7, "quick": 0.9},
                "desktop": {"long": 0.7, "detailed": 0.8, "complex": 0.6}
            }


class MoodDetector:
    """
    كاشف المزاج من السلوك
    Mood Detector from Behavior
    """
    
    def __init__(self, config: ContextualConfig):
        self.config = config
        self.interaction_history = deque(maxlen=config.context_history_length)
        self.mood_history = deque(maxlen=50)
        self.current_mood = MoodState.NEUTRAL
        self.mood_confidence = 0.5
        
    def detect_mood(self, recent_interactions: List[Dict[str, Any]], 
                   contextual_features: ContextualFeatures) -> Tuple[MoodState, float]:
        """كشف المزاج الحالي"""
        
        if len(recent_interactions) < self.config.min_interactions_for_mood:
            return self.current_mood, self.mood_confidence
        
        # استخراج مؤشرات المزاج
        mood_indicators = self._extract_mood_indicators(recent_interactions, contextual_features)
        
        # تحليل المزاج بناءً على المؤشرات
        mood_scores = self._calculate_mood_scores(mood_indicators)
        
        # تحديد المزاج الأكثر احتمالاً
        detected_mood = max(mood_scores, key=mood_scores.get)
        confidence = mood_scores[detected_mood]
        
        # تطبيق التنعيم الزمني
        if self.mood_history:
            previous_mood_weight = self.config.mood_smoothing_factor
            current_mood_weight = 1 - previous_mood_weight
            
            # تعديل الثقة بناءً على الاستمرارية
            if detected_mood == self.current_mood:
                confidence = previous_mood_weight * self.mood_confidence + current_mood_weight * confidence
            else:
                confidence = current_mood_weight * confidence
        
        # تحديث التاريخ
        self.mood_history.append({
            'mood': detected_mood,
            'confidence': confidence,
            'timestamp': datetime.now(),
            'indicators': mood_indicators
        })
        
        self.current_mood = detected_mood
        self.mood_confidence = confidence
        
        logger.info(f"🎭 كشف مزاج: {detected_mood.value} (ثقة: {confidence:.2f})")
        
        return detected_mood, confidence
    
    def _extract_mood_indicators(self, interactions: List[Dict[str, Any]], 
                                context: ContextualFeatures) -> MoodIndicators:
        """استخراج مؤشرات المزاج"""
        
        indicators = MoodIndicators()
        
        if not interactions:
            return indicators
        
        # تحليل مستوى النشاط
        interaction_count = len(interactions)
        time_span = (datetime.now() - pd.to_datetime(interactions[0]['timestamp'])).total_seconds() / 60
        activity_rate = interaction_count / max(time_span, 1)
        indicators.activity_level = min(activity_rate / 5, 1.0)  # تطبيع لـ 5 تفاعلات/دقيقة
        
        # تحليل نمط الاستكشاف
        unique_articles = len(set(interaction['article_id'] for interaction in interactions))
        exploration_rate = unique_articles / interaction_count
        indicators.exploration_tendency = exploration_rate
        
        # تحليل مستوى التركيز
        reading_times = [interaction.get('reading_time', 0) for interaction in interactions]
        avg_reading_time = np.mean(reading_times) if reading_times else 0
        indicators.focus_level = min(avg_reading_time / 300, 1.0)  # تطبيع لـ 5 دقائق
        
        # تحليل مستوى الصبر
        completion_rates = [interaction.get('read_percentage', 50) for interaction in interactions]
        avg_completion = np.mean(completion_rates) / 100
        indicators.patience_level = avg_completion
        
        # تحليل تكرار التفاعل
        interaction_types = [interaction.get('interaction_type', 'view') for interaction in interactions]
        active_interactions = sum(1 for t in interaction_types if t in ['like', 'save', 'share', 'comment'])
        indicators.interaction_frequency = active_interactions / interaction_count
        
        # تحليل معدل إكمال المحتوى
        indicators.content_completion_rate = avg_completion
        
        # تحليل ميل المشاركة
        sharing_interactions = sum(1 for t in interaction_types if t == 'share')
        indicators.sharing_propensity = sharing_interactions / interaction_count
        
        # تحليل نشاط التعليق
        comment_interactions = sum(1 for t in interaction_types if t == 'comment')
        indicators.commenting_activity = comment_interactions / interaction_count
        
        # تحليل تفضيل المحتوى الإيجابي (تحليل مبسط)
        # يمكن تطويره باستخدام تحليل المشاعر للمحتوى المتفاعل معه
        positive_keywords = ['نجح', 'أمل', 'فرح', 'إنجاز', 'تقدم']
        positive_content_count = 0
        for interaction in interactions:
            title = interaction.get('title', '').lower()
            if any(keyword in title for keyword in positive_keywords):
                positive_content_count += 1
        indicators.positive_content_preference = positive_content_count / interaction_count
        
        # تحليل تحمل المحتوى المعقد
        long_articles = sum(1 for interaction in interactions 
                          if interaction.get('content_length', 0) > 1000)
        indicators.complex_content_tolerance = long_articles / interaction_count
        
        # تحليل تفضيل المحتوى البصري
        visual_interactions = sum(1 for interaction in interactions 
                                if interaction.get('has_images', False) or 
                                   interaction.get('has_video', False))
        indicators.visual_content_preference = visual_interactions / interaction_count
        
        # تحليل تفضيل المحتوى التفاعلي
        interactive_content = sum(1 for interaction in interactions 
                                if interaction.get('interaction_type') in ['like', 'save', 'share', 'comment'])
        indicators.interactive_content_preference = interactive_content / interaction_count
        
        # تحليل الثبات مع الروتين
        current_hour = datetime.now().hour
        user_typical_hours = [pd.to_datetime(interaction['timestamp']).hour 
                             for interaction in interactions]
        hour_consistency = sum(1 for hour in user_typical_hours 
                              if abs(hour - current_hour) <= 2) / len(user_typical_hours)
        indicators.consistency_with_routine = hour_consistency
        
        # تحليل مستوى العفوية
        time_gaps = []
        sorted_interactions = sorted(interactions, key=lambda x: x['timestamp'])
        for i in range(1, len(sorted_interactions)):
            gap = (pd.to_datetime(sorted_interactions[i]['timestamp']) - 
                  pd.to_datetime(sorted_interactions[i-1]['timestamp'])).total_seconds()
            time_gaps.append(gap)
        
        if time_gaps:
            gap_variance = np.var(time_gaps)
            indicators.spontaneity_level = min(gap_variance / 3600, 1.0)  # تطبيع للتباين بالثواني
        
        return indicators
    
    def _calculate_mood_scores(self, indicators: MoodIndicators) -> Dict[MoodState, float]:
        """حساب نقاط المزاج المختلفة"""
        
        scores = {}
        
        # المزاج الإيجابي
        scores[MoodState.POSITIVE] = (
            indicators.positive_content_preference * 0.4 +
            indicators.sharing_propensity * 0.3 +
            indicators.interaction_frequency * 0.3
        )
        
        # المزاج السلبي
        scores[MoodState.NEGATIVE] = (
            (1 - indicators.positive_content_preference) * 0.4 +
            (1 - indicators.interaction_frequency) * 0.3 +
            (1 - indicators.activity_level) * 0.3
        )
        
        # المزاج الفضولي
        scores[MoodState.CURIOUS] = (
            indicators.exploration_tendency * 0.5 +
            indicators.complex_content_tolerance * 0.3 +
            indicators.focus_level * 0.2
        )
        
        # المزاج المسترخي
        scores[MoodState.RELAXED] = (
            indicators.visual_content_preference * 0.4 +
            (1 - indicators.activity_level) * 0.3 +
            indicators.patience_level * 0.3
        )
        
        # المزاج النشيط
        scores[MoodState.ENERGETIC] = (
            indicators.activity_level * 0.5 +
            indicators.interaction_frequency * 0.3 +
            indicators.spontaneity_level * 0.2
        )
        
        # المزاج المركز
        scores[MoodState.FOCUSED] = (
            indicators.focus_level * 0.5 +
            indicators.content_completion_rate * 0.3 +
            indicators.consistency_with_routine * 0.2
        )
        
        # المزاج الاستكشافي
        scores[MoodState.EXPLORATORY] = (
            indicators.exploration_tendency * 0.6 +
            indicators.spontaneity_level * 0.4
        )
        
        # المزاج الحنيني
        scores[MoodState.NOSTALGIC] = (
            (1 - indicators.exploration_tendency) * 0.4 +
            indicators.consistency_with_routine * 0.3 +
            indicators.patience_level * 0.3
        )
        
        # المزاج التحليلي
        scores[MoodState.ANALYTICAL] = (
            indicators.complex_content_tolerance * 0.4 +
            indicators.focus_level * 0.3 +
            (1 - indicators.visual_content_preference) * 0.3
        )
        
        # المزاج المحايد (خط الأساس)
        baseline_score = 0.3
        scores[MoodState.NEUTRAL] = baseline_score
        
        # تطبيع النقاط
        total_score = sum(scores.values())
        if total_score > 0:
            scores = {mood: score / total_score for mood, score in scores.items()}
        
        return scores
    
    def get_mood_explanation(self) -> Dict[str, Any]:
        """الحصول على تفسير المزاج الحالي"""
        if not self.mood_history:
            return {}
        
        latest_mood_data = self.mood_history[-1]
        indicators = latest_mood_data['indicators']
        
        explanation = {
            'current_mood': self.current_mood.value,
            'confidence': self.mood_confidence,
            'key_indicators': [],
            'mood_trends': self._analyze_mood_trends()
        }
        
        # تحديد المؤشرات الرئيسية
        indicator_scores = {
            'النشاط': indicators.activity_level,
            'الاستكشاف': indicators.exploration_tendency,
            'التركيز': indicators.focus_level,
            'الصبر': indicators.patience_level,
            'التفاعل': indicators.interaction_frequency,
            'المحتوى الإيجابي': indicators.positive_content_preference
        }
        
        # ترتيب المؤشرات وأخذ الأعلى
        sorted_indicators = sorted(indicator_scores.items(), key=lambda x: x[1], reverse=True)
        explanation['key_indicators'] = sorted_indicators[:3]
        
        return explanation
    
    def _analyze_mood_trends(self) -> Dict[str, Any]:
        """تحليل اتجاهات المزاج"""
        if len(self.mood_history) < 3:
            return {'trend': 'insufficient_data'}
        
        recent_moods = [entry['mood'] for entry in list(self.mood_history)[-5:]]
        mood_changes = len(set(recent_moods))
        
        confidence_trend = [entry['confidence'] for entry in list(self.mood_history)[-5:]]
        avg_confidence = np.mean(confidence_trend)
        confidence_stability = 1 - np.std(confidence_trend)
        
        return {
            'stability': 'stable' if mood_changes <= 2 else 'variable',
            'average_confidence': avg_confidence,
            'confidence_stability': confidence_stability,
            'dominant_recent_mood': max(set(recent_moods), key=recent_moods.count).value
        }


class ContextAnalyzer:
    """
    محلل السياق البيئي والسلوكي
    Environmental and Behavioral Context Analyzer
    """
    
    def __init__(self, config: ContextualConfig):
        self.config = config
        self.context_history = deque(maxlen=config.context_history_length)
        self.context_patterns = {}
        
    def analyze_context(self, user_data: Dict[str, Any], 
                       session_data: Dict[str, Any]) -> ContextualFeatures:
        """تحليل السياق الحالي"""
        
        features = ContextualFeatures()
        
        # تحليل المعالم الزمنية
        now = datetime.now()
        features.hour_of_day = now.hour / 24.0
        features.day_of_week = now.weekday() / 6.0
        features.is_weekend = now.weekday() >= 5
        features.is_holiday = self._is_holiday(now)
        
        # حساب الوقت منذ آخر زيارة
        last_visit = user_data.get('last_visit')
        if last_visit:
            time_diff = (now - pd.to_datetime(last_visit)).total_seconds() / 3600  # بالساعات
            features.time_since_last_visit = min(time_diff / 24, 1.0)  # تطبيع ليوم واحد
        
        # تحليل المعالم البيئية
        features.location_type = session_data.get('location_type', 'home')
        features.weather_condition = session_data.get('weather', 'clear')
        features.ambient_light = session_data.get('ambient_light', 1.0)
        features.noise_level = session_data.get('noise_level', 0.5)
        
        # تحليل المعالم الاجتماعية
        features.social_context = session_data.get('social_context', 'alone')
        features.social_activity = session_data.get('social_activity', False)
        
        # تحليل معالم النشاط
        features.current_activity = session_data.get('current_activity', 'browsing')
        features.multitasking = session_data.get('multitasking', False)
        features.urgency_level = session_data.get('urgency_level', 0.5)
        
        # تحليل معالم الجهاز
        features.device_type = session_data.get('device_type', 'mobile')
        features.connection_type = session_data.get('connection_type', 'wifi')
        features.battery_level = session_data.get('battery_level', 1.0)
        features.screen_size = session_data.get('screen_size', 'medium')
        
        # تحليل المعالم السلوكية
        features.session_length = session_data.get('session_length', 0.0)
        features.pages_visited = session_data.get('pages_visited', 0)
        features.scroll_speed = session_data.get('scroll_speed', 1.0)
        features.interaction_rate = session_data.get('interaction_rate', 0.5)
        
        # تحليل مؤشرات المزاج السلوكية
        features.reading_speed = session_data.get('reading_speed', 1.0)
        features.click_precision = session_data.get('click_precision', 1.0)
        features.time_between_actions = session_data.get('time_between_actions', 1.0)
        features.content_engagement = session_data.get('content_engagement', 0.5)
        
        # حفظ في التاريخ
        self.context_history.append({
            'features': features,
            'timestamp': now
        })
        
        return features
    
    def _is_holiday(self, date: datetime) -> bool:
        """تحديد ما إذا كان التاريخ عطلة"""
        # تنفيذ مبسط - يمكن تطويره ليشمل العطل الفعلية
        # في السعودية مثل العطل الدينية والوطنية
        return False
    
    def detect_context_patterns(self) -> Dict[str, Any]:
        """كشف أنماط السياق"""
        if len(self.context_history) < 10:
            return {}
        
        patterns = {}
        
        # تحليل الأنماط الزمنية
        hourly_usage = defaultdict(int)
        device_usage = defaultdict(int)
        activity_patterns = defaultdict(list)
        
        for entry in self.context_history:
            features = entry['features']
            timestamp = entry['timestamp']
            
            hour = timestamp.hour
            hourly_usage[hour] += 1
            device_usage[features.device_type] += 1
            activity_patterns[features.current_activity].append(hour)
        
        # أكثر الساعات نشاطاً
        peak_hours = sorted(hourly_usage.items(), key=lambda x: x[1], reverse=True)[:3]
        patterns['peak_hours'] = [hour for hour, count in peak_hours]
        
        # الجهاز المفضل
        preferred_device = max(device_usage, key=device_usage.get)
        patterns['preferred_device'] = preferred_device
        
        # أنماط النشاط
        for activity, hours in activity_patterns.items():
            if len(hours) >= 3:
                patterns[f'{activity}_pattern'] = {
                    'average_hour': np.mean(hours),
                    'hour_variance': np.var(hours),
                    'frequency': len(hours)
                }
        
        return patterns
    
    def predict_context_change(self) -> Dict[str, float]:
        """التنبؤ بتغيير السياق"""
        if len(self.context_history) < 5:
            return {}
        
        # تحليل مبسط للتنبؤ بالتغيرات المحتملة
        recent_contexts = list(self.context_history)[-5:]
        
        # تحليل استقرار الجهاز
        devices = [entry['features'].device_type for entry in recent_contexts]
        device_stability = len(set(devices)) == 1
        
        # تحليل استقرار النشاط
        activities = [entry['features'].current_activity for entry in recent_contexts]
        activity_stability = len(set(activities)) == 1
        
        # تحليل اتجاه طول الجلسة
        session_lengths = [entry['features'].session_length for entry in recent_contexts]
        session_trend = np.polyfit(range(len(session_lengths)), session_lengths, 1)[0]
        
        predictions = {
            'device_change_probability': 0.1 if device_stability else 0.7,
            'activity_change_probability': 0.2 if activity_stability else 0.6,
            'session_end_probability': max(0, min(session_trend * 0.1, 1.0))
        }
        
        return predictions


class ContextualContentMatcher:
    """
    مطابق المحتوى السياقي
    Contextual Content Matcher
    """
    
    def __init__(self, config: ContextualConfig):
        self.config = config
        self.content_context_scores = {}
        
    def calculate_content_context_fit(self, content: Dict[str, Any], 
                                    context: ContextualFeatures,
                                    mood: MoodState) -> float:
        """حساب مدى ملاءمة المحتوى للسياق والمزاج"""
        
        fit_score = 0.0
        
        # مطابقة المزاج
        mood_score = self._calculate_mood_content_match(content, mood)
        fit_score += mood_score * self.config.mood_influence_factor
        
        # مطابقة السياق الزمني
        temporal_score = self._calculate_temporal_content_match(content, context)
        fit_score += temporal_score * 0.2
        
        # مطابقة الجهاز
        device_score = self._calculate_device_content_match(content, context)
        fit_score += device_score * 0.15
        
        # مطابقة النشاط
        activity_score = self._calculate_activity_content_match(content, context)
        fit_score += activity_score * 0.15
        
        # مطابقة البيئة
        environment_score = self._calculate_environment_content_match(content, context)
        fit_score += environment_score * 0.1
        
        return min(fit_score, 1.0)
    
    def _calculate_mood_content_match(self, content: Dict[str, Any], mood: MoodState) -> float:
        """حساب مطابقة المحتوى للمزاج"""
        
        content_text = f"{content.get('title', '')} {content.get('description', '')}"
        content_category = content.get('category', '').lower()
        content_tags = content.get('tags', [])
        
        # الحصول على كلمات المزاج المطلوبة
        mood_keywords = self.config.mood_content_mapping.get(mood.value, [])
        
        # حساب التطابق بالكلمات المفتاحية
        keyword_matches = 0
        for keyword in mood_keywords:
            if keyword.lower() in content_text.lower():
                keyword_matches += 1
            if keyword.lower() in content_category:
                keyword_matches += 1
            if any(keyword.lower() in tag.lower() for tag in content_tags):
                keyword_matches += 1
        
        keyword_score = min(keyword_matches / len(mood_keywords), 1.0) if mood_keywords else 0.5
        
        # مطابقة خاصة بالمزاج
        mood_specific_score = self._get_mood_specific_score(content, mood)
        
        return (keyword_score * 0.6 + mood_specific_score * 0.4)
    
    def _get_mood_specific_score(self, content: Dict[str, Any], mood: MoodState) -> float:
        """حساب نقاط خاصة بكل مزاج"""
        
        content_length = content.get('content_length', 500)
        has_images = content.get('has_images', False)
        complexity_level = content.get('complexity_level', 0.5)
        reading_time = content.get('estimated_reading_time', 5)
        
        if mood == MoodState.RELAXED:
            # المزاج المسترخي يفضل المحتوى البصري والقصير
            return (
                (0.8 if has_images else 0.3) * 0.4 +
                (0.9 if reading_time <= 3 else 0.5) * 0.3 +
                (0.8 if complexity_level <= 0.5 else 0.4) * 0.3
            )
        
        elif mood == MoodState.FOCUSED:
            # المزاج المركز يفضل المحتوى العميق والطويل
            return (
                (0.9 if reading_time >= 10 else 0.5) * 0.4 +
                (0.8 if complexity_level >= 0.7 else 0.4) * 0.4 +
                (0.7 if not has_images else 0.5) * 0.2
            )
        
        elif mood == MoodState.ENERGETIC:
            # المزاج النشيط يفضل المحتوى السريع والتفاعلي
            return (
                (0.9 if reading_time <= 5 else 0.4) * 0.5 +
                (0.8 if has_images else 0.4) * 0.3 +
                (0.7 if content.get('interactive', False) else 0.5) * 0.2
            )
        
        elif mood == MoodState.CURIOUS:
            # المزاج الفضولي يفضل المحتوى المتنوع والمعلوماتي
            return (
                (0.9 if complexity_level >= 0.6 else 0.5) * 0.4 +
                (0.8 if 'علمي' in content.get('category', '') else 0.5) * 0.3 +
                (0.7 if content.get('has_data', False) else 0.5) * 0.3
            )
        
        elif mood == MoodState.ANALYTICAL:
            # المزاج التحليلي يفضل البيانات والتحليلات
            return (
                (0.9 if content.get('has_charts', False) else 0.4) * 0.4 +
                (0.8 if 'تحليل' in content.get('title', '') else 0.5) * 0.3 +
                (0.8 if complexity_level >= 0.8 else 0.5) * 0.3
            )
        
        else:
            return 0.5  # نقاط محايدة للمزاج المحايد
    
    def _calculate_temporal_content_match(self, content: Dict[str, Any], 
                                        context: ContextualFeatures) -> float:
        """حساب مطابقة المحتوى للوقت"""
        
        hour = context.hour_of_day * 24
        
        # تفضيلات زمنية للمحتوى
        if 6 <= hour <= 11:  # صباح
            preferences = self.config.context_content_preferences.get('morning', {})
        elif 12 <= hour <= 17:  # بعد الظهر
            preferences = self.config.context_content_preferences.get('afternoon', {})
        elif 18 <= hour <= 22:  # مساء
            preferences = self.config.context_content_preferences.get('evening', {})
        else:  # ليل
            preferences = self.config.context_content_preferences.get('night', {})
        
        # حساب التطابق
        match_score = 0.5  # قيمة افتراضية
        
        content_category = content.get('category', '').lower()
        content_type = content.get('type', '').lower()
        
        for pref_type, pref_score in preferences.items():
            if pref_type in content_category or pref_type in content_type:
                match_score = max(match_score, pref_score)
        
        # تعديل بناءً على عطلة نهاية الأسبوع
        if context.is_weekend:
            weekend_prefs = self.config.context_content_preferences.get('weekend', {})
            for pref_type, pref_score in weekend_prefs.items():
                if pref_type in content_category or pref_type in content_type:
                    match_score = max(match_score, pref_score)
        
        return match_score
    
    def _calculate_device_content_match(self, content: Dict[str, Any], 
                                      context: ContextualFeatures) -> float:
        """حساب مطابقة المحتوى للجهاز"""
        
        device_prefs = self.config.context_content_preferences.get(context.device_type, {})
        
        content_length = content.get('content_length', 500)
        has_images = content.get('has_images', False)
        is_interactive = content.get('interactive', False)
        
        match_score = 0.5
        
        if context.device_type == 'mobile':
            # الموبايل يفضل المحتوى القصير والبصري
            if content_length <= 800:
                match_score += 0.3
            if has_images:
                match_score += 0.2
            if content.get('mobile_optimized', False):
                match_score += 0.2
        
        elif context.device_type == 'desktop':
            # سطح المكتب يمكنه التعامل مع المحتوى الطويل والمعقد
            if content_length >= 1000:
                match_score += 0.2
            if content.get('has_charts', False):
                match_score += 0.2
            if is_interactive:
                match_score += 0.1
        
        elif context.device_type == 'tablet':
            # التابلت متوسط بين الموبايل وسطح المكتب
            if 600 <= content_length <= 1500:
                match_score += 0.2
            if has_images:
                match_score += 0.15
        
        return min(match_score, 1.0)
    
    def _calculate_activity_content_match(self, content: Dict[str, Any], 
                                        context: ContextualFeatures) -> float:
        """حساب مطابقة المحتوى للنشاط الحالي"""
        
        activity = context.current_activity
        
        if activity == 'working':
            # أثناء العمل: محتوى مهني وسريع
            if 'مهني' in content.get('category', '') or 'عمل' in content.get('tags', []):
                return 0.9
            if content.get('estimated_reading_time', 10) <= 5:
                return 0.7
            return 0.4
        
        elif activity == 'commuting':
            # أثناء التنقل: محتوى قصير وسهل القراءة
            if content.get('estimated_reading_time', 10) <= 3:
                return 0.9
            if content.get('has_audio', False):
                return 0.8
            return 0.3
        
        elif activity == 'relaxing':
            # أثناء الاسترخاء: محتوى ترفيهي ومريح
            if 'ترفيه' in content.get('category', ''):
                return 0.9
            if content.get('has_images', False):
                return 0.7
            return 0.5
        
        else:
            return 0.5  # نقاط محايدة للأنشطة الأخرى
    
    def _calculate_environment_content_match(self, content: Dict[str, Any], 
                                           context: ContextualFeatures) -> float:
        """حساب مطابقة المحتوى للبيئة"""
        
        match_score = 0.5
        
        # تأثير الإضاءة
        if context.ambient_light < 0.3:  # إضاءة منخفضة
            # تفضيل المحتوى الصوتي أو قصير المدى
            if content.get('has_audio', False):
                match_score += 0.2
            if content.get('estimated_reading_time', 10) <= 3:
                match_score += 0.1
        
        # تأثير الضوضاء
        if context.noise_level > 0.7:  # بيئة صاخبة
            # تفضيل المحتوى البصري
            if content.get('has_images', False):
                match_score += 0.2
            if content.get('has_video', False):
                match_score += 0.1
        
        # تأثير نوع الموقع
        if context.location_type == 'public':
            # في الأماكن العامة: محتوى أقل حساسية وأقصر
            if content.get('estimated_reading_time', 10) <= 5:
                match_score += 0.2
            if 'عام' not in content.get('sensitivity_level', 'عام'):
                match_score -= 0.2
        
        return min(max(match_score, 0.0), 1.0)


class ContextualRecommendationEngine:
    """
    محرك التوصيات السياقي الرئيسي
    Main Contextual Recommendation Engine
    """
    
    def __init__(self, config: ContextualConfig):
        self.config = config
        self.mood_detector = MoodDetector(config)
        self.context_analyzer = ContextAnalyzer(config)
        self.content_matcher = ContextualContentMatcher(config)
        self.adaptation_history = deque(maxlen=1000)
        
    def get_contextual_recommendations(self, user_id: str, 
                                     base_recommendations: List[Tuple[str, float]],
                                     user_data: Dict[str, Any],
                                     session_data: Dict[str, Any],
                                     recent_interactions: List[Dict[str, Any]],
                                     content_database: List[Dict[str, Any]]) -> List[Tuple[str, float, Dict[str, Any]]]:
        """الحصول على توصيات مكيفة حسب السياق والمزاج"""
        
        logger.info(f"🎯 إنشاء توصيات سياقية للمستخدم {user_id}")
        
        # تحليل السياق الحالي
        current_context = self.context_analyzer.analyze_context(user_data, session_data)
        
        # كشف المزاج الحالي
        current_mood, mood_confidence = self.mood_detector.detect_mood(
            recent_interactions, current_context
        )
        
        # تطبيق التكيف السياقي على التوصيات
        contextual_recommendations = []
        
        for article_id, base_score in base_recommendations:
            # العثور على معلومات المحتوى
            content_info = next(
                (content for content in content_database if content['id'] == article_id),
                {}
            )
            
            if not content_info:
                continue
            
            # حساب مدى الملاءمة السياقية
            context_fit = self.content_matcher.calculate_content_context_fit(
                content_info, current_context, current_mood
            )
            
            # حساب النقاط المكيفة
            adapted_score = self._calculate_adapted_score(
                base_score, context_fit, mood_confidence
            )
            
            # إضافة معلومات السياق
            context_info = {
                'mood': current_mood.value,
                'mood_confidence': mood_confidence,
                'context_fit': context_fit,
                'adaptation_reason': self._generate_adaptation_reason(
                    current_mood, current_context, context_fit
                ),
                'original_score': base_score,
                'context_boost': adapted_score - base_score
            }
            
            contextual_recommendations.append((article_id, adapted_score, context_info))
        
        # ترتيب التوصيات المكيفة
        contextual_recommendations.sort(key=lambda x: x[1], reverse=True)
        
        # تطبيق تنويع إضافي بناءً على السياق
        diversified_recommendations = self._apply_contextual_diversification(
            contextual_recommendations, current_mood, current_context
        )
        
        # حفظ بيانات التكيف للتعلم
        self._record_adaptation(user_id, current_mood, current_context, 
                              diversified_recommendations)
        
        logger.info(f"✅ تم إنشاء {len(diversified_recommendations)} توصية سياقية")
        
        return diversified_recommendations
    
    def _calculate_adapted_score(self, base_score: float, context_fit: float, 
                               mood_confidence: float) -> float:
        """حساب النقاط المكيفة"""
        
        # الوزن الأساسي للتوصية
        base_weight = self.config.base_recommendation_weight
        
        # وزن التأثير السياقي (يعتمد على ثقة كشف المزاج)
        context_weight = self.config.context_influence_factor * mood_confidence
        
        # النقاط المكيفة
        adapted_score = (
            base_score * base_weight +
            context_fit * context_weight +
            base_score * context_fit * (1 - base_weight - context_weight)
        )
        
        return min(adapted_score, 1.0)
    
    def _generate_adaptation_reason(self, mood: MoodState, 
                                  context: ContextualFeatures,
                                  context_fit: float) -> str:
        """إنشاء سبب التكيف"""
        
        reasons = []
        
        # سبب المزاج
        if context_fit > 0.7:
            reasons.append(f"يناسب مزاجك {mood.value}")
        
        # سبب الوقت
        hour = context.hour_of_day * 24
        if 6 <= hour <= 11:
            reasons.append("مناسب للقراءة الصباحية")
        elif 18 <= hour <= 22:
            reasons.append("مثالي للقراءة المسائية")
        
        # سبب الجهاز
        if context.device_type == 'mobile' and context_fit > 0.6:
            reasons.append("محسن للهاتف المحمول")
        
        # سبب النشاط
        if context.current_activity == 'relaxing':
            reasons.append("مناسب للاسترخاء")
        elif context.current_activity == 'working':
            reasons.append("مفيد للعمل")
        
        return '; '.join(reasons) if reasons else "توصية عامة"
    
    def _apply_contextual_diversification(self, recommendations: List[Tuple[str, float, Dict]],
                                        mood: MoodState, 
                                        context: ContextualFeatures) -> List[Tuple[str, float, Dict]]:
        """تطبيق التنويع السياقي"""
        
        if len(recommendations) <= 3:
            return recommendations
        
        diversified = []
        used_categories = set()
        mood_matched_count = 0
        
        for article_id, score, context_info in recommendations:
            # تحديد ما إذا كان يجب إضافة هذه التوصية
            should_add = True
            
            # تنويع الفئات
            category = context_info.get('category', 'general')
            if category in used_categories and len(used_categories) >= 3:
                # تقليل أولوية الفئات المكررة
                score *= 0.8
            
            # توازن التوصيات المناسبة للمزاج
            if context_info.get('context_fit', 0) > 0.7:
                mood_matched_count += 1
                if mood_matched_count > len(recommendations) * 0.7:
                    # تقليل التوصيات المناسبة للمزاج إذا كانت مهيمنة
                    score *= 0.9
            
            if should_add:
                diversified.append((article_id, score, context_info))
                used_categories.add(category)
        
        # إعادة ترتيب بعد التنويع
        diversified.sort(key=lambda x: x[1], reverse=True)
        
        return diversified
    
    def _record_adaptation(self, user_id: str, mood: MoodState, 
                         context: ContextualFeatures,
                         recommendations: List[Tuple[str, float, Dict]]):
        """تسجيل بيانات التكيف للتعلم المستقبلي"""
        
        adaptation_record = {
            'user_id': user_id,
            'timestamp': datetime.now(),
            'mood': mood.value,
            'context': {
                'hour_of_day': context.hour_of_day,
                'day_of_week': context.day_of_week,
                'device_type': context.device_type,
                'activity': context.current_activity,
                'location_type': context.location_type
            },
            'recommendations_count': len(recommendations),
            'average_context_fit': np.mean([rec[2]['context_fit'] for rec in recommendations]),
            'mood_confidence': recommendations[0][2]['mood_confidence'] if recommendations else 0
        }
        
        self.adaptation_history.append(adaptation_record)
    
    def learn_from_feedback(self, user_id: str, article_id: str, 
                          feedback_type: str, feedback_value: float,
                          context_at_recommendation: Dict[str, Any]):
        """التعلم من التغذية الراجعة"""
        
        # العثور على سجل التكيف المقابل
        recent_adaptations = [
            record for record in self.adaptation_history
            if record['user_id'] == user_id and 
               (datetime.now() - record['timestamp']).total_seconds() < 3600  # آخر ساعة
        ]
        
        if not recent_adaptations:
            return
        
        # تحديث أوزان التكيف بناءً على النتائج
        adaptation_success = self._evaluate_adaptation_success(
            feedback_type, feedback_value
        )
        
        # تعديل معاملات التكيف
        if adaptation_success > 0.7:
            # تقوية التكيف الناجح
            self.config.mood_influence_factor = min(
                self.config.mood_influence_factor * 1.05, 0.8
            )
        elif adaptation_success < 0.3:
            # تقليل التكيف غير الناجح
            self.config.mood_influence_factor = max(
                self.config.mood_influence_factor * 0.95, 0.1
            )
        
        logger.info(f"📚 تم التعلم من التغذية الراجعة: {feedback_type} = {feedback_value}")
    
    def _evaluate_adaptation_success(self, feedback_type: str, feedback_value: float) -> float:
        """تقييم نجاح التكيف"""
        
        success_scores = {
            'view': 0.3,
            'like': 0.8,
            'save': 0.9,
            'share': 1.0,
            'comment': 0.9,
            'long_read': 0.7,  # قراءة طويلة
            'quick_exit': 0.1  # خروج سريع
        }
        
        base_success = success_scores.get(feedback_type, 0.5)
        
        # تعديل بناءً على قيمة التغذية الراجعة
        if feedback_value > 0:
            return min(base_success + feedback_value * 0.3, 1.0)
        else:
            return max(base_success + feedback_value * 0.3, 0.0)
    
    def get_adaptation_insights(self, user_id: str) -> Dict[str, Any]:
        """الحصول على رؤى التكيف"""
        
        user_adaptations = [
            record for record in self.adaptation_history
            if record['user_id'] == user_id
        ]
        
        if not user_adaptations:
            return {}
        
        # تحليل أنماط المزاج
        mood_distribution = defaultdict(int)
        context_patterns = defaultdict(list)
        
        for record in user_adaptations:
            mood_distribution[record['mood']] += 1
            context_patterns['hours'].append(record['context']['hour_of_day'])
            context_patterns['devices'].append(record['context']['device_type'])
        
        # أكثر المزاجات شيوعاً
        dominant_mood = max(mood_distribution, key=mood_distribution.get)
        
        # أنماط الاستخدام
        if context_patterns['hours']:
            peak_hour = max(set(context_patterns['hours']), 
                          key=context_patterns['hours'].count)
        else:
            peak_hour = 12
        
        preferred_device = max(set(context_patterns['devices']), 
                             key=context_patterns['devices'].count) if context_patterns['devices'] else 'mobile'
        
        return {
            'dominant_mood': dominant_mood,
            'mood_distribution': dict(mood_distribution),
            'peak_usage_hour': peak_hour,
            'preferred_device': preferred_device,
            'adaptation_frequency': len(user_adaptations),
            'average_context_fit': np.mean([r['average_context_fit'] for r in user_adaptations])
        }
    
    def save_model(self, filepath: str):
        """حفظ النموذج السياقي"""
        logger.info(f"💾 حفظ محرك التوصيات السياقي في {filepath}")
        
        save_data = {
            'config': self.config,
            'adaptation_history': list(self.adaptation_history),
            'mood_detector_state': {
                'mood_history': list(self.mood_detector.mood_history),
                'current_mood': self.mood_detector.current_mood.value,
                'mood_confidence': self.mood_detector.mood_confidence
            },
            'context_patterns': self.context_analyzer.context_patterns,
            'save_timestamp': datetime.now().isoformat()
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(save_data, f)
        
        logger.info("✅ تم حفظ محرك التوصيات السياقي")
    
    def load_model(self, filepath: str):
        """تحميل النموذج السياقي"""
        logger.info(f"📂 تحميل محرك التوصيات السياقي من {filepath}")
        
        try:
            with open(filepath, 'rb') as f:
                save_data = pickle.load(f)
            
            self.config = save_data['config']
            self.adaptation_history = deque(save_data['adaptation_history'], 
                                          maxlen=1000)
            
            # استعادة حالة كاشف المزاج
            mood_state = save_data['mood_detector_state']
            self.mood_detector.mood_history = deque(mood_state['mood_history'], 
                                                  maxlen=50)
            self.mood_detector.current_mood = MoodState(mood_state['current_mood'])
            self.mood_detector.mood_confidence = mood_state['mood_confidence']
            
            # استعادة أنماط السياق
            self.context_analyzer.context_patterns = save_data['context_patterns']
            
            logger.info("✅ تم تحميل محرك التوصيات السياقي")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل محرك التوصيات السياقي: {str(e)}")
            raise


# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد التكوين
    config = ContextualConfig(
        mood_detection_window=10,
        context_update_frequency=30,
        mood_influence_factor=0.4
    )
    
    # إنشاء محرك التوصيات السياقي
    contextual_engine = ContextualRecommendationEngine(config)
    
    # بيانات تجريبية
    user_data = {
        'user_id': 'user_123',
        'last_visit': '2024-01-15 10:00:00'
    }
    
    session_data = {
        'device_type': 'mobile',
        'location_type': 'home',
        'current_activity': 'relaxing',
        'session_length': 15.0,
        'connection_type': 'wifi'
    }
    
    recent_interactions = [
        {
            'article_id': 'article_1',
            'interaction_type': 'view',
            'reading_time': 120,
            'read_percentage': 80,
            'timestamp': '2024-01-15 14:30:00'
        },
        {
            'article_id': 'article_2',
            'interaction_type': 'like',
            'reading_time': 300,
            'read_percentage': 95,
            'timestamp': '2024-01-15 14:35:00'
        }
    ]
    
    base_recommendations = [
        ('article_3', 0.8),
        ('article_4', 0.7),
        ('article_5', 0.6)
    ]
    
    content_database = [
        {
            'id': 'article_3',
            'title': 'مقال ترفيهي خفيف',
            'category': 'ترفيه',
            'content_length': 400,
            'has_images': True,
            'estimated_reading_time': 3
        },
        {
            'id': 'article_4',
            'title': 'تحليل اقتصادي معمق',
            'category': 'اقتصاد',
            'content_length': 1200,
            'has_images': False,
            'estimated_reading_time': 8
        },
        {
            'id': 'article_5',
            'title': 'أخبار تقنية سريعة',
            'category': 'تقنية',
            'content_length': 600,
            'has_images': True,
            'estimated_reading_time': 4
        }
    ]
    
    # الحصول على توصيات سياقية
    contextual_recs = contextual_engine.get_contextual_recommendations(
        user_id='user_123',
        base_recommendations=base_recommendations,
        user_data=user_data,
        session_data=session_data,
        recent_interactions=recent_interactions,
        content_database=content_database
    )
    
    print("🎯 التوصيات السياقية:")
    for article_id, score, context_info in contextual_recs:
        print(f"  {article_id}: {score:.3f}")
        print(f"    المزاج: {context_info['mood']}")
        print(f"    السبب: {context_info['adaptation_reason']}")
        print(f"    التحسن: +{context_info['context_boost']:.3f}")
        print()
    
    # محاكاة التغذية الراجعة
    contextual_engine.learn_from_feedback(
        user_id='user_123',
        article_id='article_3',
        feedback_type='like',
        feedback_value=1.0,
        context_at_recommendation={}
    )
    
    # الحصول على رؤى التكيف
    insights = contextual_engine.get_adaptation_insights('user_123')
    print("📊 رؤى التكيف:", insights)
