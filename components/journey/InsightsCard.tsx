import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InsightsCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}

export function InsightsCard({ 
  title, 
  icon: Icon, 
  iconColor = 'text-primary',
  children,
  className = ''
}: InsightsCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${className}`}>
      <div className="flex items-center mb-4">
        <Icon className={`w-6 h-6 ${iconColor} ml-2`} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
} 