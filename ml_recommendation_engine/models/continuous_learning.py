# نظام التعلم المستمر من التفاعلات - سبق الذكية
# Continuous Learning System from User Interactions

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, mean_squared_error
from sklearn.model_selection import train_test_split
import logging
from typing import Dict, List, Tuple, Optional, Any, Union, Callable
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
from abc import ABC, abstractmethod

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LearningStrategy(Enum):
    """استراتيجيات التعلم"""
    ONLINE = "online"           # تعلم مباشر من كل تفاعل
    BATCH = "batch"            # تعلم من مجموعات البيانات
    MINI_BATCH = "mini_batch"  # تعلم من مجموعات صغيرة
    FEDERATED = "federated"    # تعلم موزع
    ACTIVE = "active"          # تعلم نشط مع استعلامات
    REINFORCEMENT = "reinforcement"  # تعلم تعزيزي

class ConceptDriftType(Enum):
    """أنواع الانحراف المفاهيمي"""
    SUDDEN = "sudden"          # تغيير مفاجئ
    GRADUAL = "gradual"        # تغيير تدريجي
    INCREMENTAL = "incremental"  # تغيير متزايد
    RECURRING = "recurring"    # تغيير دوري
    VIRTUAL = "virtual"        # تغيير وهمي

@dataclass
class LearningConfig:
    """إعدادات نظام التعلم المستمر"""
    # Learning strategy
    strategy: LearningStrategy = LearningStrategy.MINI_BATCH
    learning_rate: float = 0.001
    batch_size: int = 32
    update_frequency: int = 100  # عدد التفاعلات قبل التحديث
    
    # Memory management
    memory_size: int = 10000
    forgetting_rate: float = 0.95
    importance_threshold: float = 0.1
    
    # Concept drift detection
    drift_detection_window: int = 1000
    drift_threshold: float = 0.05
    drift_adaptation_rate: float = 0.1
    
    # Performance monitoring
    performance_window: int = 500
    min_performance_threshold: float = 0.6
    performance_degradation_threshold: float = 0.1
    
    # Model management
    model_ensemble_size: int = 5
    model_retirement_threshold: float = 0.3
    new_model_promotion_threshold: float = 0.8
    
    # Online learning
    online_learning_enabled: bool = True
    regularization_strength: float = 0.01
    momentum: float = 0.9
    
    # Active learning
    uncertainty_threshold: float = 0.7
    query_budget: int = 100
    acquisition_function: str = "uncertainty"  # uncertainty, diversity, expected_improvement

@dataclass
class InteractionRecord:
    """سجل التفاعل"""
    user_id: str
    item_id: str
    interaction_type: str
    rating: float
    context: Dict[str, Any]
    features: Optional[np.ndarray] = None
    prediction: Optional[float] = None
    timestamp: datetime = field(default_factory=datetime.now)
    importance_weight: float = 1.0
    is_labeled: bool = True


