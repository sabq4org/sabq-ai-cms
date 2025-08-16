# محرك التوصيات - خوارزميات التصفية التعاونية المتقدمة
# Collaborative Filtering Models for Sabq AI Recommendation Engine

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.decomposition import NMF, TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix, coo_matrix
import implicit
from typing import Dict, List, Tuple, Optional, Any
import logging
from datetime import datetime, timedelta
import joblib
import redis
import asyncio
from dataclasses import dataclass

# إعداد التسجيل بالعربية
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class RecommendationConfig:
    """إعدادات نموذج التوصيات"""
    n_factors: int = 128  # عدد العوامل الكامنة
    n_epochs: int = 100   # عدد دورات التدريب
    learning_rate: float = 0.001
    regularization: float = 0.01
    batch_size: int = 1024
    embedding_dim: int = 64
    negative_samples: int = 5
    min_rating: float = 1.0
    max_rating: float = 5.0

class MatrixFactorizationModel:
    """
    نموذج تفكيك المصفوفة للتصفية التعاونية
    Matrix Factorization for Collaborative Filtering
    """
    
    def __init__(self, config: RecommendationConfig):
        self.config = config
        self.user_embeddings = None
        self.item_embeddings = None
        self.user_biases = None
        self.item_biases = None
        self.global_bias = None
        self.n_users = 0
        self.n_items = 0
        self.user_mapping = {}
        self.item_mapping = {}
        self.reverse_user_mapping = {}
        self.reverse_item_mapping = {}
        
    def _prepare_data(self, interactions_df: pd.DataFrame) -> Tuple[np.ndarray, Dict]:
        """
        تحضير البيانات للتدريب
        Prepare data for training
        """
        logger.info("🔄 تحضير البيانات للتصفية التعاونية...")
        
        # إنشاء معاملات المستخدمين والعناصر
        unique_users = interactions_df['user_id'].unique()
        unique_items = interactions_df['article_id'].unique()
        
        self.user_mapping = {user: idx for idx, user in enumerate(unique_users)}
        self.item_mapping = {item: idx for idx, item in enumerate(unique_items)}
        self.reverse_user_mapping = {idx: user for user, idx in self.user_mapping.items()}
        self.reverse_item_mapping = {idx: item for item, idx in self.item_mapping.items()}
        
        self.n_users = len(unique_users)
        self.n_items = len(unique_items)
        
        # تحويل المعرفات إلى مؤشرات
        interactions_df['user_idx'] = interactions_df['user_id'].map(self.user_mapping)
        interactions_df['item_idx'] = interactions_df['article_id'].map(self.item_mapping)
        
        # إنشاء مصفوفة التفاعلات النادرة
        rows = interactions_df['user_idx'].values
        cols = interactions_df['item_idx'].values
        data = interactions_df['rating'].values
        
        interaction_matrix = csr_matrix((data, (rows, cols)), 
                                      shape=(self.n_users, self.n_items))
        
        logger.info(f"✅ تم تحضير البيانات: {self.n_users} مستخدم، {self.n_items} مقال")
        
        return interaction_matrix, {
            'user_mapping': self.user_mapping,
            'item_mapping': self.item_mapping,
            'n_users': self.n_users,
            'n_items': self.n_items
        }
    
    def _calculate_implicit_ratings(self, interactions_df: pd.DataFrame) -> pd.DataFrame:
        """
        حساب التقييمات الضمنية من سلوك المستخدم
        Calculate implicit ratings from user behavior
        """
        logger.info("📊 حساب التقييمات الضمنية...")
        
        # أوزان مختلفة لأنواع التفاعل المختلفة
        interaction_weights = {
            'view': 1.0,
            'like': 3.0,
            'save': 4.0,
            'share': 5.0,
            'comment': 4.5,
            'reading_time': 0.1  # لكل ثانية
        }
        
        # حساب النقاط لكل تفاعل
        def calculate_rating(row):
            base_score = interaction_weights.get(row['interaction_type'], 1.0)
            
            # إضافة مكافأة لوقت القراءة
            if 'reading_time' in row and pd.notna(row['reading_time']):
                base_score += row['reading_time'] * interaction_weights['reading_time']
            
            # إضافة مكافأة للقراءة العميقة
            if 'read_percentage' in row and pd.notna(row['read_percentage']):
                base_score *= (1 + row['read_percentage'] / 100)
            
            # تطبيق تراجع زمني (حداثة التفاعل)
            if 'created_at' in row:
                days_ago = (datetime.now() - pd.to_datetime(row['created_at'])).days
                time_decay = np.exp(-days_ago / 30)  # تراجع نصف عمر 30 يوم
                base_score *= time_decay
            
            return min(base_score, self.config.max_rating)
        
        interactions_df['rating'] = interactions_df.apply(calculate_rating, axis=1)
        
        # تجميع التقييمات لكل مستخدم-مقال
        aggregated = interactions_df.groupby(['user_id', 'article_id']).agg({
            'rating': 'sum',
            'created_at': 'max'
        }).reset_index()
        
        # تطبيع التقييمات
        aggregated['rating'] = np.clip(aggregated['rating'], 
                                     self.config.min_rating, 
                                     self.config.max_rating)
        
        logger.info(f"✅ تم حساب {len(aggregated)} تقييم ضمني")
        return aggregated
    
    def train_nmf(self, interactions_df: pd.DataFrame) -> Dict[str, Any]:
        """
        تدريب نموذج Non-negative Matrix Factorization
        Train NMF model
        """
        logger.info("🤖 بدء تدريب نموذج NMF...")
        
        # تحضير البيانات
        processed_interactions = self._calculate_implicit_ratings(interactions_df)
        interaction_matrix, metadata = self._prepare_data(processed_interactions)
        
        # تدريب نموذج NMF
        nmf_model = NMF(
            n_components=self.config.n_factors,
            init='random',
            max_iter=self.config.n_epochs,
            alpha=self.config.regularization,
            random_state=42
        )
        
        # تحويل إلى مصفوفة كثيفة للـ NMF
        dense_matrix = interaction_matrix.toarray()
        
        # التدريب
        user_features = nmf_model.fit_transform(dense_matrix)
        item_features = nmf_model.components_.T
        
        # حفظ النموذج
        self.user_embeddings = user_features
        self.item_embeddings = item_features
        
        # حساب الانحيازات
        self._calculate_biases(processed_interactions)
        
        # تقييم النموذج
        train_rmse = self._calculate_rmse(interaction_matrix, user_features, item_features)
        
        logger.info(f"✅ تم الانتهاء من تدريب NMF - RMSE: {train_rmse:.4f}")
        
        return {
            'model_type': 'NMF',
            'train_rmse': train_rmse,
            'n_factors': self.config.n_factors,
            'n_users': self.n_users,
            'n_items': self.n_items,
            'metadata': metadata
        }
    
    def train_als(self, interactions_df: pd.DataFrame) -> Dict[str, Any]:
        """
        تدريب نموذج Alternating Least Squares
        Train ALS model using implicit library
        """
        logger.info("🤖 بدء تدريب نموذج ALS...")
        
        # تحضير البيانات
        processed_interactions = self._calculate_implicit_ratings(interactions_df)
        interaction_matrix, metadata = self._prepare_data(processed_interactions)
        
        # تحويل إلى تنسيق مناسب لـ implicit library
        # implicit يتوقع مصفوفة (item x user) بدلاً من (user x item)
        item_user_matrix = interaction_matrix.T.tocsr()
        
        # إنشاء وتدريب نموذج ALS
        als_model = implicit.als.AlternatingLeastSquares(
            factors=self.config.n_factors,
            iterations=self.config.n_epochs,
            regularization=self.config.regularization,
            random_state=42
        )
        
        # تدريب النموذج
        als_model.fit(item_user_matrix, show_progress=True)
        
        # استخراج التضمينات
        self.user_embeddings = als_model.user_factors
        self.item_embeddings = als_model.item_factors
        
        # حساب الانحيازات
        self._calculate_biases(processed_interactions)
        
        # تقييم النموذج
        train_rmse = self._calculate_rmse(interaction_matrix, 
                                        self.user_embeddings, 
                                        self.item_embeddings)
        
        logger.info(f"✅ تم الانتهاء من تدريب ALS - RMSE: {train_rmse:.4f}")
        
        return {
            'model_type': 'ALS',
            'train_rmse': train_rmse,
            'n_factors': self.config.n_factors,
            'n_users': self.n_users,
            'n_items': self.n_items,
            'metadata': metadata,
            'implicit_model': als_model
        }
    
    def _calculate_biases(self, interactions_df: pd.DataFrame):
        """حساب انحيازات المستخدمين والعناصر"""
        # حساب المتوسط العام
        self.global_bias = interactions_df['rating'].mean()
        
        # حساب انحياز المستخدمين
        user_means = interactions_df.groupby('user_id')['rating'].mean()
        self.user_biases = np.zeros(self.n_users)
        for user_id, mean_rating in user_means.items():
            if user_id in self.user_mapping:
                user_idx = self.user_mapping[user_id]
                self.user_biases[user_idx] = mean_rating - self.global_bias
        
        # حساب انحياز العناصر
        item_means = interactions_df.groupby('article_id')['rating'].mean()
        self.item_biases = np.zeros(self.n_items)
        for item_id, mean_rating in item_means.items():
            if item_id in self.item_mapping:
                item_idx = self.item_mapping[item_id]
                self.item_biases[item_idx] = mean_rating - self.global_bias
    
    def _calculate_rmse(self, interaction_matrix: csr_matrix, 
                       user_features: np.ndarray, 
                       item_features: np.ndarray) -> float:
        """حساب RMSE للنموذج"""
        predictions = user_features @ item_features.T
        
        # إضافة الانحيازات إذا كانت متاحة
        if self.user_biases is not None and self.item_biases is not None:
            predictions += self.global_bias
            predictions += self.user_biases[:, np.newaxis]
            predictions += self.item_biases[np.newaxis, :]
        
        # حساب RMSE للتفاعلات المعروفة فقط
        coo = interaction_matrix.tocoo()
        actual = coo.data
        predicted = predictions[coo.row, coo.col]
        
        rmse = np.sqrt(np.mean((actual - predicted) ** 2))
        return rmse
    
    def predict(self, user_id: str, item_id: str) -> float:
        """
        التنبؤ بتقييم مستخدم لمقال معين
        Predict rating for user-item pair
        """
        if user_id not in self.user_mapping or item_id not in self.item_mapping:
            return self.global_bias if self.global_bias is not None else 0.0
        
        user_idx = self.user_mapping[user_id]
        item_idx = self.item_mapping[item_id]
        
        # التنبؤ الأساسي
        prediction = np.dot(self.user_embeddings[user_idx], 
                          self.item_embeddings[item_idx])
        
        # إضافة الانحيازات
        if self.global_bias is not None:
            prediction += self.global_bias
        if self.user_biases is not None:
            prediction += self.user_biases[user_idx]
        if self.item_biases is not None:
            prediction += self.item_biases[item_idx]
        
        return np.clip(prediction, self.config.min_rating, self.config.max_rating)
    
    def get_user_recommendations(self, user_id: str, n_recommendations: int = 10,
                               exclude_seen: bool = True, 
                               seen_items: Optional[List[str]] = None) -> List[Tuple[str, float]]:
        """
        الحصول على توصيات للمستخدم
        Get recommendations for a user
        """
        if user_id not in self.user_mapping:
            # مستخدم جديد - إرجاع المقالات الأكثر شعبية
            return self._get_popular_items(n_recommendations)
        
        user_idx = self.user_mapping[user_id]
        
        # حساب النقاط لجميع المقالات
        scores = np.dot(self.user_embeddings[user_idx], self.item_embeddings.T)
        
        # إضافة الانحيازات
        if self.global_bias is not None:
            scores += self.global_bias
        if self.user_biases is not None:
            scores += self.user_biases[user_idx]
        if self.item_biases is not None:
            scores += self.item_biases
        
        # استبعاد المقالات المرئية مسبقاً
        if exclude_seen and seen_items:
            for item_id in seen_items:
                if item_id in self.item_mapping:
                    item_idx = self.item_mapping[item_id]
                    scores[item_idx] = -np.inf
        
        # ترتيب وإرجاع أفضل التوصيات
        top_indices = np.argsort(scores)[::-1][:n_recommendations]
        recommendations = []
        
        for idx in top_indices:
            if scores[idx] > -np.inf:
                item_id = self.reverse_item_mapping[idx]
                score = scores[idx]
                recommendations.append((item_id, float(score)))
        
        return recommendations
    
    def _get_popular_items(self, n_items: int) -> List[Tuple[str, float]]:
        """الحصول على أكثر المقالات شعبية للمستخدمين الجدد"""
        if self.item_biases is not None:
            popular_indices = np.argsort(self.item_biases)[::-1][:n_items]
            return [(self.reverse_item_mapping[idx], float(self.item_biases[idx])) 
                   for idx in popular_indices]
        return []
    
    def get_similar_users(self, user_id: str, n_similar: int = 10) -> List[Tuple[str, float]]:
        """العثور على مستخدمين مشابهين"""
        if user_id not in self.user_mapping:
            return []
        
        user_idx = self.user_mapping[user_id]
        user_vector = self.user_embeddings[user_idx]
        
        # حساب التشابه الكوساني
        similarities = cosine_similarity([user_vector], self.user_embeddings)[0]
        
        # ترتيب المستخدمين حسب التشابه
        similar_indices = np.argsort(similarities)[::-1][1:n_similar+1]  # استبعاد المستخدم نفسه
        
        similar_users = []
        for idx in similar_indices:
            similar_user_id = self.reverse_user_mapping[idx]
            similarity = similarities[idx]
            similar_users.append((similar_user_id, float(similarity)))
        
        return similar_users
    
    def get_similar_items(self, item_id: str, n_similar: int = 10) -> List[Tuple[str, float]]:
        """العثور على مقالات مشابهة"""
        if item_id not in self.item_mapping:
            return []
        
        item_idx = self.item_mapping[item_id]
        item_vector = self.item_embeddings[item_idx]
        
        # حساب التشابه الكوساني
        similarities = cosine_similarity([item_vector], self.item_embeddings)[0]
        
        # ترتيب المقالات حسب التشابه
        similar_indices = np.argsort(similarities)[::-1][1:n_similar+1]  # استبعاد المقال نفسه
        
        similar_items = []
        for idx in similar_indices:
            similar_item_id = self.reverse_item_mapping[idx]
            similarity = similarities[idx]
            similar_items.append((similar_item_id, float(similarity)))
        
        return similar_items
    
    def save_model(self, filepath: str):
        """حفظ النموذج"""
        model_data = {
            'config': self.config,
            'user_embeddings': self.user_embeddings,
            'item_embeddings': self.item_embeddings,
            'user_biases': self.user_biases,
            'item_biases': self.item_biases,
            'global_bias': self.global_bias,
            'n_users': self.n_users,
            'n_items': self.n_items,
            'user_mapping': self.user_mapping,
            'item_mapping': self.item_mapping,
            'reverse_user_mapping': self.reverse_user_mapping,
            'reverse_item_mapping': self.reverse_item_mapping
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"💾 تم حفظ النموذج في {filepath}")
    
    def load_model(self, filepath: str):
        """تحميل النموذج"""
        model_data = joblib.load(filepath)
        
        self.config = model_data['config']
        self.user_embeddings = model_data['user_embeddings']
        self.item_embeddings = model_data['item_embeddings']
        self.user_biases = model_data['user_biases']
        self.item_biases = model_data['item_biases']
        self.global_bias = model_data['global_bias']
        self.n_users = model_data['n_users']
        self.n_items = model_data['n_items']
        self.user_mapping = model_data['user_mapping']
        self.item_mapping = model_data['item_mapping']
        self.reverse_user_mapping = model_data['reverse_user_mapping']
        self.reverse_item_mapping = model_data['reverse_item_mapping']
        
        logger.info(f"📂 تم تحميل النموذج من {filepath}")


