# نماذج BERT العربية لتحليل المشاعر
# Arabic BERT Models for Sentiment Analysis

import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import (
    AutoTokenizer, AutoModel, AutoConfig,
    BertTokenizer, BertModel, BertConfig,
    TrainingArguments, Trainer, EarlyStoppingCallback
)
from transformers.modeling_outputs import SequenceClassifierOutput
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from typing import Dict, List, Tuple, Optional, Any, Union
import logging
from dataclasses import dataclass
import json
import os
from datetime import datetime
import pickle

from ..config.settings import settings
from ..utils.arabic_text_processor import ArabicTextProcessor, TextProcessingConfig

logger = logging.getLogger(__name__)

@dataclass
class SentimentModelConfig:
    """إعدادات نموذج تحليل المشاعر"""
    model_name: str = "aubmindlab/bert-base-arabert"
    num_labels: int = 3  # positive, negative, neutral
    max_length: int = 512
    dropout_rate: float = 0.3
    hidden_size: int = 768
    learning_rate: float = 2e-5
    batch_size: int = 16
    epochs: int = 5
    warmup_steps: int = 500
    weight_decay: float = 0.01
    fp16: bool = True  # استخدام precision مختلط
    gradient_accumulation_steps: int = 2

class ArabicBertSentimentClassifier(nn.Module):
    """نموذج BERT العربي لتصنيف المشاعر"""
    
    def __init__(self, config: SentimentModelConfig):
        super().__init__()
        self.config = config
        
        # تحميل نموذج BERT العربي
        self.bert_config = AutoConfig.from_pretrained(
            config.model_name,
            num_labels=config.num_labels,
            output_attentions=False,
            output_hidden_states=True,
        )
        
        self.bert = AutoModel.from_pretrained(
            config.model_name,
            config=self.bert_config
        )
        
        # طبقات التصنيف
        self.dropout = nn.Dropout(config.dropout_rate)
        
        # استخدام طبقات متعددة للتحسين
        self.classifier_layers = nn.ModuleList([
            nn.Linear(config.hidden_size, config.hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_size // 2, config.hidden_size // 4),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_size // 4, config.num_labels)
        ])
        
        # طبقة إضافية للثقة
        self.confidence_layer = nn.Linear(config.hidden_size, 1)
        
        # أوزان لدمج الطبقات المخفية
        self.layer_weights = nn.Parameter(torch.ones(self.bert_config.num_hidden_layers))
        
    def forward(self, input_ids=None, attention_mask=None, labels=None, **kwargs):
        # تمرير عبر BERT
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            return_dict=True
        )
        
        # الحصول على جميع الطبقات المخفية
        hidden_states = outputs.hidden_states  # (batch_size, seq_len, hidden_size)
        
        # دمج الطبقات المخفية باستخدام الأوزان المتعلمة
        weights = F.softmax(self.layer_weights, dim=0)
        weighted_hidden_states = torch.zeros_like(hidden_states[-1])
        
        for i, hidden_state in enumerate(hidden_states):
            weighted_hidden_states += weights[i] * hidden_state
        
        # استخدام [CLS] token من الطبقة المدمجة
        cls_output = weighted_hidden_states[:, 0, :]  # [CLS] token
        
        # تطبيق طبقات التصنيف
        x = self.dropout(cls_output)
        
        for layer in self.classifier_layers:
            if isinstance(layer, nn.Linear):
                x = layer(x)
            else:
                x = layer(x)
        
        logits = x
        
        # حساب مستوى الثقة
        confidence_scores = torch.sigmoid(self.confidence_layer(cls_output))
        
        # حساب الخسارة إذا توفرت التسميات
        loss = None
        if labels is not None:
            loss_fct = nn.CrossEntropyLoss()
            loss = loss_fct(logits.view(-1, self.config.num_labels), labels.view(-1))
        
        return SequenceClassifierOutput(
            loss=loss,
            logits=logits,
            hidden_states=outputs.hidden_states,
            attentions=outputs.attentions,
        ), confidence_scores