class ExperienceReplay:
    """
    ذاكرة إعادة التشغيل للتعلم المستمر
    Experience Replay Memory for Continuous Learning
    """
    
    def __init__(self, config: LearningConfig):
        self.config = config
        self.memory = deque(maxlen=config.memory_size)
        self.importance_weights = deque(maxlen=config.memory_size)
        self.temporal_weights = deque(maxlen=config.memory_size)
        
    def store_interaction(self, interaction: InteractionRecord):
        """حفظ تفاعل في الذاكرة"""
        # حساب أهمية التفاعل
        importance = self._calculate_importance(interaction)
        temporal_weight = 1.0  # وزن زمني كامل للتفاعلات الجديدة
        
        self.memory.append(interaction)
        self.importance_weights.append(importance)
        self.temporal_weights.append(temporal_weight)
        
        # تطبيق تراجع زمني للتفاعلات القديمة
        self._apply_temporal_decay()
    
    def _calculate_importance(self, interaction: InteractionRecord) -> float:
        """حساب أهمية التفاعل"""
        importance = 1.0
        
        # أهمية نوع التفاعل
        interaction_weights = {
            'view': 0.5,
            'like': 1.0,
            'save': 1.2,
            'share': 1.5,
            'comment': 1.3,
            'dislike': 0.8,
            'skip': 0.3
        }
        
        importance *= interaction_weights.get(interaction.interaction_type, 1.0)
        
        # أهمية التقييم
        if interaction.rating > 0:
            importance *= (1 + interaction.rating / 5.0)
        
        # أهمية السياق
        if interaction.context:
            # تفاعلات في سياقات نادرة أكثر أهمية
            context_rarity = len(interaction.context) / 10.0  # تطبيع
            importance *= (1 + context_rarity)
        
        return min(importance, 3.0)  # حد أقصى للأهمية
    
    def _apply_temporal_decay(self):
        """تطبيق تراجع زمني"""
        for i in range(len(self.temporal_weights)):
            self.temporal_weights[i] *= self.config.forgetting_rate
    
    def sample_batch(self, batch_size: int, strategy: str = "importance") -> List[InteractionRecord]:
        """سحب عينة من الذاكرة للتدريب"""
        if len(self.memory) < batch_size:
            return list(self.memory)
        
        if strategy == "importance":
            # العينة بناءً على الأهمية
            weights = np.array(self.importance_weights) * np.array(self.temporal_weights)
            weights = weights / weights.sum()  # تطبيع
            
            indices = np.random.choice(
                len(self.memory), 
                size=batch_size, 
                replace=False, 
                p=weights
            )
            
        elif strategy == "recent":
            # أحدث التفاعلات
            indices = list(range(max(0, len(self.memory) - batch_size), len(self.memory)))
            
        elif strategy == "diverse":
            # عينة متنوعة
            indices = self._diverse_sampling(batch_size)
            
        else:  # random
            indices = random.sample(range(len(self.memory)), batch_size)
        
        return [self.memory[i] for i in indices]
    
    def _diverse_sampling(self, batch_size: int) -> List[int]:
        """عينة متنوعة من التفاعلات"""
        # تنفيذ مبسط للتنويع
        # يمكن تطويره ليشمل تنويع حسب المستخدم، النوع، السياق
        
        user_interactions = defaultdict(list)
        for i, interaction in enumerate(self.memory):
            user_interactions[interaction.user_id].append(i)
        
        selected_indices = []
        
        # اختيار تفاعل واحد من كل مستخدم أولاً
        for user_id, indices in user_interactions.items():
            if len(selected_indices) < batch_size:
                selected_indices.append(random.choice(indices))
        
        # ملء الباقي عشوائياً
        remaining = batch_size - len(selected_indices)
        if remaining > 0:
            all_indices = set(range(len(self.memory)))
            available_indices = list(all_indices - set(selected_indices))
            if available_indices:
                selected_indices.extend(
                    random.sample(available_indices, min(remaining, len(available_indices)))
                )
        
        return selected_indices[:batch_size]
    
    def get_memory_stats(self) -> Dict[str, Any]:
        """إحصائيات الذاكرة"""
        if not self.memory:
            return {}
        
        interaction_types = defaultdict(int)
        user_counts = defaultdict(int)
        
        for interaction in self.memory:
            interaction_types[interaction.interaction_type] += 1
            user_counts[interaction.user_id] += 1
        
        return {
            'total_interactions': len(self.memory),
            'unique_users': len(user_counts),
            'interaction_distribution': dict(interaction_types),
            'average_importance': np.mean(self.importance_weights),
            'average_temporal_weight': np.mean(self.temporal_weights),
            'memory_utilization': len(self.memory) / self.config.memory_size
        }