class NeuralCollaborativeFiltering:
    """
    نموذج التصفية التعاونية العصبية
    Neural Collaborative Filtering using Deep Learning
    """
    
    def __init__(self, config: RecommendationConfig):
        self.config = config
        self.model = None
        self.user_mapping = {}
        self.item_mapping = {}
        self.n_users = 0
        self.n_items = 0
        self.history = None
    
    def _build_model(self) -> keras.Model:
        """بناء نموذج التصفية التعاونية العصبية"""
        
        # مدخلات المستخدم والمقال
        user_input = layers.Input(shape=(), name='user_id')
        item_input = layers.Input(shape=(), name='item_id')
        
        # طبقات التضمين
        user_embedding = layers.Embedding(
            self.n_users, 
            self.config.embedding_dim,
            name='user_embedding'
        )(user_input)
        
        item_embedding = layers.Embedding(
            self.n_items,
            self.config.embedding_dim, 
            name='item_embedding'
        )(item_input)
        
        # تسطيح التضمينات
        user_vec = layers.Flatten()(user_embedding)
        item_vec = layers.Flatten()(item_embedding)
        
        # الضرب النقطي (GMF - Generalized Matrix Factorization)
        gmf_output = layers.Multiply()([user_vec, item_vec])
        
        # الشبكة العصبية متعددة الطبقات (MLP)
        mlp_concat = layers.Concatenate()([user_vec, item_vec])
        mlp_layer1 = layers.Dense(256, activation='relu')(mlp_concat)
        mlp_layer1 = layers.Dropout(0.2)(mlp_layer1)
        mlp_layer2 = layers.Dense(128, activation='relu')(mlp_layer1)
        mlp_layer2 = layers.Dropout(0.2)(mlp_layer2)
        mlp_layer3 = layers.Dense(64, activation='relu')(mlp_layer2)
        mlp_output = layers.Dense(self.config.embedding_dim, activation='relu')(mlp_layer3)
        
        # دمج GMF و MLP
        concat_output = layers.Concatenate()([gmf_output, mlp_output])
        
        # طبقة الإخراج النهائية
        final_layer = layers.Dense(32, activation='relu')(concat_output)
        final_layer = layers.Dropout(0.1)(final_layer)
        output = layers.Dense(1, activation='sigmoid')(final_layer)
        
        # إنشاء النموذج
        model = keras.Model(
            inputs=[user_input, item_input],
            outputs=output,
            name='NeuralCollaborativeFiltering'
        )
        
        return model
    
    def _prepare_training_data(self, interactions_df: pd.DataFrame) -> Tuple[Dict, np.ndarray]:
        """تحضير بيانات التدريب"""
        logger.info("🔄 تحضير بيانات التدريب للـ NCF...")
        
        # إنشاء التعيينات
        unique_users = interactions_df['user_id'].unique()
        unique_items = interactions_df['article_id'].unique()
        
        self.user_mapping = {user: idx for idx, user in enumerate(unique_users)}
        self.item_mapping = {item: idx for idx, item in enumerate(unique_items)}
        
        self.n_users = len(unique_users)
        self.n_items = len(unique_items)
        
        # تحويل البيانات
        interactions_df['user_idx'] = interactions_df['user_id'].map(self.user_mapping)
        interactions_df['item_idx'] = interactions_df['article_id'].map(self.item_mapping)
        
        # إنشاء عينات سلبية
        positive_interactions = set(zip(interactions_df['user_idx'], interactions_df['item_idx']))
        negative_samples = []
        
        logger.info("🔄 إنشاء العينات السلبية...")
        for _ in range(len(interactions_df) * self.config.negative_samples):
            user_idx = np.random.randint(0, self.n_users)
            item_idx = np.random.randint(0, self.n_items)
            
            if (user_idx, item_idx) not in positive_interactions:
                negative_samples.append((user_idx, item_idx, 0.0))
        
        # دمج العينات الإيجابية والسلبية
        positive_data = [(row['user_idx'], row['item_idx'], 1.0) 
                        for _, row in interactions_df.iterrows()]
        
        all_data = positive_data + negative_samples
        np.random.shuffle(all_data)
        
        # تحويل إلى arrays
        users = np.array([d[0] for d in all_data])
        items = np.array([d[1] for d in all_data])
        ratings = np.array([d[2] for d in all_data])
        
        return {'user_id': users, 'item_id': items}, ratings
    
    def train(self, interactions_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب النموذج"""
        logger.info("🤖 بدء تدريب نموذج NCF...")
        
        # تحضير البيانات
        X, y = self._prepare_training_data(interactions_df)
        
        # بناء النموذج
        self.model = self._build_model()
        
        # تكوين النموذج
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.config.learning_rate),
            loss='binary_crossentropy',
            metrics=['mae', 'mse']
        )
        
        # عرض معمارية النموذج
        self.model.summary()
        
        # تدريب النموذج
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-6
            )
        ]
        
        self.history = self.model.fit(
            X, y,
            batch_size=self.config.batch_size,
            epochs=self.config.n_epochs,
            validation_split=0.2,
            callbacks=callbacks,
            verbose=1
        )
        
        # تقييم النموذج
        train_loss = min(self.history.history['loss'])
        val_loss = min(self.history.history['val_loss'])
        
        logger.info(f"✅ تم الانتهاء من تدريب NCF - Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
        
        return {
            'model_type': 'NCF',
            'train_loss': train_loss,
            'val_loss': val_loss,
            'n_users': self.n_users,
            'n_items': self.n_items,
            'history': self.history.history
        }
    
    def predict(self, user_id: str, item_id: str) -> float:
        """التنبؤ بتقييم مستخدم لمقال"""
        if (user_id not in self.user_mapping or 
            item_id not in self.item_mapping or 
            self.model is None):
            return 0.5  # تقييم افتراضي
        
        user_idx = self.user_mapping[user_id]
        item_idx = self.item_mapping[item_id]
        
        prediction = self.model.predict(
            {'user_id': np.array([user_idx]), 'item_id': np.array([item_idx])},
            verbose=0
        )[0][0]
        
        return float(prediction)
    
    def get_user_recommendations(self, user_id: str, n_recommendations: int = 10,
                               exclude_seen: bool = True,
                               seen_items: Optional[List[str]] = None) -> List[Tuple[str, float]]:
        """الحصول على توصيات للمستخدم"""
        if user_id not in self.user_mapping or self.model is None:
            return []
        
        user_idx = self.user_mapping[user_id]
        
        # تحضير جميع المقالات للتنبؤ
        all_items = list(self.item_mapping.keys())
        if exclude_seen and seen_items:
            all_items = [item for item in all_items if item not in seen_items]
        
        if not all_items:
            return []
        
        # التنبؤ لجميع المقالات
        user_indices = [user_idx] * len(all_items)
        item_indices = [self.item_mapping[item] for item in all_items]
        
        predictions = self.model.predict(
            {'user_id': np.array(user_indices), 'item_id': np.array(item_indices)},
            verbose=0
        ).flatten()
        
        # ترتيب التوصيات
        item_scores = list(zip(all_items, predictions))
        item_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [(item, float(score)) for item, score in item_scores[:n_recommendations]]
    
    def save_model(self, filepath: str):
        """حفظ النموذج"""
        if self.model is not None:
            self.model.save(f"{filepath}_keras_model.h5")
        
        metadata = {
            'config': self.config,
            'user_mapping': self.user_mapping,
            'item_mapping': self.item_mapping,
            'n_users': self.n_users,
            'n_items': self.n_items,
            'history': self.history.history if self.history else None
        }
        
        joblib.dump(metadata, f"{filepath}_metadata.pkl")
        logger.info(f"💾 تم حفظ نموذج NCF في {filepath}")
    
    def load_model(self, filepath: str):
        """تحميل النموذج"""
        self.model = keras.models.load_model(f"{filepath}_keras_model.h5")
        metadata = joblib.load(f"{filepath}_metadata.pkl")
        
        self.config = metadata['config']
        self.user_mapping = metadata['user_mapping']
        self.item_mapping = metadata['item_mapping']
        self.n_users = metadata['n_users']
        self.n_items = metadata['n_items']
        
        logger.info(f"📂 تم تحميل نموذج NCF من {filepath}")


class CollaborativeFilteringEnsemble:
    """
    مجموعة نماذج التصفية التعاونية
    Ensemble of Collaborative Filtering Models
    """
    
    def __init__(self, config: RecommendationConfig):
        self.config = config
        self.models = {}
        self.weights = {}
        self.performance_metrics = {}
    
    def add_model(self, name: str, model: Any, weight: float = 1.0):
        """إضافة نموذج للمجموعة"""
        self.models[name] = model
        self.weights[name] = weight
        logger.info(f"➕ تم إضافة النموذج {name} بوزن {weight}")
    
    def train_all_models(self, interactions_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب جميع النماذج في المجموعة"""
        logger.info("🏭 بدء تدريب مجموعة نماذج التصفية التعاونية...")
        
        results = {}
        
        for name, model in self.models.items():
            logger.info(f"🔄 تدريب النموذج: {name}")
            
            try:
                if isinstance(model, MatrixFactorizationModel):
                    if name.lower().contains('als'):
                        result = model.train_als(interactions_df)
                    else:
                        result = model.train_nmf(interactions_df)
                elif isinstance(model, NeuralCollaborativeFiltering):
                    result = model.train(interactions_df)
                else:
                    logger.warning(f"⚠️ نوع نموذج غير مدعوم: {type(model)}")
                    continue
                
                results[name] = result
                self.performance_metrics[name] = result
                
                logger.info(f"✅ تم الانتهاء من تدريب {name}")
                
            except Exception as e:
                logger.error(f"❌ فشل في تدريب النموذج {name}: {str(e)}")
                continue
        
        logger.info("🎉 تم الانتهاء من تدريب جميع النماذج")
        return results
    
    def get_ensemble_recommendations(self, user_id: str, n_recommendations: int = 10,
                                   exclude_seen: bool = True,
                                   seen_items: Optional[List[str]] = None) -> List[Tuple[str, float]]:
        """الحصول على توصيات مجمعة من جميع النماذج"""
        if not self.models:
            return []
        
        # جمع التوصيات من جميع النماذج
        all_recommendations = {}
        total_weight = 0
        
        for name, model in self.models.items():
            try:
                recommendations = model.get_user_recommendations(
                    user_id=user_id,
                    n_recommendations=n_recommendations * 2,  # جلب المزيد للتنويع
                    exclude_seen=exclude_seen,
                    seen_items=seen_items
                )
                
                weight = self.weights[name]
                total_weight += weight
                
                for item_id, score in recommendations:
                    if item_id not in all_recommendations:
                        all_recommendations[item_id] = 0.0
                    all_recommendations[item_id] += score * weight
                
            except Exception as e:
                logger.warning(f"⚠️ فشل في الحصول على توصيات من {name}: {str(e)}")
                continue
        
        # تطبيع النقاط
        if total_weight > 0:
            for item_id in all_recommendations:
                all_recommendations[item_id] /= total_weight
        
        # ترتيب وإرجاع أفضل التوصيات
        sorted_recommendations = sorted(
            all_recommendations.items(),
            key=lambda x: x[1],
            reverse=True
        )[:n_recommendations]
        
        return sorted_recommendations
    
    def optimize_weights(self, validation_data: pd.DataFrame) -> Dict[str, float]:
        """تحسين أوزان النماذج بناءً على بيانات التحقق"""
        logger.info("🎯 تحسين أوزان النماذج...")
        
        # يمكن تطبيق خوارزمية تحسين معقدة هنا
        # للبساطة، سنستخدم أداء كل نموذج على بيانات التحقق
        
        best_weights = {}
        for name in self.models.keys():
            # حساب أداء النموذج (مبسط)
            if name in self.performance_metrics:
                metrics = self.performance_metrics[name]
                if 'train_rmse' in metrics:
                    # وزن أكبر للنماذج ذات الـ RMSE الأقل
                    best_weights[name] = 1.0 / (1.0 + metrics['train_rmse'])
                elif 'val_loss' in metrics:
                    # وزن أكبر للنماذج ذات الـ loss الأقل
                    best_weights[name] = 1.0 / (1.0 + metrics['val_loss'])
                else:
                    best_weights[name] = 1.0
            else:
                best_weights[name] = 1.0
        
        # تطبيع الأوزان
        total_weight = sum(best_weights.values())
        if total_weight > 0:
            for name in best_weights:
                best_weights[name] /= total_weight
        
        self.weights = best_weights
        logger.info(f"✅ تم تحسين الأوزان: {self.weights}")
        
        return best_weights
    
    def get_model_performance(self) -> Dict[str, Any]:
        """الحصول على مقاييس أداء جميع النماذج"""
        return self.performance_metrics.copy()


# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد التكوين
    config = RecommendationConfig(
        n_factors=64,
        n_epochs=50,
        learning_rate=0.001,
        batch_size=512
    )
    
    # إنشاء بيانات تجريبية
    sample_data = pd.DataFrame({
        'user_id': ['user1', 'user2', 'user3'] * 100,
        'article_id': ['article1', 'article2', 'article3'] * 100,
        'interaction_type': ['view', 'like', 'share'] * 100,
        'reading_time': np.random.randint(10, 300, 300),
        'read_percentage': np.random.randint(20, 100, 300),
        'created_at': pd.date_range('2024-01-01', periods=300, freq='H')
    })
    
    # إنشاء وتدريب النماذج
    ensemble = CollaborativeFilteringEnsemble(config)
    
    # إضافة نماذج مختلفة
    mf_als = MatrixFactorizationModel(config)
    mf_nmf = MatrixFactorizationModel(config)
    ncf = NeuralCollaborativeFiltering(config)
    
    ensemble.add_model('ALS', mf_als, weight=0.4)
    ensemble.add_model('NMF', mf_nmf, weight=0.3)
    ensemble.add_model('NCF', ncf, weight=0.3)
    
    # تدريب جميع النماذج
    results = ensemble.train_all_models(sample_data)
    
    # الحصول على توصيات
    recommendations = ensemble.get_ensemble_recommendations('user1', n_recommendations=5)
    print("🎯 التوصيات:", recommendations)
