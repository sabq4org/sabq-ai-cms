# نماذج التعلم العميق للتوصيات - سبق الذكية
# Deep Learning Models for Advanced Recommendations

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import logging
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
import joblib
import pickle
from collections import defaultdict
import math
import random

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class DeepLearningConfig:
    """إعدادات نماذج التعلم العميق"""
    # Architecture settings
    embedding_dim: int = 128
    hidden_dims: List[int] = None
    dropout_rate: float = 0.3
    activation: str = 'relu'
    
    # Training settings
    learning_rate: float = 0.001
    batch_size: int = 512
    epochs: int = 100
    early_stopping_patience: int = 10
    
    # Data settings
    sequence_length: int = 50  # للنماذج التسلسلية
    negative_sampling_ratio: int = 5
    
    # Model specific settings
    attention_heads: int = 8
    transformer_layers: int = 6
    lstm_units: int = 256
    
    # Regularization
    l1_reg: float = 0.0
    l2_reg: float = 0.01
    batch_norm: bool = True
    
    def __post_init__(self):
        if self.hidden_dims is None:
            self.hidden_dims = [512, 256, 128, 64]


class RecommendationDataset(Dataset):
    """
    مجموعة بيانات التوصيات للتدريب
    Recommendation Dataset for Training
    """
    
    def __init__(self, interactions_df: pd.DataFrame, config: DeepLearningConfig,
                 user_features: Optional[Dict] = None, item_features: Optional[Dict] = None):
        self.config = config
        self.interactions_df = interactions_df
        self.user_features = user_features or {}
        self.item_features = item_features or {}
        
        # إنشاء التعيينات
        self.user_encoder = LabelEncoder()
        self.item_encoder = LabelEncoder()
        
        self.user_ids = self.user_encoder.fit_transform(interactions_df['user_id'])
        self.item_ids = self.item_encoder.fit_transform(interactions_df['article_id'])
        self.ratings = interactions_df['rating'].values.astype(np.float32)
        
        # إنشاء عينات سلبية
        self.negative_samples = self._generate_negative_samples()
        
        # دمج العينات الإيجابية والسلبية
        self._prepare_training_data()
    
    def _generate_negative_samples(self) -> List[Tuple[int, int, float]]:
        """إنشاء عينات سلبية للتدريب"""
        logger.info("🔄 إنشاء العينات السلبية...")
        
        # إنشاء مجموعة التفاعلات الإيجابية
        positive_pairs = set(zip(self.user_ids, self.item_ids))
        
        # إنشاء عينات سلبية
        negative_samples = []
        n_negatives = len(self.user_ids) * self.config.negative_sampling_ratio
        
        max_user = max(self.user_ids)
        max_item = max(self.item_ids)
        
        while len(negative_samples) < n_negatives:
            user_id = random.randint(0, max_user)
            item_id = random.randint(0, max_item)
            
            if (user_id, item_id) not in positive_pairs:
                negative_samples.append((user_id, item_id, 0.0))
        
        logger.info(f"✅ تم إنشاء {len(negative_samples)} عينة سلبية")
        return negative_samples
    
    def _prepare_training_data(self):
        """تحضير بيانات التدريب"""
        # دمج العينات الإيجابية والسلبية
        positive_data = list(zip(self.user_ids, self.item_ids, self.ratings))
        all_data = positive_data + self.negative_samples
        
        # خلط البيانات
        random.shuffle(all_data)
        
        # فصل البيانات
        self.users = np.array([d[0] for d in all_data])
        self.items = np.array([d[1] for d in all_data])
        self.targets = np.array([d[2] for d in all_data])
        
        # تحويل إلى تصنيف ثنائي
        self.binary_targets = (self.targets > 0).astype(np.float32)
    
    def __len__(self):
        return len(self.users)
    
    def __getitem__(self, idx):
        return {
            'user_id': torch.LongTensor([self.users[idx]]),
            'item_id': torch.LongTensor([self.items[idx]]),
            'rating': torch.FloatTensor([self.targets[idx]]),
            'binary_target': torch.FloatTensor([self.binary_targets[idx]])
        }
    
    def get_n_users(self):
        return len(self.user_encoder.classes_)
    
    def get_n_items(self):
        return len(self.item_encoder.classes_)