class ConceptDriftDetector:
    """
    كاشف الانحراف المفاهيمي
    Concept Drift Detector
    """
    
    def __init__(self, config: LearningConfig):
        self.config = config
        self.performance_history = deque(maxlen=config.drift_detection_window)
        self.prediction_history = deque(maxlen=config.drift_detection_window)
        self.feature_statistics = defaultdict(lambda: deque(maxlen=config.drift_detection_window))
        self.drift_alerts = []
        
    def update_performance(self, accuracy: float, predictions: List[float], 
                         features: Optional[np.ndarray] = None):
        """تحديث أداء النموذج"""
        self.performance_history.append({
            'accuracy': accuracy,
            'timestamp': datetime.now()
        })
        
        self.prediction_history.extend(predictions)
        
        # تحديث إحصائيات المعالم
        if features is not None:
            for i, feature_values in enumerate(features.T):
                self.feature_statistics[f'feature_{i}'].extend(feature_values)
    
    def detect_drift(self) -> Tuple[bool, ConceptDriftType, float]:
        """كشف الانحراف المفاهيمي"""
        if len(self.performance_history) < 50:
            return False, ConceptDriftType.VIRTUAL, 0.0
        
        # كشف انحراف الأداء
        performance_drift = self._detect_performance_drift()
        
        # كشف انحراف البيانات
        data_drift = self._detect_data_drift()
        
        # كشف انحراف التنبؤات
        prediction_drift = self._detect_prediction_drift()
        
        # تحديد نوع الانحراف وشدته
        total_drift = max(performance_drift, data_drift, prediction_drift)
        
        if total_drift > self.config.drift_threshold:
            drift_type = self._classify_drift_type()
            
            # تسجيل تنبيه الانحراف
            self.drift_alerts.append({
                'timestamp': datetime.now(),
                'drift_type': drift_type,
                'severity': total_drift,
                'components': {
                    'performance': performance_drift,
                    'data': data_drift,
                    'prediction': prediction_drift
                }
            })
            
            logger.warning(f"⚠️ تم كشف انحراف مفاهيمي: {drift_type.value} (شدة: {total_drift:.3f})")
            
            return True, drift_type, total_drift
        
        return False, ConceptDriftType.VIRTUAL, total_drift
    
    def _detect_performance_drift(self) -> float:
        """كشف انحراف الأداء"""
        if len(self.performance_history) < 20:
            return 0.0
        
        recent_performance = [p['accuracy'] for p in list(self.performance_history)[-10:]]
        older_performance = [p['accuracy'] for p in list(self.performance_history)[-20:-10]]
        
        recent_avg = np.mean(recent_performance)
        older_avg = np.mean(older_performance)
        
        performance_drop = older_avg - recent_avg
        return max(0, performance_drop)
    
    def _detect_data_drift(self) -> float:
        """كشف انحراف البيانات"""
        if not self.feature_statistics:
            return 0.0
        
        drift_scores = []
        
        for feature_name, feature_values in self.feature_statistics.items():
            if len(feature_values) < 100:
                continue
            
            # مقارنة التوزيعات الحديثة مع القديمة
            recent_values = list(feature_values)[-50:]
            older_values = list(feature_values)[-100:-50]
            
            # اختبار Kolmogorov-Smirnov المبسط
            drift_score = self._ks_test_approximation(recent_values, older_values)
            drift_scores.append(drift_score)
        
        return np.mean(drift_scores) if drift_scores else 0.0
    
    def _detect_prediction_drift(self) -> float:
        """كشف انحراف التنبؤات"""
        if len(self.prediction_history) < 100:
            return 0.0
        
        predictions = list(self.prediction_history)
        recent_predictions = predictions[-50:]
        older_predictions = predictions[-100:-50]
        
        # مقارنة توزيع التنبؤات
        recent_mean = np.mean(recent_predictions)
        older_mean = np.mean(older_predictions)
        
        recent_std = np.std(recent_predictions)
        older_std = np.std(older_predictions)
        
        # حساب الاختلاف في المتوسط والانحراف المعياري
        mean_drift = abs(recent_mean - older_mean)
        std_drift = abs(recent_std - older_std)
        
        return (mean_drift + std_drift) / 2
    
    def _ks_test_approximation(self, sample1: List[float], sample2: List[float]) -> float:
        """تقريب اختبار Kolmogorov-Smirnov"""
        if not sample1 or not sample2:
            return 0.0
        
        # تقريب مبسط لحساب اختلاف التوزيعات
        mean_diff = abs(np.mean(sample1) - np.mean(sample2))
        std_diff = abs(np.std(sample1) - np.std(sample2))
        
        # تطبيع بناءً على القيم
        mean_norm = mean_diff / (abs(np.mean(sample1)) + abs(np.mean(sample2)) + 1e-6)
        std_norm = std_diff / (np.std(sample1) + np.std(sample2) + 1e-6)
        
        return (mean_norm + std_norm) / 2
    
    def _classify_drift_type(self) -> ConceptDriftType:
        """تصنيف نوع الانحراف"""
        if len(self.drift_alerts) < 2:
            return ConceptDriftType.SUDDEN
        
        # تحليل أنماط الانحراف
        recent_alerts = self.drift_alerts[-5:]
        time_gaps = []
        
        for i in range(1, len(recent_alerts)):
            gap = (recent_alerts[i]['timestamp'] - recent_alerts[i-1]['timestamp']).total_seconds()
            time_gaps.append(gap)
        
        if not time_gaps:
            return ConceptDriftType.SUDDEN
        
        avg_gap = np.mean(time_gaps)
        gap_variance = np.var(time_gaps)
        
        # تصنيف بناءً على الأنماط الزمنية
        if avg_gap < 3600:  # أقل من ساعة
            return ConceptDriftType.SUDDEN
        elif gap_variance < avg_gap * 0.1:  # انتظام عالي
            return ConceptDriftType.RECURRING
        elif avg_gap > 86400:  # أكثر من يوم
            return ConceptDriftType.GRADUAL
        else:
            return ConceptDriftType.INCREMENTAL
    
    def get_drift_summary(self) -> Dict[str, Any]:
        """ملخص حالة الانحراف"""
        return {
            'total_alerts': len(self.drift_alerts),
            'recent_alerts': len([a for a in self.drift_alerts 
                                if (datetime.now() - a['timestamp']).days <= 7]),
            'drift_types_distribution': self._get_drift_type_distribution(),
            'average_severity': np.mean([a['severity'] for a in self.drift_alerts]) if self.drift_alerts else 0,
            'last_drift': self.drift_alerts[-1] if self.drift_alerts else None
        }
    
    def _get_drift_type_distribution(self) -> Dict[str, int]:
        """توزيع أنواع الانحراف"""
        distribution = defaultdict(int)
        for alert in self.drift_alerts:
            distribution[alert['drift_type'].value] += 1
        return dict(distribution)


