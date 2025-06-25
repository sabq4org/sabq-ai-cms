'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Trophy, TrendingUp, RefreshCw, 
  Heart, Settings, Bell, LogOut, Loader2,
  Crown, Star, Award, Gem
} from 'lucide-react';
import { getMembershipLevel } from '@/lib/loyalty';

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface LoyaltyData {
  total_points: number;
  tier: string;
  earned_points: number;
  redeemed_points: number;
}

interface UserDropdownProps {
  user: UserData;
  onClose: () => void;
  onLogout: () => void;
}

export default function UserDropdown({ user, onClose, onLogout }: UserDropdownProps) {
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
    
    const handlePointsUpdate = () => {
      fetchLoyaltyPoints();
    };
    
    window.addEventListener('loyalty-points-updated', handlePointsUpdate);
    
    return () => {
      window.removeEventListener('loyalty-points-updated', handlePointsUpdate);
    };
  }, []);

  // استخدام نظام التصنيف المركزي
  const loyaltyLevel = loyaltyData ? getMembershipLevel(loyaltyData.total_points) : null;

  const getTierIcon = (name: string) => {
    switch (name) {
      case 'برونزي': return Crown;
      case 'فضي': return Star;
      case 'ذهبي': return Award;
      case 'سفير': return Gem;
      default: return Trophy;
    }
  };

  const TierIcon = loyaltyLevel ? getTierIcon(loyaltyLevel.name) : Trophy;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden z-[100]">
      {/* رأس القائمة - معلومات المستخدم */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 p-6 pointer-events-none">
        <div className="space-y-3">
          {/* الاسم */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/80 dark:bg-gray-700/80 rounded-xl shadow-sm dark:shadow-gray-900/50">
              <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">مرحباً بك في سبق الذكية</p>
            </div>
          </div>

          {/* المستوى */}
          {loyaltyLevel && (
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shadow-sm dark:shadow-gray-900/50 ${loyaltyLevel.bgColor}`}>
                <TierIcon className="w-5 h-5" style={{ color: loyaltyLevel.color }} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{loyaltyLevel.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">مستوى العضوية</p>
              </div>
            </div>
          )}

          {/* النقاط */}
          <div className="flex items-center justify-between bg-white/90 dark:bg-gray-700/90 rounded-xl p-3 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    loyaltyData?.total_points.toLocaleString('ar-SA') || '0'
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">نقطة ولاء</p>
              </div>
            </div>
            <button
              onClick={fetchLoyaltyPoints}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all pointer-events-auto ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              title="تحديث النقاط"
            >
              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الروابط */}
      <div className="py-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => {
            onClose();
          }}
        >
          <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>الملف الشخصي</span>
        </Link>

        <Link
          href="/welcome/preferences"
          className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => {
            onClose();
          }}
        >
          <Heart className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>اهتماماتي</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => {
            onClose();
          }}
        >
          <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>الإعدادات</span>
        </Link>

        <Link
          href="/notifications"
          className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => {
            onClose();
          }}
        >
          <Bell className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>الإشعارات</span>
        </Link>
      </div>

      {/* زر تسجيل الخروج */}
      <div className="border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => {
            onLogout();
          }}
          className="flex items-center gap-3 px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-right"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
} 