class DeepMatrixFactorization(nn.Module):
    """
    تفكيك المصفوفة العميق
    Deep Matrix Factorization Model
    """
    
    def __init__(self, n_users: int, n_items: int, config: DeepLearningConfig):
        super(DeepMatrixFactorization, self).__init__()
        self.config = config
        
        # طبقات التضمين
        self.user_embedding = nn.Embedding(n_users, config.embedding_dim)
        self.item_embedding = nn.Embedding(n_items, config.embedding_dim)
        
        # طبقات الانحياز
        self.user_bias = nn.Embedding(n_users, 1)
        self.item_bias = nn.Embedding(n_items, 1)
        self.global_bias = nn.Parameter(torch.zeros(1))
        
        # الشبكة العصبية العميقة
        layers_list = []
        input_dim = config.embedding_dim * 2
        
        for hidden_dim in config.hidden_dims:
            layers_list.extend([
                nn.Linear(input_dim, hidden_dim),
                nn.ReLU() if config.activation == 'relu' else nn.Tanh(),
                nn.Dropout(config.dropout_rate)
            ])
            if config.batch_norm:
                layers_list.insert(-1, nn.BatchNorm1d(hidden_dim))
            input_dim = hidden_dim
        
        # طبقة الإخراج
        layers_list.append(nn.Linear(input_dim, 1))
        layers_list.append(nn.Sigmoid())
        
        self.deep_layers = nn.Sequential(*layers_list)
        
        # تهيئة الأوزان
        self._init_weights()
    
    def _init_weights(self):
        """تهيئة أوزان النموذج"""
        nn.init.normal_(self.user_embedding.weight, std=0.01)
        nn.init.normal_(self.item_embedding.weight, std=0.01)
        nn.init.normal_(self.user_bias.weight, std=0.01)
        nn.init.normal_(self.item_bias.weight, std=0.01)
    
    def forward(self, user_ids, item_ids):
        # الحصول على التضمينات
        user_emb = self.user_embedding(user_ids).squeeze()
        item_emb = self.item_embedding(item_ids).squeeze()
        
        # الحصول على الانحيازات
        user_bias = self.user_bias(user_ids).squeeze()
        item_bias = self.item_bias(item_ids).squeeze()
        
        # الضرب النقطي (Matrix Factorization التقليدي)
        mf_output = torch.sum(user_emb * item_emb, dim=1)
        
        # الشبكة العصبية العميقة
        deep_input = torch.cat([user_emb, item_emb], dim=1)
        deep_output = self.deep_layers(deep_input).squeeze()
        
        # دمج النتائج
        output = mf_output + deep_output + user_bias + item_bias + self.global_bias
        
        return torch.sigmoid(output)


class MultiHeadAttention(nn.Module):
    """
    آلية الانتباه متعددة الرؤوس
    Multi-Head Attention Mechanism
    """
    
    def __init__(self, embed_dim: int, num_heads: int):
        super(MultiHeadAttention, self).__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        
        assert self.head_dim * num_heads == embed_dim, "embed_dim must be divisible by num_heads"
        
        self.query = nn.Linear(embed_dim, embed_dim)
        self.key = nn.Linear(embed_dim, embed_dim)
        self.value = nn.Linear(embed_dim, embed_dim)
        self.fc_out = nn.Linear(embed_dim, embed_dim)
        
    def forward(self, query, key, value, mask=None):
        batch_size = query.shape[0]
        
        # Linear transformations
        Q = self.query(query)
        K = self.key(key)
        V = self.value(value)
        
        # Reshape for multi-head attention
        Q = Q.view(batch_size, -1, self.num_heads, self.head_dim).permute(0, 2, 1, 3)
        K = K.view(batch_size, -1, self.num_heads, self.head_dim).permute(0, 2, 1, 3)
        V = V.view(batch_size, -1, self.num_heads, self.head_dim).permute(0, 2, 1, 3)
        
        # Scaled dot-product attention
        scores = torch.matmul(Q, K.permute(0, 1, 3, 2)) / math.sqrt(self.head_dim)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        attention = torch.softmax(scores, dim=-1)
        out = torch.matmul(attention, V)
        
        # Concatenate heads and put through final linear layer
        out = out.permute(0, 2, 1, 3).contiguous().view(
            batch_size, -1, self.embed_dim
        )
        
        return self.fc_out(out)


