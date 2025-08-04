"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import {
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  PenTool,
  TrendingUp,
  User,
  Users,
  Zap
} from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  type: 'article' | 'comment' | 'user' | 'analysis' | 'system';
  timestamp: string;
  author?: string;
  priority?: 'high' | 'medium' | 'low';
  meta?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
}

interface SAASActivityCardsProps {
  activities?: ActivityItem[];
  showFilters?: boolean;
  maxItems?: number;
}

export default function SAASActivityCards({ 
  activities = [], 
  showFilters = true,
  maxItems = 10 
}: SAASActivityCardsProps) {
  const { darkMode } = useDarkModeContext();

  // بيانات تجريبية إذا لم يتم تمرير أنشطة
  const defaultActivities: ActivityItem[] = [
    {
      id: "1",
      title: "نشر مقال جديد: التطورات في الذكاء الاصطناعي",
      description: "تم نشر مقال جديد في قسم التكنولوجيا حول أحدث التطورات في مجال الذكاء الاصطناعي",
      status: 'completed',
      type: 'article',
      timestamp: "منذ 5 دقائق",
      author: "أحمد الكاتب",
      priority: 'high',
      meta: { views: 1247, likes: 89, comments: 23 }
    },
    {
      id: "2", 
      title: "تحليل عميق جاري التحضير",
      description: "يتم حالياً إعداد تحليل عميق حول اتجاهات السوق في الربع الأول",
      status: 'in_progress',
      type: 'analysis',
      timestamp: "منذ 15 دقيقة",
      author: "سارة المحللة",
      priority: 'medium',
      meta: { views: 0, likes: 0, comments: 0 }
    },
    {
      id: "3",
      title: "تعليق جديد على مقال الاقتصاد",
      description: "تم إضافة تعليق جديد يتطلب مراجعة المشرف",
      status: 'pending',
      type: 'comment',
      timestamp: "منذ 30 دقيقة",
      author: "قارئ مجهول",
      priority: 'low',
      meta: { views: 0, likes: 5, comments: 1 }
    },
    {
      id: "4",
      title: "انضمام مستخدم جديد",
      description: "تم تسجيل مستخدم جديد في المنصة",
      status: 'completed',
      type: 'user',
      timestamp: "منذ ساعة",
      author: "النظام",
      priority: 'low',
      meta: { views: 0, likes: 0, comments: 0 }
    },
    {
      id: "5",
      title: "فشل في تحليل المحتوى الذكي",
      description: "حدث خطأ أثناء معالجة المحتوى بواسطة الذكاء الاصطناعي",
      status: 'cancelled',
      type: 'system',
      timestamp: "منذ 2 ساعة",
      author: "النظام",
      priority: 'high',
      meta: { views: 0, likes: 0, comments: 0 }
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  const getStatusConfig = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: 'مكتمل',
          className: 'saas-status-badge saas-status-success',
          icon: CheckCircle
        };
      case 'in_progress':
        return {
          label: 'جاري التنفيذ',
          className: 'saas-status-badge saas-status-progress',
          icon: Clock
        };
      case 'pending':
        return {
          label: 'في الانتظار',
          className: 'saas-status-badge saas-status-warning',
          icon: Clock
        };
      case 'cancelled':
        return {
          label: 'ملغى',
          className: 'saas-status-badge saas-status-danger',
          icon: CheckCircle
        };
      default:
        return {
          label: 'غير محدد',
          className: 'saas-status-badge',
          icon: Clock
        };
    }
  };

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'article':
        return FileText;
      case 'comment':
        return MessageSquare;
      case 'user':
        return User;
      case 'analysis':
        return TrendingUp;
      case 'system':
        return Zap;
      default:
        return FileText;
    }
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      {showFilters && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              الأنشطة الأخيرة
            </h2>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              تتبع جميع الأنشطة والتحديثات في المنصة
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select className={`
              px-3 py-2 text-sm rounded-lg border transition-colors duration-200
              ${darkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
              }
            `}>
              <option value="all">جميع الأنشطة</option>
              <option value="articles">المقالات</option>
              <option value="comments">التعليقات</option>
              <option value="users">المستخدمون</option>
              <option value="system">النظام</option>
            </select>
            
            <button className="saas-btn-primary">
              إنشاء نشاط جديد
            </button>
          </div>
        </div>
      )}

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {limitedActivities.map((activity) => {
          const statusConfig = getStatusConfig(activity.status);
          const TypeIcon = getTypeIcon(activity.type);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={activity.id}
              className={`
                saas-card saas-hover-lift border-l-4 ${getPriorityColor(activity.priority)}
                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              `}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${activity.type === 'article' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'comment' ? 'bg-green-100 text-green-600' :
                      activity.type === 'user' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'analysis' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }
                  `}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm leading-tight ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {activity.title}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {activity.description}
                    </p>
                  </div>
                </div>
                
                <div className={statusConfig.className}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </div>
              </div>

              {/* Card Body - Meta Info */}
              {activity.meta && (
                <div className="flex items-center space-x-4 mb-3 text-xs">
                  {activity.meta.views > 0 && (
                    <span className={`flex items-center ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {activity.meta.views.toLocaleString()} مشاهدة
                    </span>
                  )}
                  {activity.meta.likes > 0 && (
                    <span className={`flex items-center ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      ❤️ {activity.meta.likes}
                    </span>
                  )}
                  {activity.meta.comments > 0 && (
                    <span className={`flex items-center ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {activity.meta.comments}
                    </span>
                  )}
                </div>
              )}

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Users className={`w-4 h-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {activity.author}
                  </span>
                </div>
                
                <span className={`text-xs ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {activity.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      <div className="text-center">
        <button className="saas-btn-secondary">
          عرض المزيد من الأنشطة
        </button>
      </div>
    </div>
  );
}