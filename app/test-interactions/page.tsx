'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Bookmark, 
  Share, 
  User, 
  TrendingUp, 
  Trophy,
  Activity,
  Eye,
  Heart
} from 'lucide-react';

// دوال محلية مؤقتة لتفادي الأخطاء
const mockInteractionFunctions = {
  saveLocalInteraction: (userId: string, articleId: string, type: string) => {
    return { success: true, points: 1, message: 'تم التفاعل' };
  },
  getUserArticleInteraction: (userId: string, articleId: string) => {
    return { liked: false, saved: false, shared: false };
  },
  getUserStats: (userId: string) => {
    return { totalLikes: 0, totalSaves: 0, totalShares: 0, totalPoints: 0, tier: 'bronze' };
  }
};

export default function TestInteractionsPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [guestId, setGuestId] = useState('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTab, setActiveTab] = useState('test');

  // إنشاء معرف ضيف مؤقت
  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(storedGuestId);
    } else {
      const newGuestId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      localStorage.setItem('guestId', newGuestId);
      setGuestId(newGuestId);
    }
  }, []);

  // دالة مسح البيانات
  const clearData = () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات المحلية؟')) {
      localStorage.removeItem('guestId');
      localStorage.removeItem('sabq_interactions');
      localStorage.removeItem('sabq_user_stats');
      localStorage.removeItem('sabq_points_history');
      window.location.reload();
    }
  };

  // دالة اختبار التفاعل
  const testInteraction = (articleId: string, type: string) => {
    const result = mockInteractionFunctions.saveLocalInteraction(guestId, articleId, type);
    setTestResults(prev => [...prev, {
      id: Date.now(),
      userId: guestId,
      articleId,
      type,
      result,
      timestamp: new Date().toISOString()
    }]);
  };

  // دالة اختبار الحصول على التفاعل
  const testGetInteraction = (articleId: string) => {
    const interaction = mockInteractionFunctions.getUserArticleInteraction(guestId, articleId);
    setTestResults(prev => [...prev, {
      id: Date.now(),
      userId: guestId,
      articleId,
      type: 'get',
      result: interaction,
      timestamp: new Date().toISOString()
    }]);
  };

  // دالة اختبار الإحصائيات
  const testStats = () => {
    const stats = mockInteractionFunctions.getUserStats(guestId);
    setTestResults(prev => [...prev, {
      id: Date.now(),
      userId: guestId,
      type: 'stats',
      result: stats,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">اختبار التفاعلات</h1>
        <p className="text-gray-600">صفحة اختبار مؤقتة لاختبار التفاعلات (معطلة حاليًا)</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>معلومات المستخدم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>معرف الضيف:</strong> {guestId}</p>
            <p className="text-sm text-gray-500">
              ⚠️ ملاحظة: نظام التفاعلات المحلية معطل حاليًا لأن المشروع يستخدم Supabase فقط
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold mb-4">صفحة اختبار معطلة</h2>
        <p className="text-gray-600 mb-4">
          تم تعطيل هذه الصفحة لأن المشروع يستخدم Supabase للتفاعلات والبيانات.
        </p>
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          العودة للوحة التحكم
        </Button>
      </div>
    </div>
  );
}