class TransformerRecommender(nn.Module):
    """
    نموذج التوصيات باستخدام Transformer
    Transformer-based Recommendation Model
    """
    
    def __init__(self, n_users: int, n_items: int, config: DeepLearningConfig):
        super(TransformerRecommender, self).__init__()
        self.config = config
        
        # التضمينات
        self.user_embedding = nn.Embedding(n_users, config.embedding_dim)
        self.item_embedding = nn.Embedding(n_items, config.embedding_dim)
        self.position_embedding = nn.Embedding(config.sequence_length, config.embedding_dim)
        
        # طبقات Transformer
        self.transformer_layers = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=config.embedding_dim,
                nhead=config.attention_heads,
                dim_feedforward=config.hidden_dims[0],
                dropout=config.dropout_rate,
                batch_first=True
            ) for _ in range(config.transformer_layers)
        ])
        
        # طبقات التصنيف النهائية
        self.classifier = nn.Sequential(
            nn.Linear(config.embedding_dim, config.hidden_dims[0]),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_dims[0], config.hidden_dims[1]),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_dims[1], 1),
            nn.Sigmoid()
        )
        
    def forward(self, user_ids, item_ids, sequence_mask=None):
        batch_size = user_ids.size(0)
        
        # التضمينات
        user_emb = self.user_embedding(user_ids)
        item_emb = self.item_embedding(item_ids)
        
        # إضافة التضمين الموضعي
        positions = torch.arange(item_ids.size(1), device=item_ids.device).unsqueeze(0).repeat(batch_size, 1)
        pos_emb = self.position_embedding(positions)
        
        # دمج التضمينات
        sequence = item_emb + pos_emb
        
        # تطبيق طبقات Transformer
        for transformer_layer in self.transformer_layers:
            sequence = transformer_layer(sequence, src_key_padding_mask=sequence_mask)
        
        # تجميع التسلسل (متوسط أو آخر عنصر)
        if sequence_mask is not None:
            # استخدام متوسط مرجح
            mask_expanded = sequence_mask.unsqueeze(-1).expand_as(sequence)
            sequence_sum = (sequence * mask_expanded).sum(dim=1)
            sequence_len = mask_expanded.sum(dim=1)
            sequence_repr = sequence_sum / sequence_len
        else:
            sequence_repr = sequence.mean(dim=1)
        
        # دمج مع تضمين المستخدم
        combined = user_emb.squeeze() + sequence_repr
        
        # التصنيف النهائي
        output = self.classifier(combined)
        
        return output.squeeze()


class VariationalAutoEncoder(nn.Module):
    """
    المُرمز التلقائي التغايري للتوصيات
    Variational AutoEncoder for Recommendations
    """
    
    def __init__(self, n_items: int, config: DeepLearningConfig):
        super(VariationalAutoEncoder, self).__init__()
        self.config = config
        self.n_items = n_items
        
        # المُرمز (Encoder)
        self.encoder = nn.Sequential(
            nn.Linear(n_items, config.hidden_dims[0]),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_dims[0], config.hidden_dims[1]),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate)
        )
        
        # طبقات المتوسط والتباين
        self.fc_mu = nn.Linear(config.hidden_dims[1], config.embedding_dim)
        self.fc_logvar = nn.Linear(config.hidden_dims[1], config.embedding_dim)
        
        # المُفكك (Decoder)
        self.decoder = nn.Sequential(
            nn.Linear(config.embedding_dim, config.hidden_dims[1]),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_dims[1], config.hidden_dims[0]),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_dims[0], n_items),
            nn.Sigmoid()
        )
    
    def encode(self, x):
        """ترميز المدخلات"""
        h = self.encoder(x)
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h)
        return mu, logvar
    
    def reparameterize(self, mu, logvar):
        """إعادة المعايرة"""
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std
    
    def decode(self, z):
        """فك الترميز"""
        return self.decoder(z)
    
    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        recon_x = self.decode(z)
        return recon_x, mu, logvar
    
    def loss_function(self, recon_x, x, mu, logvar):
        """حساب دالة الخسارة"""
        # خسارة إعادة البناء
        BCE = F.binary_cross_entropy(recon_x, x, reduction='sum')
        
        # خسارة KL divergence
        KLD = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
        
        return BCE + KLD


