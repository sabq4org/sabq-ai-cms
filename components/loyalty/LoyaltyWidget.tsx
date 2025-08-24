"use client";

/**
 * مكون عرض نقاط الولاء والمستوى
 */

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Gift, TrendingUp } from 'lucide-react';

interface LoyaltyStats {
  currentPoints: number;
  totalEarned: number;
  currentLevel: {
    name: string;
    nameEn: string;
    minPoints: number;
    maxPoints: number | null;
    benefits: string[];
  };
  nextLevel?: {
    name: string;
    nameEn: string;
    minPoints: number;
    maxPoints: number | null;
    benefits: string[];
  };
  pointsToNextLevel: number;
  recentTransactions: Array<{
    points: number;
    reason: string;
    date: string;
    type: string;
  }>;
}

interface LoyaltyWidgetProps {
  userId: string;
  className?: string;
  showDetails?: boolean;
}

export default function LoyaltyWidget({ 
  userId, 
  className = '', 
  showDetails = true 
}: LoyaltyWidgetProps) {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchLoyaltyStats();
    }
  }, [userId]);

  const fetchLoyaltyStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/loyalty/stats/${userId}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب إحصائيات الولاء');
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.message || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      console.error('خطأ في جلب إحصائيات الولاء:', err);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (levelName: string) => {
    const colors = {
      'مبتدئ': 'from-gray-400 to-gray-600',
      'نشط': 'from-blue-400 to-blue-600',
      'مخلص': 'from-green-400 to-green-600',
      'خبير': 'from-purple-400 to-purple-600',
      'سفير': 'from-yellow-400 to-yellow-600'
    };
    return colors[levelName as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  const getLevelIcon = (levelName: string) => {
    const icons = {
      'مبتدئ': Star,
      'نشط': TrendingUp,
      'مخلص': Trophy,
      'خبير': Gift,
      'سفير': Trophy
    };
    const IconComponent = icons[levelName as keyof typeof icons] || Star;
    return <IconComponent className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={fetchLoyaltyStats}
          className="text-red-700 underline text-sm mt-2 hover:no-underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const progressPercentage = stats.nextLevel 
    ? ((stats.currentPoints - stats.currentLevel.minPoints) / 
       (stats.nextLevel.minPoints - stats.currentLevel.minPoints)) * 100
    : 100;

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
      {/* رأس المكون */}
      <div className={`bg-gradient-to-r ${getLevelColor(stats.currentLevel.name)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getLevelIcon(stats.currentLevel.name)}
            <div>
              <h3 className="font-bold text-lg">{stats.currentLevel.name}</h3>
              <p className="text-white/80 text-sm">{stats.currentPoints.toLocaleString()} نقطة</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-xs">إجمالي النقاط المكتسبة</p>
            <p className="font-bold">{stats.totalEarned.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* شريط التقدم */}
      {stats.nextLevel && (
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">التقدم إلى {stats.nextLevel.name}</span>
            <span className="text-sm font-medium text-gray-900">
              {stats.pointsToNextLevel.toLocaleString()} نقطة متبقية
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${getLevelColor(stats.nextLevel.name)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{stats.currentLevel.minPoints.toLocaleString()}</span>
            <span>{stats.nextLevel.minPoints.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* المزايا الحالية */}
      {showDetails && (
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900 mb-2">مزايا مستواك الحالي</h4>
          <ul className="space-y-1">
            {stats.currentLevel.benefits.map((benefit, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* المعاملات الأخيرة */}
      {showDetails && stats.recentTransactions.length > 0 && (
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">النشاط الأخير</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {stats.recentTransactions.slice(0, 5).map((transaction, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-900">{transaction.reason}</p>
                  <p className="text-gray-500 text-xs">{formatDate(transaction.date)}</p>
                </div>
                <div className={`font-medium ${
                  transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* رابط التفاصيل الكاملة */}
      {showDetails && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          <button 
            onClick={() => window.location.href = '/profile/loyalty'}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            عرض التفاصيل الكاملة ←
          </button>
        </div>
      )}
    </div>
  );
}