class OnlineLearner:
    """
    متعلم مباشر للنماذج
    Online Learner for Models
    """
    
    def __init__(self, model: nn.Module, config: LearningConfig):
        self.model = model
        self.config = config
        self.optimizer = optim.Adam(model.parameters(), lr=config.learning_rate)
        self.criterion = nn.MSELoss()
        
        # إحصائيات التعلم
        self.update_count = 0
        self.cumulative_loss = 0.0
        self.learning_history = deque(maxlen=1000)
        
    def update_model(self, batch_interactions: List[InteractionRecord]) -> Dict[str, float]:
        """تحديث النموذج بناءً على تفاعلات جديدة"""
        if not batch_interactions:
            return {}
        
        # تحضير البيانات
        features, targets, weights = self._prepare_batch_data(batch_interactions)
        
        if len(features) == 0:
            return {}
        
        # تحويل إلى tensors
        X = torch.FloatTensor(features)
        y = torch.FloatTensor(targets)
        w = torch.FloatTensor(weights)
        
        # التدريب
        self.model.train()
        self.optimizer.zero_grad()
        
        predictions = self.model(X).squeeze()
        loss = self._weighted_loss(predictions, y, w)
        
        loss.backward()
        self.optimizer.step()
        
        # تحديث الإحصائيات
        self.update_count += 1
        self.cumulative_loss += loss.item()
        
        # حساب المقاييس
        with torch.no_grad():
            mse = nn.MSELoss()(predictions, y).item()
            mae = torch.mean(torch.abs(predictions - y)).item()
        
        # حفظ سجل التعلم
        learning_record = {
            'timestamp': datetime.now(),
            'loss': loss.item(),
            'mse': mse,
            'mae': mae,
            'batch_size': len(batch_interactions),
            'learning_rate': self.optimizer.param_groups[0]['lr']
        }
        
        self.learning_history.append(learning_record)
        
        logger.info(f"📚 تحديث النموذج - Loss: {loss.item():.4f}, MAE: {mae:.4f}")
        
        return {
            'loss': loss.item(),
            'mse': mse,
            'mae': mae,
            'updates_count': self.update_count
        }
    
    def _prepare_batch_data(self, interactions: List[InteractionRecord]) -> Tuple[List, List, List]:
        """تحضير بيانات الدفعة للتدريب"""
        features = []
        targets = []
        weights = []
        
        for interaction in interactions:
            if interaction.features is not None and interaction.is_labeled:
                features.append(interaction.features)
                targets.append(interaction.rating)
                weights.append(interaction.importance_weight)
        
        return features, targets, weights
    
    def _weighted_loss(self, predictions: torch.Tensor, 
                      targets: torch.Tensor, 
                      weights: torch.Tensor) -> torch.Tensor:
        """حساب الخسارة المرجحة"""
        mse_loss = (predictions - targets) ** 2
        weighted_loss = torch.mean(mse_loss * weights)
        
        # إضافة تنظيم
        l2_reg = sum(p.pow(2.0).sum() for p in self.model.parameters())
        total_loss = weighted_loss + self.config.regularization_strength * l2_reg
        
        return total_loss
    
    def adapt_learning_rate(self, performance_trend: float):
        """تكييف معدل التعلم بناءً على الأداء"""
        current_lr = self.optimizer.param_groups[0]['lr']
        
        if performance_trend > 0.05:  # تحسن في الأداء
            new_lr = min(current_lr * 1.1, 0.01)
        elif performance_trend < -0.05:  # تراجع في الأداء
            new_lr = max(current_lr * 0.9, 1e-5)
        else:
            new_lr = current_lr
        
        for param_group in self.optimizer.param_groups:
            param_group['lr'] = new_lr
        
        if new_lr != current_lr:
            logger.info(f"🎯 تعديل معدل التعلم: {current_lr:.6f} → {new_lr:.6f}")
    
    def get_learning_statistics(self) -> Dict[str, Any]:
        """إحصائيات التعلم"""
        if not self.learning_history:
            return {}
        
        recent_history = list(self.learning_history)[-100:]
        
        return {
            'total_updates': self.update_count,
            'average_loss': self.cumulative_loss / max(self.update_count, 1),
            'recent_average_loss': np.mean([h['loss'] for h in recent_history]),
            'recent_average_mae': np.mean([h['mae'] for h in recent_history]),
            'current_learning_rate': self.optimizer.param_groups[0]['lr'],
            'learning_trend': self._calculate_learning_trend()
        }
    
    def _calculate_learning_trend(self) -> float:
        """حساب اتجاه التعلم"""
        if len(self.learning_history) < 10:
            return 0.0
        
        recent_losses = [h['loss'] for h in list(self.learning_history)[-10:]]
        older_losses = [h['loss'] for h in list(self.learning_history)[-20:-10]]
        
        if not older_losses:
            return 0.0
        
        recent_avg = np.mean(recent_losses)
        older_avg = np.mean(older_losses)
        
        # اتجاه إيجابي يعني تحسن (خسارة أقل)
        return older_avg - recent_avg