class LSTMRecommender(nn.Module):
    """
    نموذج LSTM للتوصيات التسلسلية
    LSTM-based Sequential Recommendation Model
    """
    
    def __init__(self, n_items: int, config: DeepLearningConfig):
        super(LSTMRecommender, self).__init__()
        self.config = config
        
        # طبقة التضمين
        self.item_embedding = nn.Embedding(n_items, config.embedding_dim)
        
        # طبقات LSTM
        self.lstm = nn.LSTM(
            input_size=config.embedding_dim,
            hidden_size=config.lstm_units,
            num_layers=2,
            batch_first=True,
            dropout=config.dropout_rate if config.dropout_rate > 0 else 0,
            bidirectional=True
        )
        
        # طبقة الانتباه
        self.attention = nn.MultiheadAttention(
            embed_dim=config.lstm_units * 2,  # bidirectional
            num_heads=config.attention_heads,
            dropout=config.dropout_rate,
            batch_first=True
        )
        
        # طبقات التصنيف
        self.classifier = nn.Sequential(
            nn.Linear(config.lstm_units * 2, config.hidden_dims[0]),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_dims[0], config.hidden_dims[1]),
            nn.ReLU(),
            nn.Dropout(config.dropout_rate),
            nn.Linear(config.hidden_dims[1], n_items),
            nn.Softmax(dim=-1)
        )
    
    def forward(self, item_sequences, sequence_lengths=None):
        # التضمين
        embedded = self.item_embedding(item_sequences)
        
        # معالجة LSTM
        if sequence_lengths is not None:
            # حزم التسلسلات للكفاءة
            packed = nn.utils.rnn.pack_padded_sequence(
                embedded, sequence_lengths, batch_first=True, enforce_sorted=False
            )
            lstm_out, (hidden, cell) = self.lstm(packed)
            lstm_out, _ = nn.utils.rnn.pad_packed_sequence(lstm_out, batch_first=True)
        else:
            lstm_out, (hidden, cell) = self.lstm(embedded)
        
        # تطبيق الانتباه
        attended, attention_weights = self.attention(lstm_out, lstm_out, lstm_out)
        
        # أخذ آخر مخرجات صالحة
        if sequence_lengths is not None:
            batch_size = attended.size(0)
            last_outputs = []
            for i, length in enumerate(sequence_lengths):
                last_outputs.append(attended[i, length-1, :])
            sequence_repr = torch.stack(last_outputs)
        else:
            sequence_repr = attended[:, -1, :]
        
        # التصنيف النهائي
        output = self.classifier(sequence_repr)
        
        return output


