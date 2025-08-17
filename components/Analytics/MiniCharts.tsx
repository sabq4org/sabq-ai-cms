"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

// تسجيل مكونات Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimeSeriesData {
  date: string;
  usage: number;
  views: number;
  popularity: number;
}

interface TrendData {
  direction: 'rising' | 'falling' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
  growth_rate: number;
}

interface MiniChartProps {
  data: TimeSeriesData[];
  trend?: TrendData;
  height?: number;
  metric?: 'usage' | 'views' | 'popularity';
  showTooltip?: boolean;
  showGrid?: boolean;
  color?: string;
  fillArea?: boolean;
  animate?: boolean;
}

const MiniChart: React.FC<MiniChartProps> = ({
  data,
  trend,
  height = 60,
  metric = 'usage',
  showTooltip = true,
  showGrid = false,
  color,
  fillArea = true,
  animate = true
}) => {
  const chartRef = useRef<ChartJS<"line", number[], string>>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-gray-400 text-sm"
        style={{ height: `${height}px` }}
      >
        لا توجد بيانات
      </div>
    );
  }

  // تحديد اللون حسب الاتجاه
  const getColor = () => {
    if (color) return color;
    
    if (trend) {
      switch (trend.direction) {
        case 'rising':
          return trend.strength === 'strong' ? '#059669' : '#10b981';
        case 'falling':
          return trend.strength === 'strong' ? '#dc2626' : '#ef4444';
        default:
          return '#6b7280';
      }
    }
    
    return '#3b82f6';
  };

  const chartColor = getColor();

  // إعداد البيانات
  const chartData: ChartData<'line'> = {
    labels: data.map(item => format(parseISO(item.date), 'dd/MM', { locale: ar })),
    datasets: [
      {
        data: data.map(item => item[metric]),
        borderColor: chartColor,
        backgroundColor: fillArea ? `${chartColor}20` : 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: chartColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: fillArea,
        tension: 0.3,
      }
    ]
  };

  // إعدادات الرسم البياني
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animate ? {
      duration: 1000,
      easing: 'easeInOutQuart'
    } : false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: showTooltip,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: chartColor,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const dataIndex = tooltipItems[0]?.dataIndex;
            if (dataIndex !== undefined && data[dataIndex]) {
              return format(parseISO(data[dataIndex].date), 'dd MMMM yyyy', { locale: ar });
            }
            return '';
          },
          label: (context) => {
            const value = context.parsed.y;
            const metricLabels = {
              usage: 'الاستخدام',
              views: 'المشاهدات',
              popularity: 'الشعبية'
            };
            return `${metricLabels[metric]}: ${value.toLocaleString('ar-SA')}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: showGrid,
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        display: showGrid,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          display: false
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 6
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div 
      className={`relative transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ height: `${height}px` }}
    >
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

// مكون رسم بياني صغير مع مؤشرات الاتجاه
interface TrendMiniChartProps extends MiniChartProps {
  title?: string;
  value?: number;
  showTrendIndicator?: boolean;
  compact?: boolean;
}

const TrendMiniChart: React.FC<TrendMiniChartProps> = ({
  title,
  value,
  showTrendIndicator = true,
  compact = false,
  ...chartProps
}) => {
  const { trend } = chartProps;

  const getTrendIcon = () => {
    if (!trend || !showTrendIndicator) return null;

    switch (trend.direction) {
      case 'rising':
        return (
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">+{Math.abs(trend.growth_rate).toFixed(1)}%</span>
          </div>
        );
      case 'falling':
        return (
          <div className="flex items-center text-red-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{trend.growth_rate.toFixed(1)}%</span>
          </div>
        );
      case 'stable':
        return (
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">ثابت</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className="flex-1">
          <MiniChart {...chartProps} height={40} />
        </div>
        {getTrendIcon()}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow duration-200">
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          {getTrendIcon()}
        </div>
      )}
      
      {value !== undefined && (
        <div className="mb-3">
          <span className="text-2xl font-bold text-gray-900">
            {value.toLocaleString('ar-SA')}
          </span>
        </div>
      )}
      
      <MiniChart {...chartProps} />
    </div>
  );
};

// مكون لعرض عدة رسوم بيانية في شبكة
interface ChartsGridProps {
  data: Array<{
    id: string;
    title: string;
    timeSeriesData: TimeSeriesData[];
    trend: TrendData;
    currentValue: number;
    metric: 'usage' | 'views' | 'popularity';
  }>;
  columns?: number;
  compact?: boolean;
}

const ChartsGrid: React.FC<ChartsGridProps> = ({
  data,
  columns = 3,
  compact = false
}) => {
  return (
    <div 
      className={`grid gap-4`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`
      }}
    >
      {data.map((item) => (
        <TrendMiniChart
          key={item.id}
          title={item.title}
          value={item.currentValue}
          data={item.timeSeriesData}
          trend={item.trend}
          metric={item.metric}
          compact={compact}
          height={compact ? 40 : 80}
        />
      ))}
    </div>
  );
};

export { MiniChart, TrendMiniChart, ChartsGrid };
export type { TimeSeriesData, TrendData, MiniChartProps, TrendMiniChartProps };