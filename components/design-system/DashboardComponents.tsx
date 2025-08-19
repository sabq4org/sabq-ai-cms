/**
 * مكتبة المكونات الموحدة لوحة التحكم
 * Unified Dashboard Components Library
 *
 * تحتوي على المكونات المعيارية المستخدمة عبر لوحة التحكم
 * للحفاظ على التناسق والتصميم الموحد
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/config/localization";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Calendar,
  ChevronRight,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Globe,
  MoreHorizontal,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import React from "react";

// أنواع البيانات المشتركة
export interface DashboardStats {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
    period?: string;
  };
  icon?: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
}

export interface TableAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "success" | "warning";
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// بطاقة الإحصائيات
export const StatsCard: React.FC<DashboardStats & { className?: string }> = ({
  title,
  value,
  change,
  icon,
  color = "blue",
  className,
}) => {
  const colorVariants = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500",
  };

  return (
    <Card className={cn("p-6 hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>

          {change && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                trendColors[change.trend]
              )}
            >
              {change.trend === "up" && <ArrowUp className="w-4 h-4" />}
              {change.trend === "down" && <ArrowDown className="w-4 h-4" />}
              <span className="font-medium">
                {change.value > 0 ? "+" : ""}
                {change.value}%
              </span>
              {change.period && (
                <span className="text-gray-500">منذ {change.period}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className={cn("p-3 rounded-xl border", colorVariants[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// عنوان الصفحة الموحد
export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}> = ({ title, description, actions, breadcrumbs, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* مسار التنقل */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* العنوان والوصف */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};

// جدول البيانات الموحد
export const DataTable: React.FC<{
  data: any[];
  columns: TableColumn[];
  actions?: (item: any) => TableAction[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}> = ({
  data,
  columns,
  actions,
  loading,
  emptyMessage = "لا توجد بيانات",
  className,
}) => {
  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 dark:bg-gray-700 rounded"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={cn("p-12 text-center", className)}>
        <div className="text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 w-24">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-center">
                    <ActionsDropdown actions={actions(item)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// قائمة الإجراءات المنسدلة
export const ActionsDropdown: React.FC<{
  actions: TableAction[];
}> = ({ actions }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 p-0"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-sm text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                  action.variant === "danger" &&
                    "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
                  index === 0 && "rounded-t-lg",
                  index === actions.length - 1 && "rounded-b-lg"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// شريط البحث والفلترة
export const SearchAndFilterBar: React.FC<{
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  searchPlaceholder?: string;
  className?: string;
}> = ({
  onSearch,
  onFilter,
  onExport,
  onAdd,
  addLabel = "إضافة جديد",
  searchPlaceholder = "البحث...",
  className,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between",
        className
      )}
    >
      {/* البحث */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* الإجراءات */}
      <div className="flex items-center gap-3">
        {onFilter && (
          <Button variant="outline" size="sm" onClick={onFilter}>
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        )}

        {onAdd && (
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus className="w-4 h-4 ml-2" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

// حالة الخطأ الموحدة
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = "حدث خطأ",
  message = "عذراً، حدث خطأ غير متوقع",
  onRetry,
  className,
}) => {
  return (
    <div className={cn("p-12 text-center", className)}>
      <div className="text-red-500 mb-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
          {title}
        </h3>
        <p className="text-red-600 dark:text-red-500 mb-6">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        )}
      </div>
    </div>
  );
};

// حالة التحميل الموحدة
export const LoadingState: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = "جاري التحميل...", className }) => {
  return (
    <div className={cn("p-12 text-center", className)}>
      <div className="animate-pulse">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

// حالة فارغة موحدة
export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}> = ({
  title = "لا توجد بيانات",
  message = "لم يتم العثور على أي عناصر",
  action,
  icon,
  className,
}) => {
  return (
    <div className={cn("p-12 text-center", className)}>
      <div className="text-gray-400 dark:text-gray-600 mb-4">
        {icon || <FileText className="w-16 h-16 mx-auto mb-4" />}
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        {action && (
          <Button variant="primary" onClick={action.onClick}>
            <Plus className="w-4 h-4 ml-2" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

// مجموعة الإحصائيات
export const StatsGrid: React.FC<{
  stats: DashboardStats[];
  className?: string;
}> = ({ stats, className }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

// مكونات الأيقونات المشتركة
export const DashboardIcons = {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  Edit,
  Eye,
  FileText,
  Globe,
  PieChart,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
  TrendingDown,
  User,
  Users,
};

// لا تقم بتصدير كائن كـ default حتى لا يُستخدم كمكون React بالخطأ
export const DashboardComponents = {
  StatsCard,
  PageHeader,
  DataTable,
  ActionsDropdown,
  SearchAndFilterBar,
  ErrorState,
  LoadingState,
  EmptyState,
  StatsGrid,
  DashboardIcons,
};
