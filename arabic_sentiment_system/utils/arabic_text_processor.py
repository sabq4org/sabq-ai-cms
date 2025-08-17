# معالج النصوص العربية المتقدم لتحليل المشاعر
# Advanced Arabic Text Processor for Sentiment Analysis

import re
import string
import logging
from typing import List, Dict, Tuple, Optional, Any, Union
from dataclasses import dataclass
import unicodedata
import emoji
import camel_tools
from camel_tools.utils.normalize import normalize_alef_maksura_ar, normalize_alef_ar, normalize_teh_marbuta_ar
from camel_tools.utils.dediac import dediac_ar
from camel_tools.tokenizers.word import simple_word_tokenize
from camel_tools.morphology.database import MorphologyDB
from camel_tools.morphology.analyzer import Analyzer
from camel_tools.sentiment import SentimentAnalyzer
import farasa
from transformers import AutoTokenizer
import numpy as np

logger = logging.getLogger(__name__)

@dataclass
class TextProcessingConfig:
    """إعدادات معالجة النصوص"""
    remove_diacritics: bool = True
    normalize_alef: bool = True
    normalize_teh_marbuta: bool = True
    remove_tatweel: bool = True
    remove_english: bool = False
    remove_numbers: bool = False
    remove_punctuation: bool = False
    remove_emojis: bool = False
    extract_emojis: bool = True
    min_word_length: int = 2
    max_word_length: int = 50
    preserve_negation: bool = True
    handle_repetition: bool = True
    detect_dialect: bool = True
    stem_words: bool = False
    lemmatize: bool = True

class ArabicEmotionExtractor:
    """مستخرج المشاعر من الرموز التعبيرية والنصوص"""
    
    def __init__(self):
        # رموز تعبيرية إيجابية
        self.positive_emojis = {
            '😀', '😃', '😄', '😁', '😆', '😊', '☺️', '😋', '😎', '😍', '🥰', '😘',
            '😗', '😙', '😚', '🤗', '🤩', '🥳', '😇', '👍', '👌', '✌️', '🤞', '💪',
            '👏', '🙌', '👐', '🤝', '❤️', '💕', '💖', '💗', '💙', '💚', '💛',
            '🧡', '💜', '🤍', '🖤', '💯', '✨', '⭐', '🌟', '💫', '🔥', '❤️‍🔥'
        }
        
        # رموز تعبيرية سلبية
        self.negative_emojis = {
            '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢',
            '😭', '😤', '😠', '😡', '🤬', '😱', '😨', '😰', '😥', '😓', '🤕', '🤒',
            '😷', '🤧', '🤮', '🤢', '😵', '🥴', '😪', '😴', '💔', '❤️‍🩹', '👎',
            '🖕', '😈', '👿', '💀', '☠️', '👻', '🤡', '💩'
        }
        
        # رموز تعبيرية محايدة
        self.neutral_emojis = {
            '😐', '😑', '😶', '🙄', '😏', '😒', '🤔', '🤨', '🧐', '🤓', '😬', '🤐',
            '🤫', '🤯', '😲', '😮', '😯', '😦', '😧', '😮‍💨', '😤', '🤷', '🤷‍♂️',
            '🤷‍♀️', '🤝', '✋', '🤚', '🖐️', '✌️', '👋'
        }

    def extract_emoji_sentiment(self, text: str) -> Dict[str, Any]:
        """استخراج المشاعر من الرموز التعبيرية"""
        emojis_found = []
        emoji_sentiment_scores = []
        
        for char in text:
            if char in emoji.EMOJI_DATA:
                emojis_found.append(char)
                
                if char in self.positive_emojis:
                    emoji_sentiment_scores.append(1.0)
                elif char in self.negative_emojis:
                    emoji_sentiment_scores.append(-1.0)
                elif char in self.neutral_emojis:
                    emoji_sentiment_scores.append(0.0)
                else:
                    # رمز تعبيري غير معروف
                    emoji_sentiment_scores.append(0.0)
        
        if emoji_sentiment_scores:
            avg_emoji_sentiment = np.mean(emoji_sentiment_scores)
            emoji_confidence = len(emoji_sentiment_scores) / max(len(text.split()), 1)
        else:
            avg_emoji_sentiment = 0.0
            emoji_confidence = 0.0
        
        return {
            'emojis': emojis_found,
            'emoji_sentiment_score': avg_emoji_sentiment,
            'emoji_confidence': emoji_confidence,
            'emoji_count': len(emojis_found)
        }

