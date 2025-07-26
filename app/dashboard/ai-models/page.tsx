/**
 * صفحة إدارة نماذج الذكاء الاصطناعي
 * AI Models Management Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Play,
  Pause,
  Download,
  Upload,
  Settings,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface MLModel {
  id: string;
  name: string;
  type: string;
  version: string;
  status: string;
  description?: string;
  config: any;
  performance_metrics?: any;
  created_at: string;
  updated_at: string;
}

interface TrainingJob {
  id: string;
  model_id: string;
  status: string;
  progress: number;
  config: any;
  metrics: any;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

interface ModelTemplate {
  id: string;
  name: string;
  name_ar: string;
  description_ar: string;
  type: string;
  difficulty_level: string;
  estimated_training_time: string;
  use_cases: string[];
}

export default function AIModelsPage() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [templates, setTemplates] = useState<ModelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'models' | 'training' | 'templates'>('models');
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    type: 'sentiment_analysis',
    description: '',
    template_id: ''
  });
  const [trainingConfig, setTrainingConfig] = useState({
    dataset_path: '',
    batch_size: 32,
    epochs: 10,
    learning_rate: 0.001,
    validation_split: 0.2
  });

  // تحميل البيانات
  const loadData = async () => {
    try {
      setLoading(true);

      // تحميل النماذج
      const modelsResponse = await fetch('/api/admin/ai-models');
      const modelsData = await modelsResponse.json();
      if (modelsData.success) {
        setModels(modelsData.models || []);
      }

      // تحميل مهام التدريب
      const trainingResponse = await fetch('/api/admin/ai-models/training');
      const trainingData = await trainingResponse.json();
      if (trainingData.success) {
        setTrainingJobs(trainingData.training_jobs || []);
      }

      // تحميل القوالب
      const templatesResponse = await fetch('/api/admin/ai-models?templates=true');
      const templatesData = await templatesResponse.json();
      if (templatesData.success) {
        setTemplates(templatesData.templates || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // إنشاء نموذج جديد
  const createModel = async () => {
    try {
      const template = templates.find(t => t.id === newModel.template_id);
      if (!template) {
        alert('يرجى اختيار قالب');
        return;
      }

      const response = await fetch('/api/admin/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newModel.name,
          type: newModel.type,
          description: newModel.description,
          config: {} // سيتم تعيين التكوين الافتراضي من الخادم
        })
      });

      const result = await response.json();

      if (response.ok) {
        await loadData();
        setShowCreateForm(false);
        setNewModel({ name: '', type: 'sentiment_analysis', description: '', template_id: '' });
        alert('تم إنشاء النموذج بنجاح');
      } else {
        alert('خطأ في الإنشاء: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating model:', error);
      alert('فشل في إنشاء النموذج');
    }
  };

  // بدء التدريب
  const startTraining = async (modelId: string) => {
    try {
      const response = await fetch('/api/admin/ai-models/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: modelId,
          config: {
            ...trainingConfig,
            hardware: { use_gpu: false },
            early_stopping: { enabled: true, patience: 5 }
          }
        })
      });

      const result = await response.json();

      if (response.ok) {
        await loadData();
        setShowTrainingForm(false);
        alert('تم بدء التدريب بنجاح');
      } else {
        alert('خطأ في بدء التدريب: ' + result.error);
      }
    } catch (error) {
      console.error('Error starting training:', error);
      alert('فشل في بدء التدريب');
    }
  };

  // نشر النموذج
  const deployModel = async (modelId: string) => {
    try {
      const response = await fetch('/api/admin/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deploy',
          model_id: modelId,
          deployment_config: {
            endpoint_name: `model_${modelId}`,
            auto_scaling: { enabled: true, min_instances: 1, max_instances: 3 }
          }
        })
      });

      const result = await response.json();

      if (response.ok) {
        await loadData();
        alert('تم نشر النموذج بنجاح');
      } else {
        alert('خطأ في النشر: ' + result.error);
      }
    } catch (error) {
      console.error('Error deploying model:', error);
      alert('فشل في نشر النموذج');
    }
  };

  // حذف النموذج
  const deleteModel = async (modelId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا النموذج؟')) return;

    try {
      const response = await fetch(`/api/admin/ai-models?id=${modelId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadData();
        alert('تم حذف النموذج بنجاح');
      } else {
        const result = await response.json();
        alert('خطأ في الحذف: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('فشل في حذف النموذج');
    }
  };

  useEffect(() => {
    loadData();
    // تحديث البيانات كل 30 ثانية
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'trained': return <Target className="w-5 h-5 text-blue-600" />;
      case 'training': return <Activity className="w-5 h-5 text-yellow-600 animate-pulse" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'trained': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">النماذج المتاحة</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {models.length} نموذج
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء نموذج
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* جدول النماذج */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">النموذج</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">الأداء</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {models.map(model => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{model.name}</div>
                      <div className="text-sm text-gray-500">الإصدار {model.version}</div>
                      {model.description && (
                        <div className="text-sm text-gray-500">{model.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {model.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(model.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(model.status)}`}>
                        {model.status === 'deployed' ? 'منشور' :
                         model.status === 'trained' ? 'مدرب' :
                         model.status === 'training' ? 'قيد التدريب' :
                         model.status === 'failed' ? 'فشل' : 'مسودة'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {model.performance_metrics ? (
                      <div className="text-sm">
                        <div>دقة: {(model.performance_metrics.accuracy * 100).toFixed(1)}%</div>
                        <div className="text-gray-500">F1: {model.performance_metrics.f1_score?.toFixed(3)}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">غير متاح</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {model.status === 'draft' && (
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setShowTrainingForm(true);
                          }}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="بدء التدريب"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {model.status === 'trained' && (
                        <button
                          onClick={() => deployModel(model.id)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="نشر النموذج"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedModel(model)}
                        className="p-2 text-gray-600 hover:text-gray-800"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteModel(model.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTrainingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">مهام التدريب</h2>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          {trainingJobs.filter(job => job.status === 'running').length} قيد التشغيل
        </span>
      </div>

      <div className="grid gap-4">
        {trainingJobs.map(job => (
          <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  النموذج: {models.find(m => m.id === job.model_id)?.name || 'غير معروف'}
                </h3>
                <p className="text-sm text-gray-500">بدأ في: {new Date(job.created_at).toLocaleString('ar')}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                  {job.status === 'running' ? 'قيد التشغيل' :
                   job.status === 'completed' ? 'مكتمل' :
                   job.status === 'failed' ? 'فشل' : job.status}
                </span>
              </div>
            </div>

            {/* شريط التقدم */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">التقدم</span>
                <span className="text-sm font-medium">{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                ></div>
              </div>
            </div>

            {/* مقاييس التدريب */}
            {job.metrics && Object.keys(job.metrics).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {job.metrics.current_epoch && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{job.metrics.current_epoch}</div>
                    <div className="text-xs text-gray-500">العصر الحالي</div>
                  </div>
                )}
                {job.metrics.loss && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{job.metrics.loss.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">الخسارة</div>
                  </div>
                )}
                {job.metrics.accuracy && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{(job.metrics.accuracy * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">الدقة</div>
                  </div>
                )}
                {job.metrics.val_accuracy && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{(job.metrics.val_accuracy * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">دقة التحقق</div>
                  </div>
                )}
              </div>
            )}

            {/* رسالة الخطأ */}
            {job.error_message && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{job.error_message}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">قوالب النماذج</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">{template.name_ar}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.description_ar}</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">النوع:</span>
                <span className="font-medium">{template.type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">المستوى:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  template.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                  template.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {template.difficulty_level === 'beginner' ? 'مبتدئ' :
                   template.difficulty_level === 'intermediate' ? 'متوسط' : 'متقدم'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">وقت التدريب:</span>
                <span className="font-medium">{template.estimated_training_time}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">حالات الاستخدام:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {template.use_cases.slice(0, 3).map((useCase, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setNewModel(prev => ({ ...prev, template_id: template.id, type: template.type }));
                setShowCreateForm(true);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              استخدام هذا القالب
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">نماذج الذكاء الاصطناعي</h1>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{models.length}</div>
              <div className="text-sm text-gray-500">إجمالي النماذج</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {models.filter(m => m.status === 'deployed').length}
              </div>
              <div className="text-sm text-gray-500">منشور</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {trainingJobs.filter(j => j.status === 'running').length}
              </div>
              <div className="text-sm text-gray-500">قيد التدريب</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{templates.length}</div>
              <div className="text-sm text-gray-500">قوالب متاحة</div>
            </div>
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" dir="ltr">
              {[
                { id: 'models', label: 'النماذج', icon: Brain },
                { id: 'training', label: 'التدريب', icon: TrendingUp },
                { id: 'templates', label: 'القوالب', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-500">جاري التحميل...</span>
              </div>
            ) : (
              <>
                {activeTab === 'models' && renderModelsTab()}
                {activeTab === 'training' && renderTrainingTab()}
                {activeTab === 'templates' && renderTemplatesTab()}
              </>
            )}
          </div>
        </div>

        {/* نموذج إنشاء النموذج */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">إنشاء نموذج جديد</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم النموذج</label>
                  <input
                    type="text"
                    value={newModel.name}
                    onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القالب</label>
                  <select
                    value={newModel.template_id}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      setNewModel(prev => ({ 
                        ...prev, 
                        template_id: e.target.value,
                        type: template?.type || prev.type
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر قالب</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    value={newModel.description}
                    onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={createModel}
                  disabled={!newModel.name || !newModel.template_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  إنشاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* نموذج التدريب */}
        {showTrainingForm && selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                بدء تدريب النموذج: {selectedModel.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مسار البيانات</label>
                  <input
                    type="text"
                    value={trainingConfig.dataset_path}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, dataset_path: e.target.value }))}
                    placeholder="/path/to/dataset.csv"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">حجم الدفعة</label>
                    <input
                      type="number"
                      value={trainingConfig.batch_size}
                      onChange={(e) => setTrainingConfig(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عدد العصور</label>
                    <input
                      type="number"
                      value={trainingConfig.epochs}
                      onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">معدل التعلم</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={trainingConfig.learning_rate}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, learning_rate: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTrainingForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => startTraining(selectedModel.id)}
                  disabled={!trainingConfig.dataset_path}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  بدء التدريب
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