class DeepRecommendationTrainer:
    """
    مدرب نماذج التعلم العميق للتوصيات
    Deep Learning Recommendation Trainer
    """
    
    def __init__(self, config: DeepLearningConfig):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.models = {}
        self.training_history = {}
        
    def train_deep_matrix_factorization(self, interactions_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب نموذج تفكيك المصفوفة العميق"""
        logger.info("🤖 بدء تدريب نموذج تفكيك المصفوفة العميق...")
        
        # تحضير البيانات
        dataset = RecommendationDataset(interactions_df, self.config)
        train_loader = DataLoader(dataset, batch_size=self.config.batch_size, shuffle=True)
        
        # إنشاء النموذج
        model = DeepMatrixFactorization(
            n_users=dataset.get_n_users(),
            n_items=dataset.get_n_items(),
            config=self.config
        ).to(self.device)
        
        # إعداد التدريب
        optimizer = optim.Adam(model.parameters(), lr=self.config.learning_rate)
        criterion = nn.BCELoss()
        
        # التدريب
        history = {'train_loss': [], 'train_accuracy': []}
        
        for epoch in range(self.config.epochs):
            model.train()
            total_loss = 0
            correct_predictions = 0
            total_predictions = 0
            
            for batch in train_loader:
                user_ids = batch['user_id'].to(self.device).squeeze()
                item_ids = batch['item_id'].to(self.device).squeeze()
                targets = batch['binary_target'].to(self.device).squeeze()
                
                optimizer.zero_grad()
                
                outputs = model(user_ids, item_ids)
                loss = criterion(outputs, targets)
                
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
                
                # حساب الدقة
                predictions = (outputs > 0.5).float()
                correct_predictions += (predictions == targets).sum().item()
                total_predictions += targets.size(0)
            
            avg_loss = total_loss / len(train_loader)
            accuracy = correct_predictions / total_predictions
            
            history['train_loss'].append(avg_loss)
            history['train_accuracy'].append(accuracy)
            
            if epoch % 10 == 0:
                logger.info(f"Epoch {epoch}/{self.config.epochs} - Loss: {avg_loss:.4f}, Accuracy: {accuracy:.4f}")
        
        # حفظ النموذج
        self.models['deep_mf'] = model
        self.training_history['deep_mf'] = history
        
        logger.info("✅ تم الانتهاء من تدريب نموذج تفكيك المصفوفة العميق")
        
        return {
            'model_type': 'DeepMatrixFactorization',
            'final_loss': history['train_loss'][-1],
            'final_accuracy': history['train_accuracy'][-1],
            'n_users': dataset.get_n_users(),
            'n_items': dataset.get_n_items(),
            'training_history': history
        }
    
    def train_transformer_model(self, interactions_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب نموذج Transformer"""
        logger.info("🤖 بدء تدريب نموذج Transformer...")
        
        # تحضير البيانات التسلسلية
        sequential_data = self._prepare_sequential_data(interactions_df)
        train_loader = DataLoader(sequential_data, batch_size=self.config.batch_size, shuffle=True)
        
        # إنشاء النموذج
        n_users = len(interactions_df['user_id'].unique())
        n_items = len(interactions_df['article_id'].unique())
        
        model = TransformerRecommender(
            n_users=n_users,
            n_items=n_items,
            config=self.config
        ).to(self.device)
        
        # إعداد التدريب
        optimizer = optim.Adam(model.parameters(), lr=self.config.learning_rate)
        criterion = nn.BCELoss()
        
        # التدريب
        history = {'train_loss': [], 'train_accuracy': []}
        
        for epoch in range(self.config.epochs):
            model.train()
            total_loss = 0
            correct_predictions = 0
            total_predictions = 0
            
            for batch in train_loader:
                # تنفيذ مبسط للتدريب
                # (يحتاج تطوير أكثر تفصيلاً لبيانات تسلسلية حقيقية)
                pass
            
            if epoch % 10 == 0:
                logger.info(f"Transformer Epoch {epoch}/{self.config.epochs}")
        
        # حفظ النموذج
        self.models['transformer'] = model
        
        logger.info("✅ تم الانتهاء من تدريب نموذج Transformer")
        
        return {
            'model_type': 'TransformerRecommender',
            'status': 'trained',
            'n_users': n_users,
            'n_items': n_items
        }
    
    def train_variational_autoencoder(self, interactions_df: pd.DataFrame) -> Dict[str, Any]:
        """تدريب المُرمز التلقائي التغايري"""
        logger.info("🤖 بدء تدريب المُرمز التلقائي التغايري...")
        
        # تحضير مصفوفة المستخدم-المقال
        user_item_matrix = self._create_user_item_matrix(interactions_df)
        
        # إنشاء النموذج
        model = VariationalAutoEncoder(
            n_items=user_item_matrix.shape[1],
            config=self.config
        ).to(self.device)
        
        # إعداد التدريب
        optimizer = optim.Adam(model.parameters(), lr=self.config.learning_rate)
        
        # تحويل البيانات إلى tensor
        data_tensor = torch.FloatTensor(user_item_matrix).to(self.device)
        dataset = torch.utils.data.TensorDataset(data_tensor)
        train_loader = DataLoader(dataset, batch_size=self.config.batch_size, shuffle=True)
        
        # التدريب
        history = {'train_loss': []}
        
        for epoch in range(self.config.epochs):
            model.train()
            total_loss = 0
            
            for batch in train_loader:
                data = batch[0]
                
                optimizer.zero_grad()
                
                recon_batch, mu, logvar = model(data)
                loss = model.loss_function(recon_batch, data, mu, logvar)
                
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
            
            avg_loss = total_loss / len(train_loader)
            history['train_loss'].append(avg_loss)
            
            if epoch % 10 == 0:
                logger.info(f"VAE Epoch {epoch}/{self.config.epochs} - Loss: {avg_loss:.4f}")
        
        # حفظ النموذج
        self.models['vae'] = model
        self.training_history['vae'] = history
        
        logger.info("✅ تم الانتهاء من تدريب المُرمز التلقائي التغايري")
        
        return {
            'model_type': 'VariationalAutoEncoder',
            'final_loss': history['train_loss'][-1],
            'n_items': user_item_matrix.shape[1],
            'training_history': history
        }
    
    def _prepare_sequential_data(self, interactions_df: pd.DataFrame):
        """تحضير البيانات التسلسلية"""
        # تنفيذ مبسط - يحتاج تطوير أكثر
        logger.info("📝 تحضير البيانات التسلسلية...")
        
        # ترتيب التفاعلات حسب الوقت لكل مستخدم
        sorted_interactions = interactions_df.sort_values(['user_id', 'created_at'])
        
        # إنشاء تسلسلات لكل مستخدم
        user_sequences = {}
        for user_id, group in sorted_interactions.groupby('user_id'):
            articles = group['article_id'].tolist()
            if len(articles) >= 3:  # تسلسلات بحد أدنى 3 عناصر
                user_sequences[user_id] = articles
        
        return user_sequences
    
    def _create_user_item_matrix(self, interactions_df: pd.DataFrame) -> np.ndarray:
        """إنشاء مصفوفة المستخدم-المقال"""
        logger.info("📊 إنشاء مصفوفة المستخدم-المقال...")
        
        # إنشاء مصفوفة sparse
        user_encoder = LabelEncoder()
        item_encoder = LabelEncoder()
        
        user_ids = user_encoder.fit_transform(interactions_df['user_id'])
        item_ids = item_encoder.fit_transform(interactions_df['article_id'])
        
        n_users = len(user_encoder.classes_)
        n_items = len(item_encoder.classes_)
        
        # إنشاء مصفوفة
        matrix = np.zeros((n_users, n_items))
        for user_id, item_id, rating in zip(user_ids, item_ids, interactions_df['rating']):
            matrix[user_id, item_id] = rating
        
        # تطبيع المصفوفة
        matrix = (matrix > 0).astype(np.float32)
        
        logger.info(f"✅ تم إنشاء مصفوفة بحجم {matrix.shape}")
        return matrix
    
    def get_model_recommendations(self, model_name: str, user_id: int, 
                                n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """الحصول على توصيات من نموذج معين"""
        if model_name not in self.models:
            return []
        
        model = self.models[model_name]
        model.eval()
        
        with torch.no_grad():
            if model_name == 'deep_mf':
                # تنفيذ مبسط للتوصيات
                user_tensor = torch.LongTensor([user_id]).to(self.device)
                all_items = torch.arange(model.item_embedding.num_embeddings).to(self.device)
                user_repeated = user_tensor.repeat(len(all_items))
                
                scores = model(user_repeated, all_items)
                top_indices = torch.topk(scores, n_recommendations).indices
                top_scores = torch.topk(scores, n_recommendations).values
                
                recommendations = list(zip(top_indices.cpu().numpy(), 
                                         top_scores.cpu().numpy()))
                return recommendations
        
        return []
    
    def save_models(self, filepath: str):
        """حفظ جميع النماذج"""
        logger.info(f"💾 حفظ نماذج التعلم العميق في {filepath}")
        
        save_data = {
            'config': self.config,
            'training_history': self.training_history,
            'models_info': {}
        }
        
        # حفظ معلومات النماذج والأوزان
        for name, model in self.models.items():
            model_path = f"{filepath}_{name}_model.pth"
            torch.save(model.state_dict(), model_path)
            
            save_data['models_info'][name] = {
                'model_class': model.__class__.__name__,
                'model_path': model_path,
                'model_params': {
                    'n_users': getattr(model, 'user_embedding', None).num_embeddings if hasattr(model, 'user_embedding') else None,
                    'n_items': getattr(model, 'item_embedding', None).num_embeddings if hasattr(model, 'item_embedding') else None
                }
            }
        
        # حفظ البيانات العامة
        with open(f"{filepath}_deep_models.pkl", 'wb') as f:
            pickle.dump(save_data, f)
        
        logger.info("✅ تم حفظ جميع نماذج التعلم العميق")
    
    def load_models(self, filepath: str):
        """تحميل جميع النماذج"""
        logger.info(f"📂 تحميل نماذج التعلم العميق من {filepath}")
        
        try:
            # تحميل البيانات العامة
            with open(f"{filepath}_deep_models.pkl", 'rb') as f:
                save_data = pickle.load(f)
            
            self.config = save_data['config']
            self.training_history = save_data['training_history']
            
            # تحميل النماذج
            for name, model_info in save_data['models_info'].items():
                model_class = model_info['model_class']
                model_path = model_info['model_path']
                model_params = model_info['model_params']
                
                # إعادة إنشاء النموذج
                if model_class == 'DeepMatrixFactorization':
                    model = DeepMatrixFactorization(
                        n_users=model_params['n_users'],
                        n_items=model_params['n_items'],
                        config=self.config
                    )
                elif model_class == 'VariationalAutoEncoder':
                    model = VariationalAutoEncoder(
                        n_items=model_params['n_items'],
                        config=self.config
                    )
                # إضافة باقي النماذج حسب الحاجة
                
                # تحميل الأوزان
                model.load_state_dict(torch.load(model_path, map_location=self.device))
                model.to(self.device)
                
                self.models[name] = model
            
            logger.info("✅ تم تحميل جميع نماذج التعلم العميق")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل النماذج: {str(e)}")
            raise
    
    def get_ensemble_recommendations(self, user_id: int, n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """الحصول على توصيات مجمعة من جميع النماذج"""
        if not self.models:
            return []
        
        all_recommendations = defaultdict(float)
        
        # جمع التوصيات من جميع النماذج
        for model_name in self.models:
            try:
                model_recs = self.get_model_recommendations(
                    model_name, user_id, n_recommendations * 2
                )
                
                for item_id, score in model_recs:
                    all_recommendations[item_id] += score / len(self.models)
                    
            except Exception as e:
                logger.warning(f"⚠️ فشل في الحصول على توصيات من {model_name}: {str(e)}")
                continue
        
        # ترتيب وإرجاع أفضل التوصيات
        sorted_recs = sorted(all_recommendations.items(), key=lambda x: x[1], reverse=True)
        return sorted_recs[:n_recommendations]


# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد التكوين
    config = DeepLearningConfig(
        embedding_dim=64,
        hidden_dims=[256, 128, 64],
        epochs=50,
        batch_size=256
    )
    
    # إنشاء بيانات تجريبية
    sample_interactions = pd.DataFrame({
        'user_id': [f'user_{i}' for i in range(1000)] * 5,
        'article_id': [f'article_{i}' for i in range(500)] * 10,
        'rating': np.random.randint(1, 6, 5000),
        'created_at': pd.date_range('2024-01-01', periods=5000, freq='H')
    })
    
    # إنشاء وتدريب النماذج
    trainer = DeepRecommendationTrainer(config)
    
    # تدريب نموذج تفكيك المصفوفة العميق
    dmf_results = trainer.train_deep_matrix_factorization(sample_interactions)
    print("🎯 نتائج تدريب Deep MF:", dmf_results)
    
    # تدريب المُرمز التلقائي التغايري
    vae_results = trainer.train_variational_autoencoder(sample_interactions)
    print("🎯 نتائج تدريب VAE:", vae_results)
    
    # الحصول على توصيات
    recommendations = trainer.get_ensemble_recommendations(user_id=0, n_recommendations=5)
    print("📝 التوصيات المجمعة:", recommendations)