class ArabicDialectDetector:
    """كاشف اللهجات العربية"""
    
    def __init__(self):
        # كلمات مميزة لكل لهجة
        self.dialect_keywords = {
            'saudi': [
                'وش', 'ايش', 'كيفك', 'عيال', 'ماصدق', 'زين', 'يصير', 'ايوة',
                'أخوي', 'أختي', 'يابن', 'يالله', 'أحين', 'أهني', 'تعال'
            ],
            'egyptian': [
                'ايه', 'إزاي', 'إزيك', 'أهو', 'كده', 'علشان', 'عايز', 'عاوز',
                'دلوقتي', 'هو', 'هي', 'ده', 'دي', 'يلا', 'معلش', 'برضو'
            ],
            'levantine': [
                'شو', 'كيف', 'مين', 'وين', 'هيك', 'هاي', 'هاد', 'يعني',
                'أحلى', 'حبيبي', 'حبيبتي', 'خلص', 'طيب', 'تمام', 'معقول'
            ],
            'gulf': [
                'شلون', 'شنو', 'وين', 'مال', 'مالت', 'هذي', 'هذا', 'يا',
                'حياك', 'تسلم', 'زين', 'مب', 'مو', 'ودي', 'أبي', 'أبغى'
            ],
            'maghrebi': [
                'أش', 'أشنو', 'كيفاش', 'وين', 'هنا', 'هناك', 'بزاف', 'شوية',
                'واخا', 'ماشي', 'بحال', 'غير', 'كيما', 'ديك', 'دابا'
            ]
        }
    
    def detect_dialect(self, text: str) -> Dict[str, Any]:
        """كشف اللهجة من النص"""
        text_lower = text.lower()
        dialect_scores = {}
        
        for dialect, keywords in self.dialect_keywords.items():
            score = 0
            found_keywords = []
            
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
                    found_keywords.append(keyword)
            
            # تطبيع النقاط بناءً على طول النص
            normalized_score = score / max(len(text.split()), 1)
            dialect_scores[dialect] = {
                'score': normalized_score,
                'keywords_found': found_keywords,
                'keyword_count': score
            }
        
        # تحديد اللهجة الأكثر احتمالاً
        if dialect_scores:
            best_dialect = max(dialect_scores.keys(), 
                             key=lambda x: dialect_scores[x]['score'])
            best_score = dialect_scores[best_dialect]['score']
            
            # إذا كانت النقاط منخفضة جداً، اعتبرها فصحى
            if best_score < 0.01:
                predicted_dialect = 'msa'
                confidence = 0.8
            else:
                predicted_dialect = best_dialect
                confidence = min(best_score * 10, 1.0)  # تحويل إلى confidence score
        else:
            predicted_dialect = 'msa'
            confidence = 0.5
        
        return {
            'predicted_dialect': predicted_dialect,
            'confidence': confidence,
            'dialect_scores': dialect_scores,
            'is_dialectal': predicted_dialect != 'msa'
        }

class ArabicTextProcessor:
    """معالج النصوص العربية الشامل"""
    
    def __init__(self, config: TextProcessingConfig = None):
        self.config = config or TextProcessingConfig()
        
        # تحميل أدوات CAMeL
        try:
            self.db = MorphologyDB.builtin_db()
            self.analyzer = Analyzer(self.db)
            logger.info("✅ تم تحميل أدوات CAMeL بنجاح")
        except Exception as e:
            logger.warning(f"⚠️ فشل في تحميل CAMeL: {e}")
            self.db = None
            self.analyzer = None
        
        # تحميل Farasa
        try:
            self.farasa = farasa.FarasaSegmenter(interactive=True)
            logger.info("✅ تم تحميل Farasa بنجاح")
        except Exception as e:
            logger.warning(f"⚠️ فشل في تحميل Farasa: {e}")
            self.farasa = None
        
        # مكونات إضافية
        self.emotion_extractor = ArabicEmotionExtractor()
        self.dialect_detector = ArabicDialectDetector()
        
        # أنماط التعبيرات المنتظمة
        self.patterns = self._compile_patterns()
        
        # كلمات النفي العربية
        self.negation_words = {
            'لا', 'ما', 'لم', 'لن', 'ليس', 'ليست', 'غير', 'بدون', 'مش', 'مو', 'مب'
        }
        
        # كلمات التأكيد
        self.emphasis_words = {
            'جداً', 'جدا', 'كثير', 'كتير', 'جامد', 'قوي', 'بزاف', 'وايد', 'مرة'
        }
    
    def _compile_patterns(self) -> Dict[str, re.Pattern]:
        """تجميع الأنماط المنتظمة"""
        return {
            # أنماط التنظيف
            'emails': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            'urls': re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'),
            'mentions': re.compile(r'@[\w\u0600-\u06FF]+'),
            'hashtags': re.compile(r'#[\w\u0600-\u06FF]+'),
            'numbers': re.compile(r'\b\d+\b'),
            'english': re.compile(r'[a-zA-Z]+'),
            'punctuation': re.compile(r'[^\w\s\u0600-\u06FF]'),
            'extra_whitespace': re.compile(r'\s+'),
            'repetition': re.compile(r'(.)\1{2,}'),  # تكرار الأحرف
            'tatweel': re.compile(r'\u0640+'),  # التطويل
            'diacritics': re.compile(r'[\u064B-\u0652\u0670\u0640]'),  # التشكيل
        }
    
    def basic_clean(self, text: str) -> str:
        """التنظيف الأساسي للنص"""
        if not text or not isinstance(text, str):
            return ""
        
        # إزالة الرموز التعبيرية إذا طُلب ذلك
        if self.config.remove_emojis:
            text = ''.join(char for char in text if char not in emoji.EMOJI_DATA)
        
        # تطبيع Unicode
        text = unicodedata.normalize('NFKC', text)
        
        # إزالة URLs والإيميلات
        text = self.patterns['urls'].sub(' ', text)
        text = self.patterns['emails'].sub(' ', text)
        
        # إزالة الإنجليزية إذا طُلب ذلك
        if self.config.remove_english:
            text = self.patterns['english'].sub(' ', text)
        
        # إزالة الأرقام إذا طُلب ذلك
        if self.config.remove_numbers:
            text = self.patterns['numbers'].sub(' ', text)
        
        # إزالة علامات الترقيم إذا طُلب ذلك
        if self.config.remove_punctuation:
            text = self.patterns['punctuation'].sub(' ', text)
        
        # إزالة التطويل
        if self.config.remove_tatweel:
            text = self.patterns['tatweel'].sub('', text)
        
        # معالجة التكرار
        if self.config.handle_repetition:
            text = self.patterns['repetition'].sub(r'\1\1', text)
        
        # إزالة المسافات الزائدة
        text = self.patterns['extra_whitespace'].sub(' ', text)
        
        return text.strip()
    
    def normalize_arabic(self, text: str) -> str:
        """تطبيع النص العربي"""
        if not text:
            return ""
        
        # إزالة التشكيل
        if self.config.remove_diacritics:
            text = dediac_ar(text)
        
        # تطبيع الألف
        if self.config.normalize_alef:
            text = normalize_alef_ar(text)
            text = normalize_alef_maksura_ar(text)
        
        # تطبيع التاء المربوطة
        if self.config.normalize_teh_marbuta:
            text = normalize_teh_marbuta_ar(text)
        
        return text
    
    def tokenize(self, text: str) -> List[str]:
        """تقسيم النص إلى رموز"""
        if not text:
            return []
        
        # استخدام CAMeL tools للتقسيم
        try:
            tokens = simple_word_tokenize(text)
        except:
            # تقسيم بسيط كبديل
            tokens = text.split()
        
        # تصفية الرموز
        filtered_tokens = []
        for token in tokens:
            # إزالة الرموز القصيرة أو الطويلة جداً
            if len(token) < self.config.min_word_length or len(token) > self.config.max_word_length:
                continue
            
            # إزالة الرموز التي تحتوي على أرقام فقط
            if token.isdigit() and self.config.remove_numbers:
                continue
            
            filtered_tokens.append(token)
        
        return filtered_tokens
    
    def extract_linguistic_features(self, text: str) -> Dict[str, Any]:
        """استخراج المعالم اللغوية"""
        features = {}
        
        # معلومات أساسية
        features['word_count'] = len(text.split())
        features['char_count'] = len(text)
        features['sentence_count'] = len(re.split(r'[.!?؟]', text))
        
        # كشف النفي
        negation_count = sum(1 for word in text.split() if word in self.negation_words)
        features['negation_ratio'] = negation_count / max(len(text.split()), 1)
        features['has_negation'] = negation_count > 0
        
        # كشف التأكيد
        emphasis_count = sum(1 for word in text.split() if word in self.emphasis_words)
        features['emphasis_ratio'] = emphasis_count / max(len(text.split()), 1)
        features['has_emphasis'] = emphasis_count > 0
        
        # نسبة علامات التعجب والاستفهام
        exclamation_count = text.count('!') + text.count('؟')
        features['exclamation_ratio'] = exclamation_count / max(len(text), 1)
        
        # نسبة الأحرف الكبيرة (للإنجليزية المختلطة)
        if any(c.isupper() for c in text):
            upper_count = sum(1 for c in text if c.isupper())
            features['uppercase_ratio'] = upper_count / max(len(text), 1)
        else:
            features['uppercase_ratio'] = 0.0
        
        return features
    
    def process_text(self, text: str, extract_emotions: bool = True, 
                    detect_dialect: bool = True) -> Dict[str, Any]:
        """معالجة شاملة للنص"""
        if not text or not isinstance(text, str):
            return self._empty_result()
        
        original_text = text
        
        # استخراج الرموز التعبيرية قبل التنظيف
        emoji_data = {}
        if extract_emotions:
            emoji_data = self.emotion_extractor.extract_emoji_sentiment(text)
        
        # كشف اللهجة
        dialect_data = {}
        if detect_dialect:
            dialect_data = self.dialect_detector.detect_dialect(text)
        
        # التنظيف والتطبيع
        cleaned_text = self.basic_clean(text)
        normalized_text = self.normalize_arabic(cleaned_text)
        
        # التقسيم
        tokens = self.tokenize(normalized_text)
        
        # استخراج المعالم اللغوية
        linguistic_features = self.extract_linguistic_features(original_text)
        
        # إحصائيات النص
        processing_stats = {
            'original_length': len(original_text),
            'cleaned_length': len(cleaned_text),
            'normalized_length': len(normalized_text),
            'token_count': len(tokens),
            'reduction_ratio': 1 - (len(normalized_text) / max(len(original_text), 1))
        }
        
        return {
            'original_text': original_text,
            'cleaned_text': cleaned_text,
            'normalized_text': normalized_text,
            'tokens': tokens,
            'linguistic_features': linguistic_features,
            'emoji_analysis': emoji_data,
            'dialect_analysis': dialect_data,
            'processing_stats': processing_stats,
            'is_valid': len(tokens) > 0
        }
    
    def _empty_result(self) -> Dict[str, Any]:
        """نتيجة فارغة للنصوص غير الصالحة"""
        return {
            'original_text': "",
            'cleaned_text': "",
            'normalized_text': "",
            'tokens': [],
            'linguistic_features': {},
            'emoji_analysis': {},
            'dialect_analysis': {},
            'processing_stats': {},
            'is_valid': False
        }
    
    def batch_process(self, texts: List[str], **kwargs) -> List[Dict[str, Any]]:
        """معالجة مجمعة للنصوص"""
        results = []
        
        for text in texts:
            try:
                result = self.process_text(text, **kwargs)
                results.append(result)
            except Exception as e:
                logger.error(f"خطأ في معالجة النص: {text[:50]}... - {str(e)}")
                results.append(self._empty_result())
        
        return results

# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد المعالج
    config = TextProcessingConfig(
        remove_diacritics=True,
        normalize_alef=True,
        handle_repetition=True,
        detect_dialect=True
    )
    
    processor = ArabicTextProcessor(config)
    
    # نصوص تجريبية
    test_texts = [
        "أحب هذا المقال كثيراً! إنه رائع جداً 😍✨",
        "هذا المحتوى سيء ومملل 😞👎",
        "وش رايك في المقال؟ زين ولا لا؟",  # سعودي
        "ايه رأيك في الموضوع ده؟ حلو ولا وحش؟",  # مصري
        "شو بدك تعمل بهالموضوع؟ حلو كتير!"  # شامي
    ]
    
    # معالجة النصوص
    for text in test_texts:
        print(f"\n📝 النص الأصلي: {text}")
        result = processor.process_text(text)
        
        print(f"🧹 النص المنظف: {result['normalized_text']}")
        print(f"🔍 الرموز: {result['tokens']}")
        
        if result['dialect_analysis']:
            dialect = result['dialect_analysis']['predicted_dialect']
            confidence = result['dialect_analysis']['confidence']
            print(f"🗣️ اللهجة: {dialect} (ثقة: {confidence:.2f})")
        
        if result['emoji_analysis']:
            emoji_sentiment = result['emoji_analysis']['emoji_sentiment_score']
            emoji_count = result['emoji_analysis']['emoji_count']
            print(f"😊 تحليل الرموز: {emoji_sentiment:.2f} ({emoji_count} رموز)")
        
        if result['linguistic_features']:
            negation = result['linguistic_features']['has_negation']
            emphasis = result['linguistic_features']['has_emphasis']
            print(f"📊 المعالم: نفي={negation}, تأكيد={emphasis}")
