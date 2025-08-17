"use client";

import React, { useState, useEffect } from 'react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface ComparisonPeriod {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface ComparisonData {
  keyword: string;
  periods: {
    [periodId: string]: {
      usage: number[];
      views: number[];
      popularity: number[];
      dates: string[];
      totalUsage: number;
      totalViews: number;
      averagePopularity: number;
      growthRate: number;
    };
  };
}

interface TimePeriodComparisonProps {
  keyword?: string;
  onPeriodChange?: (periods: ComparisonPeriod[]) => void;
  defaultPeriods?: ComparisonPeriod[];
}

const TimePeriodComparison: React.FC<TimePeriodComparisonProps> = ({
  keyword,
  onPeriodChange,
  defaultPeriods
}) => {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'usage' | 'views' | 'popularity'>('usage');
  const [selectedPeriods, setSelectedPeriods] = useState<ComparisonPeriod[]>(
    defaultPeriods || []
  );

  // فترات زمنية محددة مسبقاً
  const predefinedPeriods = [
    {
      id: 'last_7_days',
      label: 'آخر 7 أيام',
      startDate: startOfDay(subDays(new Date(), 7)),
      endDate: endOfDay(new Date()),
      color: '#3b82f6'
    },
    {
      id: 'last_14_days',
      label: 'آخر 14 يوم',
      startDate: startOfDay(subDays(new Date(), 14)),
      endDate: endOfDay(new Date()),
      color: '#10b981'
    },
    {
      id: 'last_30_days',
      label: 'آخر 30 يوم',
      startDate: startOfDay(subDays(new Date(), 30)),
      endDate: endOfDay(new Date()),
      color: '#f59e0b'
    },
    {
      id: 'previous_week',
      label: 'الأسبوع الماضي',
      startDate: startOfDay(subWeeks(subDays(new Date(), 7), 1)),
      endDate: endOfDay(subDays(new Date(), 7)),
      color: '#ef4444'
    },
    {
      id: 'previous_month',
      label: 'الشهر الماضي',
      startDate: startOfDay(subMonths(new Date(), 1)),
      endDate: endOfDay(subDays(new Date(), 30)),
      color: '#8b5cf6'
    }
  ];

  // تحميل بيانات المقارنة
  const fetchComparisonData = async () => {
    if (!keyword || selectedPeriods.length === 0) return;

    setLoading(true);
    try {
      const promises = selectedPeriods.map(async (period) => {
        const response = await fetch('/api/analytics/trends-widget', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword,
            startDate: period.startDate.toISOString(),
            endDate: period.endDate.toISOString(),
            includeTimeSeries: true
          }),
        });

        if (!response.ok) throw new Error('فشل في تحميل البيانات');
        
        const data = await response.json();
        return { periodId: period.id, data };
      });

      const results = await Promise.all(promises);
      
      const periods: ComparisonData['periods'] = {};
      
      results.forEach(({ periodId, data }) => {
        if (data.timeSeries) {
          periods[periodId] = {
            usage: data.timeSeries.map((item: any) => item.usage),
            views: data.timeSeries.map((item: any) => item.views),
            popularity: data.timeSeries.map((item: any) => item.popularity),
            dates: data.timeSeries.map((item: any) => item.date),
            totalUsage: data.totalUsage || 0,
            totalViews: data.totalViews || 0,
            averagePopularity: data.averagePopularity || 0,
            growthRate: data.growthRate || 0
          };
        }
      });

      setComparisonData({
        keyword,
        periods
      });
    } catch (error) {
      console.error('خطأ في تحميل بيانات المقارنة:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, [keyword, selectedPeriods]);

  useEffect(() => {
    if (onPeriodChange) {
      onPeriodChange(selectedPeriods);
    }
  }, [selectedPeriods, onPeriodChange]);

  // إضافة فترة زمنية
  const addPeriod = (period: ComparisonPeriod) => {
    if (selectedPeriods.length >= 4) return; // حد أقصى 4 فترات
    
    if (!selectedPeriods.find(p => p.id === period.id)) {
      setSelectedPeriods([...selectedPeriods, period]);
    }
  };

  // إزالة فترة زمنية
  const removePeriod = (periodId: string) => {
    setSelectedPeriods(selectedPeriods.filter(p => p.id !== periodId));
  };

  // إعداد بيانات الرسم البياني
  const getChartData = (): ChartData<'line'> => {
    if (!comparisonData) {
      return { labels: [], datasets: [] };
    }

    const datasets = selectedPeriods.map(period => {
      const periodData = comparisonData.periods[period.id];
      if (!periodData) return null;

      return {
        label: period.label,
        data: periodData[selectedMetric],
        borderColor: period.color,
        backgroundColor: `${period.color}20`,
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: period.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      };
    }).filter((dataset): dataset is NonNullable<typeof dataset> => dataset !== null);

    // استخدام التواريخ من أول فترة كمرجع للتسميات
    const firstPeriod = Object.values(comparisonData.periods)[0];
    const labels = firstPeriod?.dates.map((date, index) => `يوم ${index + 1}`) || [];

    return { labels, datasets };
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'system-ui'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          title: (tooltipItems) => {
            return `اليوم ${tooltipItems[0]?.dataIndex + 1}`;
          },
          label: (context) => {
            const value = context.parsed.y;
            const metricLabels = {
              usage: 'الاستخدام',
              views: 'المشاهدات',
              popularity: 'الشعبية'
            };
            return `${context.dataset.label}: ${value.toLocaleString('ar-SA')} ${metricLabels[selectedMetric]}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: 'system-ui'
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: 'system-ui'
          },
          callback: function(value) {
            return (value as number).toLocaleString('ar-SA');
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          مقارنة الفترات الزمنية
          {keyword && <span className="text-blue-600 mr-2">- {keyword}</span>}
        </h3>
        
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* اختيار المقياس */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="usage">الاستخدام</option>
            <option value="views">المشاهدات</option>
            <option value="popularity">الشعبية</option>
          </select>
        </div>
      </div>

      {/* اختيار الفترات */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">اختيار الفترات للمقارنة:</h4>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {predefinedPeriods.map(period => (
            <button
              key={period.id}
              onClick={() => addPeriod(period)}
              disabled={selectedPeriods.length >= 4 || selectedPeriods.some(p => p.id === period.id)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                selectedPeriods.some(p => p.id === period.id)
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* الفترات المحددة */}
        {selectedPeriods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedPeriods.map(period => (
              <div
                key={period.id}
                className="flex items-center bg-gray-100 rounded-md px-3 py-2 text-sm"
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: period.color }}
                />
                <span className="text-gray-700">{period.label}</span>
                <button
                  onClick={() => removePeriod(period.id)}
                  className="mr-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* الرسم البياني */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">جاري تحميل البيانات...</div>
        </div>
      ) : selectedPeriods.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          اختر فترات زمنية للمقارنة
        </div>
      ) : (
        <div className="h-64">
          <Line data={getChartData()} options={chartOptions} />
        </div>
      )}

      {/* إحصائيات المقارنة */}
      {comparisonData && selectedPeriods.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedPeriods.map(period => {
            const periodData = comparisonData.periods[period.id];
            if (!periodData) return null;

            const getMetricValue = () => {
              switch (selectedMetric) {
                case 'usage':
                  return periodData.totalUsage;
                case 'views':
                  return periodData.totalViews;
                case 'popularity':
                  return periodData.averagePopularity;
                default:
                  return 0;
              }
            };

            return (
              <div
                key={period.id}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center mb-2">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: period.color }}
                  />
                  <h5 className="text-sm font-medium text-gray-700">{period.label}</h5>
                </div>
                
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {getMetricValue().toLocaleString('ar-SA')}
                </div>
                
                <div className={`text-sm flex items-center ${
                  periodData.growthRate > 0 ? 'text-green-600' : 
                  periodData.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {periodData.growthRate > 0 ? '↗' : periodData.growthRate < 0 ? '↘' : '→'}
                  <span className="mr-1">
                    {Math.abs(periodData.growthRate).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimePeriodComparison;
export type { ComparisonPeriod, ComparisonData };
