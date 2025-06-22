'use client';

import React from 'react';
import { SabqCard } from '@/components/ui/SabqCard';
import { Layout, Puzzle, Zap } from 'lucide-react';

const smartBlocks = [
  { id: 'breaking', name: 'عاجل', icon: Zap },
  { id: 'topBanner', name: 'بانر علوي', icon: Layout },
  { id: 'mostRead', name: 'الأكثر قراءة', icon: Puzzle },
  { id: 'recommendations', name: 'توصيات مخصصة', icon: Puzzle },
  { id: 'aiSummary', name: 'ملخص AI', icon: Zap },
];

export default function SmartBlocksPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">إدارة البلوكات الذكية</h1>
        <p className="text-gray-600 dark:text-gray-400">قائمة البلوكات الذكية في الموقع وإمكانية ترتيبها أو تفعيلها/تعطيلها.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartBlocks.map((block) => {
          const Icon = block.icon;
          return (
            <SabqCard key={block.id} className="flex items-center gap-4 p-6 hover:shadow-lg transition-all">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{block.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">معرّف: {block.id}</p>
              </div>
              <button className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">إعدادات</button>
            </SabqCard>
          );
        })}
      </div>
    </div>
  );
} 