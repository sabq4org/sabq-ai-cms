'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Loader2, RefreshCw } from 'lucide-react';

interface LoyaltyData {
  total_points: number;
  tier: string;
  earned_points: number;
  redeemed_points: number;
}

export default function LoyaltyPointsDisplay() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLoyaltyPoints = async () => {
    try {
      setIsRefreshing(true);
      const userId = localStorage.getItem('user_id');
      
      if (!userId || userId === 'anonymous') {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/loyalty/points?user_id=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLoyaltyData(data.data);
          // تحديث localStorage أيضاً
          localStorage.setItem('user_loyalty_points', data.data.total_points.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyPoints();
    
    // تحديث النقاط كل دقيقة
    const interval = setInterval(fetchLoyaltyPoints, 60000);
    
    // الاستماع لأحداث التحديث المخصصة
    const handlePointsUpdate = () => {
      fetchLoyaltyPoints();
    };
    
    window.addEventListener('loyalty-points-updated', handlePointsUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('loyalty-points-updated', handlePointsUpdate);
    };
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'برونزي';
      case 'silver': return 'فضي';
      case 'gold': return 'ذهبي';
      case 'platinum': return 'بلاتيني';
      default: return tier;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">جاري تحميل النقاط...</span>
      </div>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* نقاط الولاء */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <Trophy className="w-5 h-5 text-purple-600" />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-900">
            {loyaltyData.total_points.toLocaleString('ar-SA')}
          </span>
          <span className="text-xs text-gray-600">نقطة ولاء</span>
        </div>
        <button
          onClick={fetchLoyaltyPoints}
          className={`p-1 rounded-lg hover:bg-white/50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          title="تحديث النقاط"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>

      {/* المستوى */}
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${getTierColor(loyaltyData.tier)} text-white rounded-lg shadow-sm`}>
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm font-bold">{getTierName(loyaltyData.tier)}</span>
      </div>
    </div>
  );
}

// دالة مساعدة لتحديث النقاط من أي مكان في التطبيق
export function triggerLoyaltyUpdate() {
  window.dispatchEvent(new Event('loyalty-points-updated'));
} 