class ActiveLearner:
    """
    متعلم نشط للاستعلام عن البيانات المهمة
    Active Learner for Querying Important Data
    """
    
    def __init__(self, config: LearningConfig):
        self.config = config
        self.query_budget = config.query_budget
        self.queries_made = 0
        self.uncertain_samples = deque(maxlen=1000)
        
    def should_query(self, interaction: InteractionRecord) -> bool:
        """تحديد ما إذا كان يجب الاستعلام عن هذا التفاعل"""
        if self.queries_made >= self.query_budget:
            return False
        
        if interaction.prediction is None:
            return False
        
        # حساب عدم اليقين
        uncertainty = self._calculate_uncertainty(interaction)
        
        if uncertainty > self.config.uncertainty_threshold:
            self.uncertain_samples.append({
                'interaction': interaction,
                'uncertainty': uncertainty,
                'timestamp': datetime.now()
            })
            
            # استراتيجية الاستعلام
            if self.config.acquisition_function == "uncertainty":
                return True
            elif self.config.acquisition_function == "diversity":
                return self._is_diverse_sample(interaction)
            elif self.config.acquisition_function == "expected_improvement":
                return self._has_expected_improvement(interaction)
        
        return False
    
    def _calculate_uncertainty(self, interaction: InteractionRecord) -> float:
        """حساب عدم اليقين في التنبؤ"""
        if interaction.prediction is None:
            return 0.0
        
        # عدم اليقين بناءً على مسافة التنبؤ من النقاط المرجعية
        # (تنفيذ مبسط - يمكن تطويره)
        
        prediction = interaction.prediction
        
        # عدم اليقين أكبر كلما اقترب التنبؤ من 0.5 (في التصنيف الثنائي)
        # أو كلما كان التنبؤ في منطقة غير مؤكدة
        
        if 0 <= prediction <= 1:  # تطبيع للاحتمالات
            uncertainty = 1 - abs(prediction - 0.5) * 2
        else:  # للقيم غير المطبعة
            uncertainty = 1 / (1 + abs(prediction))
        
        return uncertainty
    
    def _is_diverse_sample(self, interaction: InteractionRecord) -> bool:
        """تحديد ما إذا كانت العينة متنوعة"""
        if not self.uncertain_samples:
            return True
        
        # مقارنة مع العينات المحفوظة للتنوع
        current_features = interaction.features
        if current_features is None:
            return False
        
        # حساب التشابه مع العينات الموجودة
        similarities = []
        for sample in list(self.uncertain_samples)[-10:]:  # آخر 10 عينات
            other_features = sample['interaction'].features
            if other_features is not None:
                similarity = np.dot(current_features, other_features) / (
                    np.linalg.norm(current_features) * np.linalg.norm(other_features) + 1e-6
                )
                similarities.append(similarity)
        
        # إذا كان التشابه منخفض مع العينات الموجودة، فهي متنوعة
        avg_similarity = np.mean(similarities) if similarities else 0
        return avg_similarity < 0.7
    
    def _has_expected_improvement(self, interaction: InteractionRecord) -> bool:
        """تحديد ما إذا كانت العينة تعد بتحسن متوقع"""
        # تنفيذ مبسط للتحسن المتوقع
        uncertainty = self._calculate_uncertainty(interaction)
        
        # العينات عالية عدم اليقين من مستخدمين نشطين أكثر قيمة
        user_activity = interaction.context.get('user_activity_level', 0.5)
        
        expected_improvement = uncertainty * user_activity
        return expected_improvement > 0.6
    
    def make_query(self, interaction: InteractionRecord) -> bool:
        """تنفيذ الاستعلام"""
        if self.queries_made >= self.query_budget:
            return False
        
        # في التطبيق الحقيقي، هذا سيرسل طلب للحصول على تسمية
        # للبساطة، سنفترض أن الاستعلام نجح
        
        self.queries_made += 1
        logger.info(f"❓ استعلام نشط #{self.queries_made}: {interaction.user_id} -> {interaction.item_id}")
        
        return True
    
    def get_query_statistics(self) -> Dict[str, Any]:
        """إحصائيات الاستعلام النشط"""
        return {
            'total_queries': self.queries_made,
            'remaining_budget': self.query_budget - self.queries_made,
            'uncertain_samples_count': len(self.uncertain_samples),
            'average_uncertainty': np.mean([s['uncertainty'] for s in self.uncertain_samples]) if self.uncertain_samples else 0,
            'query_rate': self.queries_made / max(1, len(self.uncertain_samples))
        }


