'use client';

import React, { useState } from 'react';
import { useEditorManager } from '@/hooks/useEditorManager';
import { EditorType, EditorConfig } from '@/lib/services/UnifiedEditorManager';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Monitor,
  Zap,
  FileText,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditorManagerDashboard: React.FC = () => {
  const {
    editors,
    activeEditor,
    isLoading,
    error,
    performanceMetrics,
    createEditor,
    destroyEditor,
    switchEditor,
    retryEditor,
    getEditorsByType,
    refreshEditors
  } = useEditorManager();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEditorType, setNewEditorType] = useState<EditorType>('tiptap');

  const handleCreateEditor = async () => {
    const config: EditorConfig = {
      type: newEditorType,
      autoSave: true,
      autoSaveInterval: 30000,
      enableAI: true,
      placeholder: `محرر ${newEditorType} جديد...`
    };

    try {
      await createEditor(config);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create editor:', error);
    }
  };

  const handleSwitchEditor = async (toId: string) => {
    if (!activeEditor) return;
    
    try {
      await switchEditor(activeEditor.id, toId);
    } catch (error) {
      console.error('Failed to switch editor:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'destroyed':
        return <Trash2 className="w-4 h-4 text-gray-500" />;
      default:
        return <Monitor className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'loading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'destroyed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getEditorTypeIcon = (type: EditorType) => {
    switch (type) {
      case 'tiptap':
        return <Edit3 className="w-4 h-4" />;
      case 'realtime':
        return <Zap className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'content-tiptap':
        return <Activity className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            مدير المحررات
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة ومراقبة جميع محررات المقالات
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={refreshEditors}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            محرر جديد
          </Button>
        </div>
      </div>

      {/* معلومات الأداء */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">إجمالي المحررات</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {performanceMetrics.totalEditors}
                </p>
              </div>
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">المحررات النشطة</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {performanceMetrics.activeEditors}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">متوسط التحميل</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  {Math.round(performanceMetrics.averageLoadTime)}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">معدل الأخطاء</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {Math.round(performanceMetrics.errorRate * 100)}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 dark:text-red-200 font-medium">خطأ في مدير المحررات</p>
          </div>
          <p className="text-red-700 dark:text-red-300 text-sm mt-1">
            {error.message}
          </p>
        </div>
      )}

      {/* نموذج إنشاء محرر جديد */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            إنشاء محرر جديد
          </h3>
          
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                نوع المحرر
              </label>
              <select
                value={newEditorType}
                onChange={(e) => setNewEditorType(e.target.value as EditorType)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="tiptap">TipTap Editor</option>
                <option value="realtime">Realtime Editor</option>
                <option value="content">Content Editor</option>
                <option value="content-tiptap">Content Editor with TipTap</option>
              </select>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleCreateEditor}
                size="sm"
                disabled={isLoading}
              >
                إنشاء
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                size="sm"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة المحررات */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          المحررات الحالية ({editors.length})
        </h3>
        
        {editors.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد محررات</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              إنشاء محرر جديد
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {editors.map((editor) => (
              <div
                key={editor.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  activeEditor?.id === editor.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getEditorTypeIcon(editor.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {editor.type} Editor
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(editor.status)}`}>
                          {getStatusIcon(editor.status)}
                          {editor.status}
                        </span>
                        {activeEditor?.id === editor.id && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                            نشط
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {editor.id.slice(-8)}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>التحميل: {Math.round(editor.performance.loadTime)}ms</span>
                        <span>آخر نشاط: {editor.lastActivity.toLocaleTimeString('ar-SA')}</span>
                        {editor.errors.length > 0 && (
                          <span className="text-red-600">
                            أخطاء: {editor.errors.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editor.status === 'error' && (
                      <Button
                        onClick={() => retryEditor(editor.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <RotateCcw className="w-3 h-3" />
                        إعادة محاولة
                      </Button>
                    )}
                    
                    {activeEditor?.id !== editor.id && editor.status === 'ready' && (
                      <Button
                        onClick={() => handleSwitchEditor(editor.id)}
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                      >
                        تفعيل
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => destroyEditor(editor.id)}
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                      disabled={activeEditor?.id === editor.id}
                    >
                      <Trash2 className="w-3 h-3" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorManagerDashboard;