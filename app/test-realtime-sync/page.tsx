'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Send, 
  RefreshCw, 
  Users, 
  Clock,
  Database,
  Network,
  WifiOff,
  Wifi
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// دالة مؤقتة لتفادي الأخطاء
const mockSyncHook = {
  broadcast: (type: string, data: any) => {
    console.log('Mock broadcast:', type, data);
    toast.success(`تم إرسال: ${type}`);
  },
  lastUpdate: null
};

export default function TestRealtimeSyncPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    connectedTabs: 1,
    totalMessages: 0,
    syncStatus: 'connected'
  });

  // محاكاة الاتصال
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.1 ? true : false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // دالة إرسال رسالة
  const sendMessage = () => {
    if (broadcastMessage.trim()) {
      const message = {
        type: 'test-message',
        content: broadcastMessage,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      
      mockSyncHook.broadcast('test-message', message);
      setReceivedMessages(prev => [...prev, message]);
      setBroadcastMessage('');
      setUserStats(prev => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
    }
  };

  // مسح الرسائل
  const clearMessages = () => {
    setReceivedMessages([]);
    setUserStats(prev => ({ ...prev, totalMessages: 0 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <Toaster />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">اختبار المزامنة الفورية</h1>
          <p className="text-gray-600">
            هذه صفحة اختبار مؤقتة لاختبار مزامنة البيانات (معطلة حاليًا)
          </p>
        </div>

        {/* حالة الاتصال */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
              حالة الاتصال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {isConnected ? 'متصل' : 'منقطع'}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  {isConnected ? 'نظام المزامنة يعمل بشكل طبيعي' : 'مشكلة في الاتصال'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.connectedTabs}</div>
                  <div className="text-sm text-gray-600">تبويبات متصلة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.totalMessages}</div>
                  <div className="text-sm text-gray-600">رسائل مرسلة</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إعدادات المزامنة */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إعدادات المزامنة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-enabled" className="text-sm font-medium">
                  تفعيل المزامنة الفورية
                </Label>
                <Switch
                  id="sync-enabled"
                  checked={syncEnabled}
                  onCheckedChange={setSyncEnabled}
                />
              </div>
              <div className="text-sm text-gray-600">
                {syncEnabled ? 'سيتم مزامنة التغييرات فورًا مع التبويبات الأخرى' : 'المزامنة معطلة'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إرسال رسالة اختبار */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إرسال رسالة اختبار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">الرسالة</Label>
                <Input
                  id="message"
                  type="text"
                  placeholder="اكتب رسالة للاختبار..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={sendMessage} disabled={!broadcastMessage.trim() || !syncEnabled}>
                  <Send className="w-4 h-4 mr-2" />
                  إرسال
                </Button>
                <Button variant="outline" onClick={clearMessages}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  مسح الرسائل
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الرسائل المستلمة */}
        <Card>
          <CardHeader>
            <CardTitle>الرسائل المستلمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {receivedMessages.length > 0 ? (
                receivedMessages.map((message) => (
                  <div key={message.id} className="p-3 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{message.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleString('ar')}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {message.type}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  لا توجد رسائل مستلمة
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ملاحظة التعطيل */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">تنبيه</h3>
          <p className="text-yellow-700 text-sm">
            هذه صفحة اختبار مؤقتة. نظام المزامنة الفورية معطل حاليًا لأن المشروع يستخدم Supabase للبيانات.
          </p>
        </div>
      </div>
    </div>
  );
}