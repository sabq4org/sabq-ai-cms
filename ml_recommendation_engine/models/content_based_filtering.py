# محرك التوصيات - خوارزميات التصفية المحتوائية المتقدمة
# Content-Based Filtering Models for Sabq AI Recommendation Engine

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel, pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import LatentDirichletAllocation, NMF
from sklearn.cluster import KMeans
import arabic_reshaper
import bidi.algorithm
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import ISRIStemmer
import gensim
from gensim.models import Word2Vec, Doc2Vec
from gensim.models.doc2vec import TaggedDocument
import logging
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta
import joblib
import pickle
from dataclasses import dataclass
import asyncio
from concurrent.futures import ThreadPoolExecutor
import multiprocessing as mp

# إعداد NLTK للعربية
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ContentFilteringConfig:
    """إعدادات نموذج التصفية المحتوائية"""
    # BERT settings
    bert_model_name: str = "aubmindlab/bert-base-arabert"
    max_sequence_length: int = 512
    
    # TF-IDF settings
    max_features: int = 10000
    min_df: int = 2
    max_df: float = 0.95
    ngram_range: Tuple[int, int] = (1, 3)
    
    # Topic modeling
    n_topics: int = 50
    topic_model_type: str = "LDA"  # LDA, NMF, BERTopic
    
    # Similarity settings
    similarity_threshold: float = 0.1
    top_similar_articles: int = 100
    
    # Word2Vec settings
    word2vec_size: int = 200
    word2vec_window: int = 5
    word2vec_min_count: int = 2
    
    # Doc2Vec settings
    doc2vec_size: int = 300
    doc2vec_window: int = 5
    doc2vec_min_count: int = 2
    
    # Processing
    use_stemming: bool = True
    remove_diacritics: bool = True
    chunk_size: int = 1000


class ArabicTextProcessor:
    """
    معالج النصوص العربية المتقدم
    Advanced Arabic Text Processor
    """
    
    def __init__(self, config: ContentFilteringConfig):
        self.config = config
        self.stemmer = ISRIStemmer()
        
        # قائمة كلمات الإيقاف العربية
        try:
            self.arabic_stopwords = set(stopwords.words('arabic'))
        except:
            self.arabic_stopwords = set()
        
        # إضافة كلمات إيقاف مخصصة للمجال الإعلامي
        custom_stopwords = {
            'قال', 'قالت', 'أضاف', 'أضافت', 'أوضح', 'أوضحت', 'ذكر', 'ذكرت',
            'أشار', 'أشارت', 'بين', 'بينت', 'أكد', 'أكدت', 'نوه', 'نوهت',
            'لفت', 'لفتت', 'شدد', 'شددت', 'أبان', 'أبانت', 'بحسب', 'وفقا',
            'حسب', 'طبقا', 'وفق', 'بناء', 'استنادا', 'تبعا', 'حيث', 'كما',
            'إذ', 'عند', 'لدى', 'في', 'على', 'إلى', 'من', 'عن', 'مع'
        }
        self.arabic_stopwords.update(custom_stopwords)
        
        # تعبيرات منتظمة للتنظيف
        self.cleaning_patterns = [
            (r'[^\u0600-\u06FF\s]', ''),  # إزالة الأحرف غير العربية
            (r'\s+', ' '),  # دمج المسافات المتعددة
            (r'[\u064B-\u0652]', ''),  # إزالة التشكيل
            (r'[\u0640]', ''),  # إزالة التطويل
        ]
    
    def clean_text(self, text: str) -> str:
        """تنظيف النص العربي"""
        if not text or not isinstance(text, str):
            return ""
        
        # تطبيق التعبيرات المنتظمة
        for pattern, replacement in self.cleaning_patterns:
            text = re.sub(pattern, replacement, text)
        
        # إزالة التشكيل إذا طُلب ذلك
        if self.config.remove_diacritics:
            text = self._remove_diacritics(text)
        
        return text.strip()
    
    def _remove_diacritics(self, text: str) -> str:
        """إزالة التشكيل من النص"""
        diacritics = r'[\u064B-\u0652\u0670\u0640]'
        return re.sub(diacritics, '', text)
    
    def tokenize(self, text: str) -> List[str]:
        """تقسيم النص إلى رموز"""
        text = self.clean_text(text)
        tokens = text.split()
        
        # إزالة كلمات الإيقاف
        tokens = [token for token in tokens if token not in self.arabic_stopwords]
        
        # تطبيق الاشتقاق إذا طُلب ذلك
        if self.config.use_stemming:
            tokens = [self.stemmer.stem(token) for token in tokens]
        
        return [token for token in tokens if len(token) > 1]
    
    def preprocess_article(self, article: Dict[str, str]) -> Dict[str, str]:
        """معالجة مقال كامل"""
        processed = {}
        
        # معالجة العنوان
        if 'title' in article:
            processed['title'] = self.clean_text(article['title'])
            processed['title_tokens'] = self.tokenize(article['title'])
        
        # معالجة المحتوى
        if 'content' in article:
            processed['content'] = self.clean_text(article['content'])
            processed['content_tokens'] = self.tokenize(article['content'])
        
        # معالجة الملخص
        if 'summary' in article:
            processed['summary'] = self.clean_text(article['summary'])
            processed['summary_tokens'] = self.tokenize(article['summary'])
        
        # معالجة الكلمات المفتاحية
        if 'tags' in article:
            if isinstance(article['tags'], str):
                tags = article['tags'].split(',')
            else:
                tags = article['tags']
            processed['tags'] = [self.clean_text(tag) for tag in tags]
        
        # دمج جميع النصوص
        all_text = []
        if 'title' in processed:
            all_text.append(processed['title'])
        if 'content' in processed:
            all_text.append(processed['content'])
        if 'summary' in processed:
            all_text.append(processed['summary'])
        
        processed['combined_text'] = ' '.join(all_text)
        processed['combined_tokens'] = self.tokenize(processed['combined_text'])
        
        return processed


