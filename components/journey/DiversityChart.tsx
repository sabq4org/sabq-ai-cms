import React from 'react';

interface DiversityChartProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function DiversityChart({ 
  score, 
  size = 128, 
  strokeWidth = 8 
}: DiversityChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            {score}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            نسبة التنوع
          </div>
        </div>
      </div>
      <svg 
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="text-purple-500 transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
} 