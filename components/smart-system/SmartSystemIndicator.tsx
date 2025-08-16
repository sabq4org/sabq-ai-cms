'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Brain, 
  CheckCircle, 
  Settings,
  Sparkles,
  Bell,
  BarChart3,
  Users,
  Globe,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const SMART_FEATURES = [
  { name: 'التوصيات الذكية', icon: Sparkles, active: true },
  { name: 'الإشعارات الذكية', icon: Bell, active: true },
  { name: 'التحليلات المتقدمة', icon: BarChart3, active: true },
  { name: 'لوحة المستخدم', icon: Users, active: true },
  { name: 'إدارة المحتوى', icon: Globe, active: true },
  { name: 'التحديثات المباشرة', icon: Zap, active: true }
];

export default function SmartSystemIndicator() {
  const activeCount = SMART_FEATURES.filter(f => f.active).length;
  const totalCount = SMART_FEATURES.length;
  const percentage = Math.round((activeCount / totalCount) * 100);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <Badge className="bg-green-100 text-green-800 border-green-200">
            نظام ذكي نشط
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" dir="rtl">
        <DropdownMenuLabel className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            النظام الذكي المتكامل
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* الحالة العامة */}
        <div className="p-3 bg-green-50 text-green-800">
          <div className="text-center">
            <div className="text-2xl font-bold">{percentage}%</div>
            <div className="text-xs">نسبة التفعيل</div>
            <div className="text-xs mt-1">{activeCount} من {totalCount} مكونات نشطة</div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* حالة المكونات */}
        <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
          {SMART_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{feature.name}</span>
                </div>
                {feature.active ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
            );
          })}
        </div>

        <DropdownMenuSeparator />
        
        {/* إحصائيات سريعة */}
        <div className="p-3 bg-blue-50 text-blue-800 text-sm">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-bold">6</div>
              <div className="text-xs">مكونات</div>
            </div>
            <div>
              <div className="font-bold">∞</div>
              <div className="text-xs">إمكانيات</div>
            </div>
            <div>
              <div className="font-bold">24/7</div>
              <div className="text-xs">نشط</div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        {/* رابط التحكم */}
        <DropdownMenuItem asChild>
          <Link href="/admin/smart-system" className="w-full cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            فتح لوحة التحكم الذكية
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