class MultiDimensionalEmotionClassifier(nn.Module):
    """نموذج تحليل المشاعر متعدد الأبعاد"""
    
    def __init__(self, config: SentimentModelConfig):
        super().__init__()
        self.config = config
        
        # تعريف العواطف الأساسية
        self.emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']
        self.num_emotions = len(self.emotions)
        
        # نموذج BERT المشترك
        self.bert = AutoModel.from_pretrained(config.model_name)
        
        # رؤوس تصنيف منفصلة لكل عاطفة
        self.emotion_classifiers = nn.ModuleDict({
            emotion: nn.Sequential(
                nn.Linear(config.hidden_size, config.hidden_size // 2),
                nn.ReLU(),
                nn.Dropout(config.dropout_rate),
                nn.Linear(config.hidden_size // 2, 2)  # موجود/غير موجود
            ) for emotion in self.emotions
        })
        
        # رأس للتصنيف العام (إيجابي/سلبي/محايد)
        self.general_classifier = nn.Sequential(
            nn.Linear(config.hidden_size, config.hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_size // 2, 3)
        )
        
        # طبقة دمج العواطف
        self.emotion_fusion = nn.Linear(self.num_emotions * 2, config.hidden_size // 4)
        
    def forward(self, input_ids=None, attention_mask=None, emotion_labels=None, sentiment_labels=None):
        # تمرير عبر BERT
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask, return_dict=True)
        cls_output = outputs.last_hidden_state[:, 0, :]  # [CLS] token
        
        # تصنيف العواطف
        emotion_logits = {}
        emotion_probs = {}
        
        for emotion in self.emotions:
            logits = self.emotion_classifiers[emotion](cls_output)
            emotion_logits[emotion] = logits
            emotion_probs[emotion] = F.softmax(logits, dim=-1)
        
        # تصنيف المشاعر العام
        sentiment_logits = self.general_classifier(cls_output)
        
        # دمج معلومات العواطف
        emotion_features = torch.cat([emotion_probs[emotion] for emotion in self.emotions], dim=-1)
        fused_emotions = self.emotion_fusion(emotion_features)
        
        # حساب الخسائر
        total_loss = 0
        losses = {}
        
        if emotion_labels is not None:
            for i, emotion in enumerate(self.emotions):
                if emotion in emotion_labels:
                    emotion_loss = F.cross_entropy(
                        emotion_logits[emotion], 
                        emotion_labels[emotion]
                    )
                    losses[f'{emotion}_loss'] = emotion_loss
                    total_loss += emotion_loss
        
        if sentiment_labels is not None:
            sentiment_loss = F.cross_entropy(sentiment_logits, sentiment_labels)
            losses['sentiment_loss'] = sentiment_loss
            total_loss += sentiment_loss
        
        return {
            'total_loss': total_loss,
            'losses': losses,
            'emotion_logits': emotion_logits,
            'emotion_probs': emotion_probs,
            'sentiment_logits': sentiment_logits,
            'sentiment_probs': F.softmax(sentiment_logits, dim=-1),
            'fused_emotions': fused_emotions
        }

class ArabicSentimentAnalyzer:
    """محلل المشاعر العربي الشامل"""
    
    def __init__(self, config: SentimentModelConfig = None):
        self.config = config or SentimentModelConfig()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # تحميل المعالج النصي
        text_config = TextProcessingConfig(
            remove_diacritics=True,
            normalize_alef=True,
            handle_repetition=True
        )
        self.text_processor = ArabicTextProcessor(text_config)
        
        # تحميل المحول النصي
        self.tokenizer = AutoTokenizer.from_pretrained(self.config.model_name)
        
        # النماذج
        self.sentiment_model = None
        self.emotion_model = None
        
        # قاموس التسميات
        self.sentiment_labels = ['negative', 'neutral', 'positive']
        self.emotion_labels = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']
        
        # إحصائيات
        self.analysis_count = 0
        self.cache = {}
        
    def load_models(self, sentiment_model_path: str = None, emotion_model_path: str = None):
        """تحميل النماذج المدربة"""
        try:
            # تحميل نموذج المشاعر
            if sentiment_model_path and os.path.exists(sentiment_model_path):
                self.sentiment_model = ArabicBertSentimentClassifier(self.config)
                self.sentiment_model.load_state_dict(torch.load(sentiment_model_path, map_location=self.device))
                self.sentiment_model.to(self.device)
                self.sentiment_model.eval()
                logger.info(f"✅ تم تحميل نموذج المشاعر من: {sentiment_model_path}")
            else:
                # تحميل النموذج الأساسي
                self.sentiment_model = ArabicBertSentimentClassifier(self.config)
                self.sentiment_model.to(self.device)
                logger.info("✅ تم تحميل النموذج الأساسي للمشاعر")
            
            # تحميل نموذج العواطف
            if emotion_model_path and os.path.exists(emotion_model_path):
                self.emotion_model = MultiDimensionalEmotionClassifier(self.config)
                self.emotion_model.load_state_dict(torch.load(emotion_model_path, map_location=self.device))
                self.emotion_model.to(self.device)
                self.emotion_model.eval()
                logger.info(f"✅ تم تحميل نموذج العواطف من: {emotion_model_path}")
            else:
                # تحميل النموذج الأساسي
                self.emotion_model = MultiDimensionalEmotionClassifier(self.config)
                self.emotion_model.to(self.device)
                logger.info("✅ تم تحميل النموذج الأساسي للعواطف")
                
        except Exception as e:
            logger.error(f"❌ فشل في تحميل النماذج: {str(e)}")
            raise
    
    def preprocess_text(self, text: str) -> Dict[str, Any]:
        """معالجة النص قبل التحليل"""
        # معالجة النص
        processed = self.text_processor.process_text(text)
        
        if not processed['is_valid']:
            return None
        
        # ترميز النص
        encoding = self.tokenizer(
            processed['normalized_text'],
            truncation=True,
            padding='max_length',
            max_length=self.config.max_length,
            return_tensors='pt'
        )
        
        return {
            'processed_text': processed,
            'encoding': encoding,
            'input_ids': encoding['input_ids'].to(self.device),
            'attention_mask': encoding['attention_mask'].to(self.device)
        }
    
    def analyze_sentiment(self, text: str, include_confidence: bool = True) -> Dict[str, Any]:
        """تحليل المشاعر الأساسي"""
        if not self.sentiment_model:
            raise ValueError("نموذج المشاعر غير محمل")
        
        # التحقق من التخزين المؤقت
        cache_key = f"sentiment_{hash(text)}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # معالجة النص
        preprocessed = self.preprocess_text(text)
        if not preprocessed:
            return self._empty_sentiment_result()
        
        # التحليل
        with torch.no_grad():
            outputs, confidence_scores = self.sentiment_model(
                input_ids=preprocessed['input_ids'],
                attention_mask=preprocessed['attention_mask']
            )
        
        # تحويل النتائج
        probabilities = F.softmax(outputs.logits, dim=-1)
        predicted_class = torch.argmax(probabilities, dim=-1).item()
        confidence = confidence_scores.squeeze().item() if include_confidence else 1.0
        
        # بناء النتيجة
        result = {
            'text': text,
            'predicted_sentiment': self.sentiment_labels[predicted_class],
            'confidence': confidence,
            'probabilities': {
                label: prob.item() 
                for label, prob in zip(self.sentiment_labels, probabilities.squeeze())
            },
            'analysis_metadata': {
                'model_used': 'arabic_bert_sentiment',
                'processing_time': 0,  # يمكن إضافة قياس الوقت
                'text_length': len(text),
                'normalized_length': len(preprocessed['processed_text']['normalized_text'])
            }
        }
        
        # إضافة تحليل إضافي من معالج النصوص
        if preprocessed['processed_text']['emoji_analysis']:
            result['emoji_sentiment'] = preprocessed['processed_text']['emoji_analysis']
        
        if preprocessed['processed_text']['dialect_analysis']:
            result['dialect_info'] = preprocessed['processed_text']['dialect_analysis']
        
        # حفظ في التخزين المؤقت
        self.cache[cache_key] = result
        self.analysis_count += 1
        
        return result
    
    def analyze_emotions(self, text: str) -> Dict[str, Any]:
        """تحليل العواطف متعدد الأبعاد"""
        if not self.emotion_model:
            raise ValueError("نموذج العواطف غير محمل")
        
        # معالجة النص
        preprocessed = self.preprocess_text(text)
        if not preprocessed:
            return self._empty_emotion_result()
        
        # التحليل
        with torch.no_grad():
            outputs = self.emotion_model(
                input_ids=preprocessed['input_ids'],
                attention_mask=preprocessed['attention_mask']
            )
        
        # استخراج النتائج
        emotion_results = {}
        for emotion in self.emotion_labels:
            probs = outputs['emotion_probs'][emotion].squeeze()
            emotion_results[emotion] = {
                'probability': probs[1].item(),  # احتمالية وجود العاطفة
                'present': probs[1].item() > 0.5
            }
        
        # المشاعر العامة
        sentiment_probs = outputs['sentiment_probs'].squeeze()
        general_sentiment = {
            'predicted': self.sentiment_labels[torch.argmax(sentiment_probs).item()],
            'probabilities': {
                label: prob.item() 
                for label, prob in zip(self.sentiment_labels, sentiment_probs)
            }
        }
        
        # تحديد العاطفة المهيمنة
        dominant_emotion = max(emotion_results.items(), key=lambda x: x[1]['probability'])
        
        return {
            'text': text,
            'emotions': emotion_results,
            'general_sentiment': general_sentiment,
            'dominant_emotion': {
                'emotion': dominant_emotion[0],
                'probability': dominant_emotion[1]['probability']
            },
            'emotional_intensity': np.mean([v['probability'] for v in emotion_results.values()]),
            'analysis_metadata': {
                'model_used': 'multidimensional_emotion',
                'emotions_detected': sum(1 for v in emotion_results.values() if v['present']),
                'text_length': len(text)
            }
        }
    
    def comprehensive_analysis(self, text: str) -> Dict[str, Any]:
        """تحليل شامل للمشاعر والعواطف"""
        sentiment_result = self.analyze_sentiment(text)
        emotion_result = self.analyze_emotions(text)
        
        # دمج النتائج
        comprehensive_result = {
            'text': text,
            'sentiment_analysis': sentiment_result,
            'emotion_analysis': emotion_result,
            'summary': {
                'overall_sentiment': sentiment_result['predicted_sentiment'],
                'sentiment_confidence': sentiment_result['confidence'],
                'dominant_emotion': emotion_result['dominant_emotion'],
                'emotional_intensity': emotion_result['emotional_intensity'],
                'analysis_timestamp': datetime.now().isoformat()
            }
        }
        
        # إضافة تحليل متقدم
        comprehensive_result['advanced_analysis'] = self._advanced_sentiment_analysis(
            sentiment_result, emotion_result
        )
        
        return comprehensive_result
    
    def _advanced_sentiment_analysis(self, sentiment_result: Dict, emotion_result: Dict) -> Dict[str, Any]:
        """تحليل متقدم يدمج المشاعر والعواطف"""
        # حساب نقاط التعقيد العاطفي
        emotions_present = sum(1 for v in emotion_result['emotions'].values() if v['present'])
        emotional_complexity = emotions_present / len(self.emotion_labels)
        
        # تحديد حالة المزاج
        if sentiment_result['predicted_sentiment'] == 'positive':
            if emotion_result['dominant_emotion']['emotion'] in ['joy', 'trust', 'anticipation']:
                mood = 'upbeat'
            else:
                mood = 'cautiously_positive'
        elif sentiment_result['predicted_sentiment'] == 'negative':
            if emotion_result['dominant_emotion']['emotion'] in ['sadness', 'fear']:
                mood = 'melancholic'
            elif emotion_result['dominant_emotion']['emotion'] == 'anger':
                mood = 'aggressive'
            else:
                mood = 'negative'
        else:
            mood = 'neutral'
        
        # تحديد مستوى الاستثارة
        arousal_emotions = ['anger', 'fear', 'surprise', 'joy']
        arousal_score = np.mean([
            emotion_result['emotions'][emotion]['probability'] 
            for emotion in arousal_emotions
        ])
        
        # تحديد التكافؤ (إيجابي/سلبي)
        positive_emotions = ['joy', 'trust', 'anticipation']
        negative_emotions = ['sadness', 'anger', 'fear', 'disgust']
        
        positive_score = np.mean([
            emotion_result['emotions'][emotion]['probability'] 
            for emotion in positive_emotions
        ])
        negative_score = np.mean([
            emotion_result['emotions'][emotion]['probability'] 
            for emotion in negative_emotions
        ])
        
        valence = positive_score - negative_score
        
        return {
            'emotional_complexity': emotional_complexity,
            'mood_classification': mood,
            'arousal_level': arousal_score,
            'valence_score': valence,
            'emotional_coherence': abs(valence - (
                1 if sentiment_result['predicted_sentiment'] == 'positive' else 
                -1 if sentiment_result['predicted_sentiment'] == 'negative' else 0
            )),
            'analysis_confidence': (
                sentiment_result['confidence'] + 
                emotion_result['dominant_emotion']['probability']
            ) / 2
        }
    
    def _empty_sentiment_result(self) -> Dict[str, Any]:
        """نتيجة فارغة للمشاعر"""
        return {
            'text': "",
            'predicted_sentiment': 'neutral',
            'confidence': 0.0,
            'probabilities': {label: 0.0 for label in self.sentiment_labels},
            'analysis_metadata': {'error': 'text_processing_failed'}
        }
    
    def _empty_emotion_result(self) -> Dict[str, Any]:
        """نتيجة فارغة للعواطف"""
        return {
            'text': "",
            'emotions': {emotion: {'probability': 0.0, 'present': False} for emotion in self.emotion_labels},
            'general_sentiment': {
                'predicted': 'neutral',
                'probabilities': {label: 0.0 for label in self.sentiment_labels}
            },
            'dominant_emotion': {'emotion': 'neutral', 'probability': 0.0},
            'emotional_intensity': 0.0,
            'analysis_metadata': {'error': 'text_processing_failed'}
        }
    
    def batch_analyze(self, texts: List[str], analysis_type: str = 'comprehensive') -> List[Dict[str, Any]]:
        """تحليل مجمع للنصوص"""
        results = []
        
        for text in texts:
            try:
                if analysis_type == 'sentiment':
                    result = self.analyze_sentiment(text)
                elif analysis_type == 'emotion':
                    result = self.analyze_emotions(text)
                else:
                    result = self.comprehensive_analysis(text)
                
                results.append(result)
                
            except Exception as e:
                logger.error(f"خطأ في تحليل النص: {text[:50]}... - {str(e)}")
                results.append(self._empty_sentiment_result() if analysis_type == 'sentiment' 
                             else self._empty_emotion_result())
        
        return results
    
    def get_model_info(self) -> Dict[str, Any]:
        """معلومات النماذج المحملة"""
        return {
            'sentiment_model_loaded': self.sentiment_model is not None,
            'emotion_model_loaded': self.emotion_model is not None,
            'model_config': self.config.__dict__,
            'supported_labels': {
                'sentiment': self.sentiment_labels,
                'emotions': self.emotion_labels
            },
            'analysis_count': self.analysis_count,
            'cache_size': len(self.cache),
            'device': str(self.device)
        }

# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد النموذج
    config = SentimentModelConfig(
        model_name="aubmindlab/bert-base-arabert",
        num_labels=3,
        max_length=256
    )
    
    # إنشاء المحلل
    analyzer = ArabicSentimentAnalyzer(config)
    analyzer.load_models()
    
    # نصوص تجريبية
    test_texts = [
        "أحب هذا المقال كثيراً! إنه رائع ومفيد جداً 😍",
        "هذا المحتوى سيء ومملل، لا أنصح بقراءته 😞",
        "المقال عادي، لا شيء مميز فيه",
        "أشعر بالحزن والإحباط من هذا الخبر المؤلم",
        "واو! هذا مفاجئ ومثير للاهتمام، لم أتوقع ذلك!"
    ]
    
    # تحليل النصوص
    for text in test_texts:
        print(f"\n📝 النص: {text}")
        
        # تحليل شامل
        result = analyzer.comprehensive_analysis(text)
        
        # عرض النتائج
        sentiment = result['sentiment_analysis']
        emotion = result['emotion_analysis']
        advanced = result['advanced_analysis']
        
        print(f"😊 المشاعر: {sentiment['predicted_sentiment']} (ثقة: {sentiment['confidence']:.2f})")
        print(f"💭 العاطفة المهيمنة: {emotion['dominant_emotion']['emotion']} ({emotion['dominant_emotion']['probability']:.2f})")
        print(f"🎭 المزاج: {advanced['mood_classification']}")
        print(f"⚡ الاستثارة: {advanced['arousal_level']:.2f}")
        print(f"🎯 التكافؤ: {advanced['valence_score']:.2f}")
    
    # معلومات النموذج
    print(f"\n📊 معلومات النموذج:")
    model_info = analyzer.get_model_info()
    print(f"عدد التحليلات: {model_info['analysis_count']}")
    print(f"حجم التخزين المؤقت: {model_info['cache_size']}")
    print(f"الجهاز المستخدم: {model_info['device']}")