class ContinuousLearningEngine:
    """
    محرك التعلم المستمر الرئيسي
    Main Continuous Learning Engine
    """
    
    def __init__(self, base_model: nn.Module, config: LearningConfig):
        self.config = config
        self.base_model = base_model
        
        # مكونات النظام
        self.experience_replay = ExperienceReplay(config)
        self.drift_detector = ConceptDriftDetector(config)
        self.online_learner = OnlineLearner(base_model, config)
        self.active_learner = ActiveLearner(config)
        
        # إدارة النماذج
        self.model_ensemble = [base_model]
        self.model_performances = [0.8]  # أداء افتراضي
        
        # إحصائيات التعلم
        self.total_interactions = 0
        self.learning_sessions = 0
        self.last_update_time = datetime.now()
        
        # خيط التعلم المستمر
        self.learning_thread = None
        self.is_learning_active = False
        
    def process_interaction(self, user_id: str, item_id: str, 
                          interaction_type: str, rating: float,
                          context: Dict[str, Any], 
                          features: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """معالجة تفاعل جديد"""
        
        # إنشاء سجل التفاعل
        interaction = InteractionRecord(
            user_id=user_id,
            item_id=item_id,
            interaction_type=interaction_type,
            rating=rating,
            context=context,
            features=features
        )
        
        # التنبؤ بالتفاعل قبل التعلم
        if features is not None:
            with torch.no_grad():
                self.base_model.eval()
                feature_tensor = torch.FloatTensor(features).unsqueeze(0)
                prediction = self.base_model(feature_tensor).item()
                interaction.prediction = prediction
        
        # حفظ في ذاكرة الخبرة
        self.experience_replay.store_interaction(interaction)
        
        # التعلم النشط
        query_made = False
        if self.config.strategy == LearningStrategy.ACTIVE:
            if self.active_learner.should_query(interaction):
                query_made = self.active_learner.make_query(interaction)
        
        # تحديث العداد
        self.total_interactions += 1
        
        # تحديث النموذج إذا حان الوقت
        update_triggered = False
        if self._should_update_model():
            update_triggered = self._trigger_model_update()
        
        return {
            'interaction_processed': True,
            'prediction': interaction.prediction,
            'query_made': query_made,
            'update_triggered': update_triggered,
            'total_interactions': self.total_interactions
        }
    
    def _should_update_model(self) -> bool:
        """تحديد ما إذا كان يجب تحديث النموذج"""
        # تحديث بناءً على عدد التفاعلات
        if self.total_interactions % self.config.update_frequency == 0:
            return True
        
        # تحديث بناءً على الوقت
        time_since_update = (datetime.now() - self.last_update_time).total_seconds()
        if time_since_update > 3600:  # كل ساعة
            return True
        
        # تحديث بناءً على كشف الانحراف
        if len(self.experience_replay.memory) >= 100:
            recent_interactions = list(self.experience_replay.memory)[-50:]
            if self._detect_urgent_update_needed(recent_interactions):
                return True
        
        return False
    
    def _detect_urgent_update_needed(self, recent_interactions: List[InteractionRecord]) -> bool:
        """كشف الحاجة العاجلة للتحديث"""
        # تحليل مبسط للحاجة العاجلة
        prediction_errors = []
        
        for interaction in recent_interactions:
            if interaction.prediction is not None:
                error = abs(interaction.prediction - interaction.rating)
                prediction_errors.append(error)
        
        if prediction_errors:
            avg_error = np.mean(prediction_errors)
            return avg_error > 1.0  # خطأ عالي
        
        return False
    
    def _trigger_model_update(self) -> bool:
        """تشغيل تحديث النموذج"""
        try:
            # استخراج عينة للتدريب
            if self.config.strategy == LearningStrategy.MINI_BATCH:
                batch = self.experience_replay.sample_batch(
                    self.config.batch_size, "importance"
                )
            elif self.config.strategy == LearningStrategy.ONLINE:
                batch = self.experience_replay.sample_batch(1, "recent")
            else:
                batch = self.experience_replay.sample_batch(
                    self.config.batch_size, "diverse"
                )
            
            if not batch:
                return False
            
            # تحديث النموذج
            update_results = self.online_learner.update_model(batch)
            
            # كشف الانحراف المفاهيمي
            if 'mse' in update_results:
                accuracy = 1 / (1 + update_results['mse'])  # تقريب للدقة
                predictions = [interaction.prediction for interaction in batch 
                             if interaction.prediction is not None]
                
                features_array = np.array([interaction.features for interaction in batch 
                                         if interaction.features is not None])
                
                self.drift_detector.update_performance(
                    accuracy, predictions, features_array if len(features_array) > 0 else None
                )
                
                # كشف الانحراف
                drift_detected, drift_type, severity = self.drift_detector.detect_drift()
                
                if drift_detected:
                    self._handle_concept_drift(drift_type, severity)
            
            # تحديث وقت آخر تحديث
            self.last_update_time = datetime.now()
            self.learning_sessions += 1
            
            logger.info(f"🎓 جلسة تعلم #{self.learning_sessions} - معدل التفاعلات: {self.total_interactions}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ خطأ في تحديث النموذج: {str(e)}")
            return False
    
    def _handle_concept_drift(self, drift_type: ConceptDriftType, severity: float):
        """التعامل مع الانحراف المفاهيمي"""
        logger.warning(f"🔄 التعامل مع انحراف مفاهيمي: {drift_type.value} (شدة: {severity:.3f})")
        
        if drift_type == ConceptDriftType.SUDDEN and severity > 0.2:
            # انحراف مفاجئ قوي - إعادة تدريب سريع
            self._rapid_retraining()
            
        elif drift_type == ConceptDriftType.GRADUAL:
            # انحراف تدريجي - زيادة معدل التعلم
            current_lr = self.online_learner.optimizer.param_groups[0]['lr']
            new_lr = min(current_lr * 1.5, 0.01)
            
            for param_group in self.online_learner.optimizer.param_groups:
                param_group['lr'] = new_lr
                
        elif drift_type == ConceptDriftType.RECURRING:
            # انحراف متكرر - قد يكون موسمي
            self._adapt_to_recurring_pattern()
        
        # تقليل أهمية البيانات القديمة
        self._decay_old_experiences(severity)
    
    def _rapid_retraining(self):
        """إعادة تدريب سريع للنموذج"""
        logger.info("⚡ بدء إعادة التدريب السريع...")
        
        # جلب عينة كبيرة من الذاكرة
        large_batch = self.experience_replay.sample_batch(
            min(500, len(self.experience_replay.memory)), "recent"
        )
        
        if large_batch:
            # تدريب مكثف
            for _ in range(10):
                self.online_learner.update_model(large_batch)
    
    def _adapt_to_recurring_pattern(self):
        """التكيف مع الأنماط المتكررة"""
        # تنفيذ مبسط - يمكن تطويره لتحليل الأنماط الموسمية
        logger.info("🔄 التكيف مع النمط المتكرر...")
        
        # زيادة وزن التفاعلات الحديثة المشابهة للنمط
        for interaction in list(self.experience_replay.memory)[-100:]:
            interaction.importance_weight *= 1.2
    
    def _decay_old_experiences(self, decay_factor: float):
        """تقليل أهمية التجارب القديمة"""
        for i in range(len(self.experience_replay.importance_weights)):
            self.experience_replay.importance_weights[i] *= (1 - decay_factor * 0.1)
    
    def evaluate_model_performance(self, test_interactions: List[InteractionRecord]) -> Dict[str, float]:
        """تقييم أداء النموذج"""
        if not test_interactions:
            return {}
        
        predictions = []
        actuals = []
        
        self.base_model.eval()
        with torch.no_grad():
            for interaction in test_interactions:
                if interaction.features is not None:
                    feature_tensor = torch.FloatTensor(interaction.features).unsqueeze(0)
                    prediction = self.base_model(feature_tensor).item()
                    
                    predictions.append(prediction)
                    actuals.append(interaction.rating)
        
        if not predictions:
            return {}
        
        # حساب المقاييس
        mse = mean_squared_error(actuals, predictions)
        mae = np.mean(np.abs(np.array(predictions) - np.array(actuals)))
        
        # دقة التصنيف (إذا كانت مسألة تصنيف)
        binary_predictions = [1 if p > 0.5 else 0 for p in predictions]
        binary_actuals = [1 if a > 0.5 else 0 for a in actuals]
        accuracy = accuracy_score(binary_actuals, binary_predictions)
        
        return {
            'mse': mse,
            'mae': mae,
            'rmse': np.sqrt(mse),
            'accuracy': accuracy
        }
    
    def get_learning_insights(self) -> Dict[str, Any]:
        """رؤى حول عملية التعلم"""
        memory_stats = self.experience_replay.get_memory_stats()
        learning_stats = self.online_learner.get_learning_statistics()
        drift_summary = self.drift_detector.get_drift_summary()
        query_stats = self.active_learner.get_query_statistics()
        
        return {
            'system_overview': {
                'total_interactions': self.total_interactions,
                'learning_sessions': self.learning_sessions,
                'learning_strategy': self.config.strategy.value,
                'last_update': self.last_update_time.isoformat()
            },
            'memory_management': memory_stats,
            'learning_progress': learning_stats,
            'concept_drift': drift_summary,
            'active_learning': query_stats,
            'model_ensemble': {
                'ensemble_size': len(self.model_ensemble),
                'average_performance': np.mean(self.model_performances)
            }
        }
    
    def save_learning_state(self, filepath: str):
        """حفظ حالة التعلم"""
        logger.info(f"💾 حفظ حالة التعلم المستمر في {filepath}")
        
        # حفظ حالة النموذج
        torch.save(self.base_model.state_dict(), f"{filepath}_model.pth")
        
        # حفظ بيانات النظام
        system_state = {
            'config': self.config,
            'total_interactions': self.total_interactions,
            'learning_sessions': self.learning_sessions,
            'model_performances': self.model_performances,
            'memory': list(self.experience_replay.memory),
            'importance_weights': list(self.experience_replay.importance_weights),
            'drift_alerts': self.drift_detector.drift_alerts,
            'learning_history': list(self.online_learner.learning_history),
            'save_timestamp': datetime.now().isoformat()
        }
        
        with open(f"{filepath}_state.pkl", 'wb') as f:
            pickle.dump(system_state, f)
        
        logger.info("✅ تم حفظ حالة التعلم المستمر")
    
    def load_learning_state(self, filepath: str):
        """تحميل حالة التعلم"""
        logger.info(f"📂 تحميل حالة التعلم المستمر من {filepath}")
        
        try:
            # تحميل حالة النموذج
            self.base_model.load_state_dict(torch.load(f"{filepath}_model.pth"))
            
            # تحميل بيانات النظام
            with open(f"{filepath}_state.pkl", 'rb') as f:
                system_state = pickle.load(f)
            
            self.config = system_state['config']
            self.total_interactions = system_state['total_interactions']
            self.learning_sessions = system_state['learning_sessions']
            self.model_performances = system_state['model_performances']
            
            # استعادة الذاكرة
            self.experience_replay.memory = deque(
                system_state['memory'], 
                maxlen=self.config.memory_size
            )
            self.experience_replay.importance_weights = deque(
                system_state['importance_weights'], 
                maxlen=self.config.memory_size
            )
            
            # استعادة تاريخ الانحراف
            self.drift_detector.drift_alerts = system_state['drift_alerts']
            
            # استعادة تاريخ التعلم
            self.online_learner.learning_history = deque(
                system_state['learning_history'], 
                maxlen=1000
            )
            
            logger.info("✅ تم تحميل حالة التعلم المستمر")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل حالة التعلم: {str(e)}")
            raise


# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد نموذج بسيط للاختبار
    class SimpleRecommendationModel(nn.Module):
        def __init__(self, input_size: int = 10):
            super().__init__()
            self.layers = nn.Sequential(
                nn.Linear(input_size, 64),
                nn.ReLU(),
                nn.Linear(64, 32),
                nn.ReLU(),
                nn.Linear(32, 1),
                nn.Sigmoid()
            )
        
        def forward(self, x):
            return self.layers(x)
    
    # إعداد التكوين
    config = LearningConfig(
        strategy=LearningStrategy.MINI_BATCH,
        update_frequency=50,
        learning_rate=0.001
    )
    
    # إنشاء النموذج ومحرك التعلم
    model = SimpleRecommendationModel()
    learning_engine = ContinuousLearningEngine(model, config)
    
    # محاكاة التفاعلات
    for i in range(200):
        user_id = f"user_{i % 20}"
        item_id = f"item_{i % 50}"
        interaction_type = random.choice(['view', 'like', 'save', 'share'])
        rating = random.uniform(0, 1)
        context = {
            'device': random.choice(['mobile', 'desktop']),
            'time_of_day': random.randint(0, 23)
        }
        features = np.random.random(10)
        
        result = learning_engine.process_interaction(
            user_id=user_id,
            item_id=item_id,
            interaction_type=interaction_type,
            rating=rating,
            context=context,
            features=features
        )
        
        if i % 50 == 0:
            print(f"تفاعل {i}: {result}")
    
    # الحصول على رؤى التعلم
    insights = learning_engine.get_learning_insights()
    print("\n📊 رؤى التعلم المستمر:")
    print(f"إجمالي التفاعلات: {insights['system_overview']['total_interactions']}")
    print(f"جلسات التعلم: {insights['system_overview']['learning_sessions']}")
    print(f"استخدام الذاكرة: {insights['memory_management']['memory_utilization']:.2%}")
    print(f"متوسط الخسارة: {insights['learning_progress'].get('recent_average_loss', 'N/A')}")
    
    # حفظ حالة التعلم
    learning_engine.save_learning_state("continuous_learning_checkpoint")