class BERTContentExtractor:
    """
    مستخرج المحتوى باستخدام BERT العربي
    BERT-based Content Feature Extractor
    """
    
    def __init__(self, config: ContentFilteringConfig):
        self.config = config
        self.tokenizer = None
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self._load_model()
    
    def _load_model(self):
        """تحميل نموذج BERT العربي"""
        try:
            logger.info(f"🤖 تحميل نموذج BERT: {self.config.bert_model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.config.bert_model_name)
            self.model = AutoModel.from_pretrained(self.config.bert_model_name)
            self.model.to(self.device)
            self.model.eval()
            logger.info("✅ تم تحميل نموذج BERT بنجاح")
        except Exception as e:
            logger.error(f"❌ فشل في تحميل نموذج BERT: {str(e)}")
            raise
    
    def extract_embeddings(self, texts: List[str], batch_size: int = 8) -> np.ndarray:
        """استخراج التضمينات من قائمة النصوص"""
        embeddings = []
        
        logger.info(f"🔄 استخراج التضمينات لـ {len(texts)} نص...")
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            batch_embeddings = self._extract_batch_embeddings(batch_texts)
            embeddings.extend(batch_embeddings)
            
            if (i + batch_size) % 100 == 0:
                logger.info(f"📊 تم معالجة {min(i + batch_size, len(texts))} / {len(texts)} نص")
        
        return np.array(embeddings)
    
    def _extract_batch_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        """استخراج التضمينات لمجموعة من النصوص"""
        with torch.no_grad():
            # ترميز النصوص
            encoded = self.tokenizer(
                texts,
                padding=True,
                truncation=True,
                max_length=self.config.max_sequence_length,
                return_tensors='pt'
            ).to(self.device)
            
            # الحصول على التضمينات
            outputs = self.model(**encoded)
            
            # استخدام متوسط آخر طبقة مخفية
            embeddings = outputs.last_hidden_state.mean(dim=1)
            
            return embeddings.cpu().numpy()
    
    def extract_sentence_embeddings(self, text: str) -> np.ndarray:
        """استخراج تضمين لنص واحد"""
        return self.extract_embeddings([text])[0]
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """حساب التشابه الدلالي بين نصين"""
        emb1 = self.extract_sentence_embeddings(text1)
        emb2 = self.extract_sentence_embeddings(text2)
        
        # حساب التشابه الكوساني
        similarity = cosine_similarity([emb1], [emb2])[0][0]
        return float(similarity)


class TFIDFContentExtractor:
    """
    مستخرج المحتوى باستخدام TF-IDF
    TF-IDF based Content Feature Extractor
    """
    
    def __init__(self, config: ContentFilteringConfig):
        self.config = config
        self.text_processor = ArabicTextProcessor(config)
        self.vectorizer = None
        self.feature_matrix = None
        self.article_ids = []
    
    def _custom_tokenizer(self, text: str) -> List[str]:
        """مُرمز مخصص للنصوص العربية"""
        return self.text_processor.tokenize(text)
    
    def fit_transform(self, articles_df: pd.DataFrame) -> np.ndarray:
        """تدريب وتحويل مجموعة المقالات"""
        logger.info("🔄 بناء مصفوفة TF-IDF...")
        
        # تحضير النصوص
        texts = []
        self.article_ids = []
        
        for _, article in articles_df.iterrows():
            # دمج العنوان والمحتوى
            combined_text = f"{article.get('title', '')} {article.get('content', '')}"
            texts.append(combined_text)
            self.article_ids.append(article['id'])
        
        # إنشاء مُجمع TF-IDF
        self.vectorizer = TfidfVectorizer(
            max_features=self.config.max_features,
            min_df=self.config.min_df,
            max_df=self.config.max_df,
            ngram_range=self.config.ngram_range,
            tokenizer=self._custom_tokenizer,
            lowercase=False,  # العربية لا تحتاج تحويل لأحرف صغيرة
            stop_words=None   # نتعامل مع كلمات الإيقاف في المُرمز
        )
        
        # تدريب وتحويل البيانات
        self.feature_matrix = self.vectorizer.fit_transform(texts)
        
        logger.info(f"✅ تم بناء مصفوفة TF-IDF: {self.feature_matrix.shape}")
        return self.feature_matrix
    
    def transform(self, texts: List[str]) -> np.ndarray:
        """تحويل نصوص جديدة باستخدام النموذج المدرب"""
        if self.vectorizer is None:
            raise ValueError("النموذج غير مدرب. استخدم fit_transform أولاً.")
        
        return self.vectorizer.transform(texts)
    
    def get_similar_articles(self, article_id: str, n_similar: int = 10) -> List[Tuple[str, float]]:
        """العثور على مقالات مشابهة لمقال معين"""
        if article_id not in self.article_ids:
            return []
        
        # الحصول على مؤشر المقال
        article_idx = self.article_ids.index(article_id)
        
        # حساب التشابه الكوساني
        article_vector = self.feature_matrix[article_idx:article_idx+1]
        similarities = cosine_similarity(article_vector, self.feature_matrix).flatten()
        
        # ترتيب المقالات حسب التشابه
        similar_indices = np.argsort(similarities)[::-1][1:n_similar+1]  # استبعاد المقال نفسه
        
        similar_articles = []
        for idx in similar_indices:
            similar_id = self.article_ids[idx]
            similarity = similarities[idx]
            if similarity > self.config.similarity_threshold:
                similar_articles.append((similar_id, float(similarity)))
        
        return similar_articles
    
    def get_content_recommendations(self, user_articles: List[str], 
                                  n_recommendations: int = 10) -> List[Tuple[str, float]]:
        """الحصول على توصيات بناءً على مقالات المستخدم"""
        if not user_articles or self.feature_matrix is None:
            return []
        
        # بناء ملف المستخدم كمتوسط مقالاته
        user_vectors = []
        for article_id in user_articles:
            if article_id in self.article_ids:
                article_idx = self.article_ids.index(article_id)
                user_vectors.append(self.feature_matrix[article_idx].toarray()[0])
        
        if not user_vectors:
            return []
        
        # حساب متوسط ملف المستخدم
        user_profile = np.mean(user_vectors, axis=0)
        
        # حساب التشابه مع جميع المقالات
        similarities = cosine_similarity([user_profile], self.feature_matrix).flatten()
        
        # ترتيب واستبعاد المقالات المرئية
        recommendations = []
        for i, similarity in enumerate(similarities):
            article_id = self.article_ids[i]
            if (article_id not in user_articles and 
                similarity > self.config.similarity_threshold):
                recommendations.append((article_id, float(similarity)))
        
        # ترتيب حسب التشابه
        recommendations.sort(key=lambda x: x[1], reverse=True)
        
        return recommendations[:n_recommendations]
    
    def get_feature_names(self) -> List[str]:
        """الحصول على أسماء المعالم"""
        if self.vectorizer is None:
            return []
        return self.vectorizer.get_feature_names_out().tolist()
    
    def explain_similarity(self, article1_id: str, article2_id: str, 
                          top_features: int = 10) -> Dict[str, Any]:
        """شرح التشابه بين مقالين"""
        if (article1_id not in self.article_ids or 
            article2_id not in self.article_ids):
            return {}
        
        idx1 = self.article_ids.index(article1_id)
        idx2 = self.article_ids.index(article2_id)
        
        vector1 = self.feature_matrix[idx1].toarray()[0]
        vector2 = self.feature_matrix[idx2].toarray()[0]
        
        # حساب مساهمة كل معلم في التشابه
        feature_contributions = vector1 * vector2
        feature_names = self.get_feature_names()
        
        # ترتيب المعالم حسب المساهمة
        top_indices = np.argsort(feature_contributions)[::-1][:top_features]
        
        explanations = []
        for idx in top_indices:
            if feature_contributions[idx] > 0:
                explanations.append({
                    'feature': feature_names[idx],
                    'contribution': float(feature_contributions[idx]),
                    'weight1': float(vector1[idx]),
                    'weight2': float(vector2[idx])
                })
        
        overall_similarity = cosine_similarity([vector1], [vector2])[0][0]
        
        return {
            'overall_similarity': float(overall_similarity),
            'top_contributing_features': explanations
        }


class TopicModelingEngine:
    """
    محرك النمذجة الموضوعية
    Topic Modeling Engine
    """
    
    def __init__(self, config: ContentFilteringConfig):
        self.config = config
        self.text_processor = ArabicTextProcessor(config)
        self.topic_model = None
        self.vectorizer = None
        self.article_topics = None
        self.topic_labels = []
    
    def train_lda_model(self, articles_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب نموذج LDA"""
        logger.info("🔄 تدريب نموذج LDA للموضوعات...")
        
        # تحضير النصوص
        texts = []
        for _, article in articles_df.iterrows():
            combined_text = f"{article.get('title', '')} {article.get('content', '')}"
            texts.append(combined_text)
        
        # إنشاء مصفوفة TF-IDF
        self.vectorizer = TfidfVectorizer(
            max_features=self.config.max_features,
            min_df=self.config.min_df,
            max_df=self.config.max_df,
            tokenizer=self.text_processor.tokenize,
            lowercase=False
        )
        
        text_features = self.vectorizer.fit_transform(texts)
        
        # تدريب نموذج LDA
        self.topic_model = LatentDirichletAllocation(
            n_components=self.config.n_topics,
            random_state=42,
            learning_method='batch',
            max_iter=100
        )
        
        self.topic_model.fit(text_features)
        
        # الحصول على توزيع الموضوعات للمقالات
        self.article_topics = self.topic_model.transform(text_features)
        
        # استخراج تسميات الموضوعات
        self._extract_topic_labels()
        
        # حساب معايير التقييم
        perplexity = self.topic_model.perplexity(text_features)
        log_likelihood = self.topic_model.score(text_features)
        
        logger.info(f"✅ تم تدريب نموذج LDA - Perplexity: {perplexity:.2f}")
        
        return {
            'model_type': 'LDA',
            'n_topics': self.config.n_topics,
            'perplexity': perplexity,
            'log_likelihood': log_likelihood,
            'topic_labels': self.topic_labels
        }
    
    def train_nmf_model(self, articles_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب نموذج NMF للموضوعات"""
        logger.info("🔄 تدريب نموذج NMF للموضوعات...")
        
        # تحضير النصوص (مشابه لـ LDA)
        texts = []
        for _, article in articles_df.iterrows():
            combined_text = f"{article.get('title', '')} {article.get('content', '')}"
            texts.append(combined_text)
        
        # إنشاء مصفوفة TF-IDF
        self.vectorizer = TfidfVectorizer(
            max_features=self.config.max_features,
            min_df=self.config.min_df,
            max_df=self.config.max_df,
            tokenizer=self.text_processor.tokenize,
            lowercase=False
        )
        
        text_features = self.vectorizer.fit_transform(texts)
        
        # تدريب نموذج NMF
        self.topic_model = NMF(
            n_components=self.config.n_topics,
            random_state=42,
            init='nndsvd',
            max_iter=200
        )
        
        self.article_topics = self.topic_model.fit_transform(text_features)
        
        # استخراج تسميات الموضوعات
        self._extract_topic_labels()
        
        # حساب خطأ إعادة البناء
        reconstruction_error = self.topic_model.reconstruction_err_
        
        logger.info(f"✅ تم تدريب نموذج NMF - Reconstruction Error: {reconstruction_error:.2f}")
        
        return {
            'model_type': 'NMF',
            'n_topics': self.config.n_topics,
            'reconstruction_error': reconstruction_error,
            'topic_labels': self.topic_labels
        }
    
    def _extract_topic_labels(self, top_words: int = 5):
        """استخراج تسميات الموضوعات"""
        feature_names = self.vectorizer.get_feature_names_out()
        
        self.topic_labels = []
        for topic_idx, topic in enumerate(self.topic_model.components_):
            top_features_ind = topic.argsort()[-top_words:][::-1]
            top_features = [feature_names[i] for i in top_features_ind]
            self.topic_labels.append(f"موضوع_{topic_idx}: {', '.join(top_features[:3])}")
    
    def get_article_topics(self, article_id: str, article_idx: int) -> List[Tuple[int, float]]:
        """الحصول على موضوعات مقال معين"""
        if self.article_topics is None or article_idx >= len(self.article_topics):
            return []
        
        topic_distribution = self.article_topics[article_idx]
        
        # ترتيب الموضوعات حسب الاحتمالية
        topic_probs = [(i, prob) for i, prob in enumerate(topic_distribution)]
        topic_probs.sort(key=lambda x: x[1], reverse=True)
        
        # إرجاع الموضوعات ذات الاحتمالية > 0.1
        return [(topic_id, prob) for topic_id, prob in topic_probs if prob > 0.1]
    
    def get_similar_articles_by_topic(self, article_idx: int, 
                                    n_similar: int = 10) -> List[Tuple[int, float]]:
        """العثور على مقالات مشابهة بناءً على توزيع الموضوعات"""
        if self.article_topics is None or article_idx >= len(self.article_topics):
            return []
        
        article_topics = self.article_topics[article_idx:article_idx+1]
        similarities = cosine_similarity(article_topics, self.article_topics).flatten()
        
        # ترتيب المقالات حسب التشابه
        similar_indices = np.argsort(similarities)[::-1][1:n_similar+1]
        
        return [(int(idx), float(similarities[idx])) for idx in similar_indices]
    
    def get_topic_trends(self, time_window: str = "daily") -> Dict[str, List]:
        """تحليل اتجاهات الموضوعات عبر الزمن"""
        # يمكن تطوير هذا ليحلل تطور الموضوعات عبر الزمن
        if self.article_topics is None:
            return {}
        
        # حساب شعبية كل موضوع
        topic_popularity = np.mean(self.article_topics, axis=0)
        
        trends = {}
        for i, (topic_label, popularity) in enumerate(zip(self.topic_labels, topic_popularity)):
            trends[topic_label] = {
                'popularity_score': float(popularity),
                'rank': i + 1
            }
        
        return trends


class Word2VecContentModel:
    """
    نموذج Word2Vec للمحتوى العربي
    Word2Vec Content Model for Arabic
    """
    
    def __init__(self, config: ContentFilteringConfig):
        self.config = config
        self.text_processor = ArabicTextProcessor(config)
        self.word2vec_model = None
        self.article_vectors = {}
    
    def train_word2vec(self, articles_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب نموذج Word2Vec"""
        logger.info("🔄 تدريب نموذج Word2Vec...")
        
        # تحضير الجمل للتدريب
        sentences = []
        for _, article in articles_df.iterrows():
            combined_text = f"{article.get('title', '')} {article.get('content', '')}"
            tokens = self.text_processor.tokenize(combined_text)
            if len(tokens) > 5:  # تجاهل النصوص القصيرة جداً
                sentences.append(tokens)
        
        logger.info(f"📝 تدريب على {len(sentences)} جملة...")
        
        # تدريب نموذج Word2Vec
        self.word2vec_model = Word2Vec(
            sentences=sentences,
            vector_size=self.config.word2vec_size,
            window=self.config.word2vec_window,
            min_count=self.config.word2vec_min_count,
            workers=mp.cpu_count(),
            epochs=30,
            sg=1  # استخدام Skip-gram
        )
        
        # حساب متجهات المقالات
        self._calculate_article_vectors(articles_df)
        
        vocab_size = len(self.word2vec_model.wv.key_to_index)
        logger.info(f"✅ تم تدريب Word2Vec - حجم المفردات: {vocab_size}")
        
        return {
            'model_type': 'Word2Vec',
            'vocab_size': vocab_size,
            'vector_size': self.config.word2vec_size,
            'n_articles': len(self.article_vectors)
        }
    
    def _calculate_article_vectors(self, articles_df: pd.DataFrame):
        """حساب متجهات المقالات كمتوسط كلماتها"""
        logger.info("📊 حساب متجهات المقالات...")
        
        for _, article in articles_df.iterrows():
            combined_text = f"{article.get('title', '')} {article.get('content', '')}"
            tokens = self.text_processor.tokenize(combined_text)
            
            # جمع المتجهات للكلمات الموجودة في النموذج
            word_vectors = []
            for token in tokens:
                if token in self.word2vec_model.wv:
                    word_vectors.append(self.word2vec_model.wv[token])
            
            # حساب متوسط المتجهات
            if word_vectors:
                article_vector = np.mean(word_vectors, axis=0)
                self.article_vectors[article['id']] = article_vector
    
    def get_similar_articles(self, article_id: str, n_similar: int = 10) -> List[Tuple[str, float]]:
        """العثور على مقالات مشابهة باستخدام Word2Vec"""
        if article_id not in self.article_vectors:
            return []
        
        target_vector = self.article_vectors[article_id]
        similarities = []
        
        for other_id, other_vector in self.article_vectors.items():
            if other_id != article_id:
                similarity = cosine_similarity([target_vector], [other_vector])[0][0]
                similarities.append((other_id, float(similarity)))
        
        # ترتيب حسب التشابه
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities[:n_similar]
    
    def find_similar_words(self, word: str, top_n: int = 10) -> List[Tuple[str, float]]:
        """العثور على كلمات مشابهة"""
        if self.word2vec_model is None or word not in self.word2vec_model.wv:
            return []
        
        try:
            similar_words = self.word2vec_model.wv.most_similar(word, topn=top_n)
            return similar_words
        except:
            return []


class ContentBasedRecommender:
    """
    نظام التوصية المحتوائية الموحد
    Unified Content-Based Recommendation System
    """
    
    def __init__(self, config: ContentFilteringConfig):
        self.config = config
        self.text_processor = ArabicTextProcessor(config)
        
        # المكونات المختلفة
        self.bert_extractor = None
        self.tfidf_extractor = None
        self.topic_model = None
        self.word2vec_model = None
        
        # بيانات المقالات
        self.articles_df = None
        self.article_features = {}
        
        # أوزان الطرق المختلفة
        self.method_weights = {
            'bert': 0.4,
            'tfidf': 0.3,
            'topics': 0.2,
            'word2vec': 0.1
        }
    
    def train_all_models(self, articles_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب جميع النماذج"""
        logger.info("🏭 بدء تدريب جميع نماذج التصفية المحتوائية...")
        
        self.articles_df = articles_df.copy()
        results = {}
        
        try:
            # تدريب BERT
            logger.info("1️⃣ تدريب مستخرج BERT...")
            self.bert_extractor = BERTContentExtractor(self.config)
            results['bert'] = {'status': 'success', 'model_type': 'BERT'}
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تدريب BERT: {str(e)}")
            results['bert'] = {'status': 'failed', 'error': str(e)}
        
        try:
            # تدريب TF-IDF
            logger.info("2️⃣ تدريب مستخرج TF-IDF...")
            self.tfidf_extractor = TFIDFContentExtractor(self.config)
            self.tfidf_extractor.fit_transform(articles_df)
            results['tfidf'] = {'status': 'success', 'model_type': 'TF-IDF'}
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تدريب TF-IDF: {str(e)}")
            results['tfidf'] = {'status': 'failed', 'error': str(e)}
        
        try:
            # تدريب نمذجة الموضوعات
            logger.info("3️⃣ تدريب نمذجة الموضوعات...")
            self.topic_model = TopicModelingEngine(self.config)
            if self.config.topic_model_type.upper() == 'LDA':
                topic_result = self.topic_model.train_lda_model(articles_df)
            else:
                topic_result = self.topic_model.train_nmf_model(articles_df)
            results['topics'] = topic_result
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تدريب نمذجة الموضوعات: {str(e)}")
            results['topics'] = {'status': 'failed', 'error': str(e)}
        
        try:
            # تدريب Word2Vec
            logger.info("4️⃣ تدريب Word2Vec...")
            self.word2vec_model = Word2VecContentModel(self.config)
            w2v_result = self.word2vec_model.train_word2vec(articles_df)
            results['word2vec'] = w2v_result
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في تدريب Word2Vec: {str(e)}")
            results['word2vec'] = {'status': 'failed', 'error': str(e)}
        
        logger.info("🎉 تم الانتهاء من تدريب جميع النماذج")
        return results
    
    def get_content_recommendations(self, user_articles: List[str], 
                                  n_recommendations: int = 10,
                                  exclude_articles: Optional[List[str]] = None) -> List[Tuple[str, float]]:
        """الحصول على توصيات محتوائية موحدة"""
        if not user_articles:
            return self._get_popular_articles(n_recommendations)
        
        # جمع التوصيات من الطرق المختلفة
        all_recommendations = {}
        total_weight = 0
        
        # توصيات TF-IDF
        if self.tfidf_extractor:
            try:
                tfidf_recs = self.tfidf_extractor.get_content_recommendations(
                    user_articles, n_recommendations * 2
                )
                self._merge_recommendations(all_recommendations, tfidf_recs, 
                                         self.method_weights['tfidf'])
                total_weight += self.method_weights['tfidf']
            except Exception as e:
                logger.warning(f"⚠️ فشل في الحصول على توصيات TF-IDF: {str(e)}")
        
        # توصيات Word2Vec
        if self.word2vec_model:
            try:
                w2v_recs = self._get_word2vec_recommendations(user_articles, n_recommendations * 2)
                self._merge_recommendations(all_recommendations, w2v_recs,
                                         self.method_weights['word2vec'])
                total_weight += self.method_weights['word2vec']
            except Exception as e:
                logger.warning(f"⚠️ فشل في الحصول على توصيات Word2Vec: {str(e)}")
        
        # توصيات الموضوعات
        if self.topic_model:
            try:
                topic_recs = self._get_topic_recommendations(user_articles, n_recommendations * 2)
                self._merge_recommendations(all_recommendations, topic_recs,
                                         self.method_weights['topics'])
                total_weight += self.method_weights['topics']
            except Exception as e:
                logger.warning(f"⚠️ فشل في الحصول على توصيات الموضوعات: {str(e)}")
        
        # تطبيع النقاط
        if total_weight > 0:
            for article_id in all_recommendations:
                all_recommendations[article_id] /= total_weight
        
        # استبعاد المقالات المحددة
        if exclude_articles:
            for article_id in exclude_articles:
                all_recommendations.pop(article_id, None)
        
        # ترتيب وإرجاع أفضل التوصيات
        sorted_recommendations = sorted(
            all_recommendations.items(),
            key=lambda x: x[1],
            reverse=True
        )[:n_recommendations]
        
        return sorted_recommendations
    
    def _merge_recommendations(self, all_recs: Dict[str, float], 
                             new_recs: List[Tuple[str, float]], weight: float):
        """دمج توصيات جديدة مع الموجودة"""
        for article_id, score in new_recs:
            if article_id not in all_recs:
                all_recs[article_id] = 0.0
            all_recs[article_id] += score * weight
    
    def _get_word2vec_recommendations(self, user_articles: List[str], 
                                    n_recommendations: int) -> List[Tuple[str, float]]:
        """الحصول على توصيات Word2Vec"""
        if not self.word2vec_model or not self.word2vec_model.article_vectors:
            return []
        
        # العثور على مقالات مشابهة لكل مقال للمستخدم
        all_similar = {}
        
        for article_id in user_articles:
            similar_articles = self.word2vec_model.get_similar_articles(
                article_id, n_recommendations
            )
            
            for sim_id, similarity in similar_articles:
                if sim_id not in all_similar:
                    all_similar[sim_id] = 0.0
                all_similar[sim_id] += similarity
        
        # تطبيع النقاط
        if user_articles:
            for article_id in all_similar:
                all_similar[article_id] /= len(user_articles)
        
        # ترتيب وإرجاع النتائج
        sorted_similar = sorted(all_similar.items(), key=lambda x: x[1], reverse=True)
        return sorted_similar[:n_recommendations]
    
    def _get_topic_recommendations(self, user_articles: List[str],
                                 n_recommendations: int) -> List[Tuple[str, float]]:
        """الحصول على توصيات بناءً على الموضوعات"""
        if not self.topic_model or self.topic_model.article_topics is None:
            return []
        
        # بناء ملف اهتمامات المستخدم بناءً على موضوعات مقالاته
        user_topic_profile = np.zeros(self.config.n_topics)
        article_count = 0
        
        for article_id in user_articles:
            if article_id in self.tfidf_extractor.article_ids:
                article_idx = self.tfidf_extractor.article_ids.index(article_id)
                if article_idx < len(self.topic_model.article_topics):
                    user_topic_profile += self.topic_model.article_topics[article_idx]
                    article_count += 1
        
        if article_count == 0:
            return []
        
        # تطبيع ملف المستخدم
        user_topic_profile /= article_count
        
        # حساب التشابه مع جميع المقالات
        similarities = cosine_similarity([user_topic_profile], 
                                       self.topic_model.article_topics).flatten()
        
        # إنشاء قائمة التوصيات
        recommendations = []
        for i, similarity in enumerate(similarities):
            if i < len(self.tfidf_extractor.article_ids):
                article_id = self.tfidf_extractor.article_ids[i]
                if article_id not in user_articles and similarity > 0.1:
                    recommendations.append((article_id, float(similarity)))
        
        # ترتيب حسب التشابه
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:n_recommendations]
    
    def _get_popular_articles(self, n_articles: int) -> List[Tuple[str, float]]:
        """الحصول على أكثر المقالات شعبية للمستخدمين الجدد"""
        if self.articles_df is None:
            return []
        
        # ترتيب حسب عدد المشاهدات أو التفاعلات
        if 'views' in self.articles_df.columns:
            popular = self.articles_df.nlargest(n_articles, 'views')
        elif 'interactions_count' in self.articles_df.columns:
            popular = self.articles_df.nlargest(n_articles, 'interactions_count')
        else:
            # ترتيب عشوائي إذا لم تتوفر بيانات الشعبية
            popular = self.articles_df.sample(min(n_articles, len(self.articles_df)))
        
        return [(row['id'], 1.0) for _, row in popular.iterrows()]
    
    def explain_recommendation(self, user_articles: List[str], 
                             recommended_article: str) -> Dict[str, Any]:
        """شرح سبب التوصية"""
        explanation = {
            'recommended_article': recommended_article,
            'user_articles': user_articles,
            'explanation_methods': []
        }
        
        # شرح TF-IDF
        if self.tfidf_extractor and len(user_articles) > 0:
            for user_article in user_articles[:3]:  # أول 3 مقالات
                tfidf_explanation = self.tfidf_extractor.explain_similarity(
                    user_article, recommended_article
                )
                if tfidf_explanation:
                    explanation['explanation_methods'].append({
                        'method': 'TF-IDF',
                        'base_article': user_article,
                        'similarity': tfidf_explanation['overall_similarity'],
                        'key_features': tfidf_explanation['top_contributing_features'][:5]
                    })
        
        # شرح الموضوعات
        if self.topic_model and recommended_article in self.tfidf_extractor.article_ids:
            rec_idx = self.tfidf_extractor.article_ids.index(recommended_article)
            rec_topics = self.topic_model.get_article_topics(recommended_article, rec_idx)
            
            explanation['topics'] = {
                'recommended_article_topics': rec_topics[:3],
                'topic_labels': [self.topic_model.topic_labels[t[0]] for t in rec_topics[:3]]
            }
        
        return explanation
    
    def save_models(self, base_path: str):
        """حفظ جميع النماذج"""
        logger.info(f"💾 حفظ النماذج في {base_path}")
        
        # حفظ TF-IDF
        if self.tfidf_extractor:
            joblib.dump(self.tfidf_extractor, f"{base_path}_tfidf.pkl")
        
        # حفظ Topic Model
        if self.topic_model:
            joblib.dump(self.topic_model, f"{base_path}_topics.pkl")
        
        # حفظ Word2Vec
        if self.word2vec_model and self.word2vec_model.word2vec_model:
            self.word2vec_model.word2vec_model.save(f"{base_path}_word2vec.model")
            joblib.dump(self.word2vec_model.article_vectors, f"{base_path}_article_vectors.pkl")
        
        # حفظ التكوين
        joblib.dump({
            'config': self.config,
            'method_weights': self.method_weights,
            'article_count': len(self.articles_df) if self.articles_df is not None else 0
        }, f"{base_path}_config.pkl")
        
        logger.info("✅ تم حفظ جميع النماذج")
    
    def load_models(self, base_path: str):
        """تحميل جميع النماذج"""
        logger.info(f"📂 تحميل النماذج من {base_path}")
        
        try:
            # تحميل التكوين
            config_data = joblib.load(f"{base_path}_config.pkl")
            self.config = config_data['config']
            self.method_weights = config_data['method_weights']
            
            # تحميل TF-IDF
            try:
                self.tfidf_extractor = joblib.load(f"{base_path}_tfidf.pkl")
            except:
                logger.warning("⚠️ فشل في تحميل نموذج TF-IDF")
            
            # تحميل Topic Model
            try:
                self.topic_model = joblib.load(f"{base_path}_topics.pkl")
            except:
                logger.warning("⚠️ فشل في تحميل نموذج الموضوعات")
            
            # تحميل Word2Vec
            try:
                self.word2vec_model = Word2VecContentModel(self.config)
                self.word2vec_model.word2vec_model = Word2Vec.load(f"{base_path}_word2vec.model")
                self.word2vec_model.article_vectors = joblib.load(f"{base_path}_article_vectors.pkl")
            except:
                logger.warning("⚠️ فشل في تحميل نموذج Word2Vec")
            
            # تحميل BERT
            try:
                self.bert_extractor = BERTContentExtractor(self.config)
            except:
                logger.warning("⚠️ فشل في تحميل نموذج BERT")
            
            logger.info("✅ تم تحميل النماذج")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل النماذج: {str(e)}")
            raise


# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد التكوين
    config = ContentFilteringConfig(
        n_topics=20,
        max_features=5000,
        topic_model_type="LDA"
    )
    
    # إنشاء بيانات تجريبية
    sample_articles = pd.DataFrame({
        'id': [f'article_{i}' for i in range(100)],
        'title': [f'عنوان المقال {i}' for i in range(100)],
        'content': [f'محتوى المقال {i} مع نص عربي مفصل' for i in range(100)],
        'category': np.random.choice(['سياسة', 'رياضة', 'اقتصاد', 'تقنية'], 100),
        'views': np.random.randint(100, 10000, 100)
    })
    
    # إنشاء وتدريب النموذج
    recommender = ContentBasedRecommender(config)
    results = recommender.train_all_models(sample_articles)
    
    print("🎯 نتائج التدريب:", results)
    
    # الحصول على توصيات
    user_articles = ['article_1', 'article_2', 'article_3']
    recommendations = recommender.get_content_recommendations(user_articles, n_recommendations=5)
    
    print("📝 التوصيات:", recommendations)
