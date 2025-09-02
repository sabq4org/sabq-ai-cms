'use client';

import React, { useState, useEffect } from 'react';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Filter, BarChart3, TrendingUp, Eye, Edit, 
  Trash2, ExternalLink, Network, Users, MapPin, Calendar,
  Star, Brain, Target, Globe, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SmartEntity {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  entity_type: {
    name: string;
    name_ar: string;
    icon: string;
    color: string;
  };
  description: string;
  importance_score: number;
  is_active: boolean;
  mention_count: number;
  click_count: number;
  location?: string;
  country?: string;
  official_website?: string;
  created_at: string;
}

interface EntityStats {
  totalEntities: number;
  activeEntities: number;
  totalMentions: number;
  totalClicks: number;
  topEntities: SmartEntity[];
  recentEntities: SmartEntity[];
}

export default function SmartEntitiesManagement() {
  const [entities, setEntities] = useState<SmartEntity[]>([]);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [stats, setStats] = useState<EntityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntity, setEditingEntity] = useState<SmartEntity | null>(null);
  const [activeTab, setActiveTab] = useState('entities');

  // نموذج للكيان الجديد
  const [newEntity, setNewEntity] = useState({
    name: '',
    name_ar: '',
    name_en: '',
    entity_type_id: '',
    description: '',
    importance_score: 5,
    location: '',
    country: 'SA',
    official_website: '',
    aliases: []
  });

  // جلب البيانات
  useEffect(() => {
    fetchEntities();
    fetchEntityTypes();
    fetchStats();
  }, []);

  const fetchEntities = async () => {
    try {
      const response = await fetch('/api/smart-entities');
      const data = await response.json();
      setEntities(data.entities || []);
    } catch (error) {
      console.error('خطأ في جلب الكيانات:', error);
      toast.error('فشل في جلب الكيانات');
    }
  };

  const fetchEntityTypes = async () => {
    try {
      const response = await fetch('/api/smart-entities/types');
      const data = await response.json();
      setEntityTypes(data.types || []);
    } catch (error) {
      console.error('خطأ في جلب أنواع الكيانات:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/smart-entities/stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      setLoading(false);
    }
  };

  const handleAddEntity = async () => {
    try {
      const response = await fetch('/api/smart-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntity)
      });

      if (response.ok) {
        toast.success('تم إضافة الكيان بنجاح');
        setShowAddDialog(false);
        setNewEntity({
          name: '',
          name_ar: '',
          name_en: '',
          entity_type_id: '',
          description: '',
          importance_score: 5,
          location: '',
          country: 'SA',
          official_website: '',
          aliases: []
        });
        fetchEntities();
        fetchStats();
      } else {
        throw new Error('فشل في إضافة الكيان');
      }
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('فشل في إضافة الكيان');
    }
  };

  const handleDeleteEntity = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكيان؟')) return;

    try {
      const response = await fetch(`/api/smart-entities/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('تم حذف الكيان بنجاح');
        fetchEntities();
        fetchStats();
      } else {
        throw new Error('فشل في حذف الكيان');
      }
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('فشل في حذف الكيان');
    }
  };

  // تصفية الكيانات
  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || entity.entity_type.name === selectedType;
    
    return matchesSearch && matchesType;
  });

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">إجمالي الكيانات</p>
                <p className="text-2xl font-bold">{stats.totalEntities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">الكيانات النشطة</p>
                <p className="text-2xl font-bold">{stats.activeEntities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">إجمالي الإشارات</p>
                <p className="text-2xl font-bold">{stats.totalMentions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">إجمالي النقرات</p>
                <p className="text-2xl font-bold">{stats.totalClicks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEntityCard = (entity: SmartEntity) => (
    <Card key={entity.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{entity.entity_type.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{entity.name_ar}</h3>
              {entity.name_en && (
                <p className="text-sm text-gray-500">{entity.name_en}</p>
              )}
              <Badge 
                variant="outline" 
                className="mt-1"
                style={{ borderColor: entity.entity_type.color }}
              >
                {entity.entity_type.name_ar}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {'⭐'.repeat(Math.min(Math.max(Math.round(entity.importance_score / 2), 1), 5))}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {entity.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {entity.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {entity.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {entity.mention_count} إشارة
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {entity.click_count} نقرة
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {entity.official_website && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={() => window.open(entity.official_website, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2"
              onClick={() => setEditingEntity(entity)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 text-red-500 hover:text-red-700"
              onClick={() => handleDeleteEntity(entity.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          
          <Badge variant={entity.is_active ? 'default' : 'secondary'}>
            {entity.is_active ? 'نشط' : 'معطل'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderAddEntityDialog = () => (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إضافة كيان ذكي جديد</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">الاسم بالعربية *</label>
              <Input
                value={newEntity.name_ar}
                onChange={(e) => setNewEntity({...newEntity, name_ar: e.target.value})}
                placeholder="أدخل الاسم بالعربية"
              />
            </div>
            <div>
              <label className="text-sm font-medium">الاسم بالإنجليزية</label>
              <Input
                value={newEntity.name_en}
                onChange={(e) => setNewEntity({...newEntity, name_en: e.target.value})}
                placeholder="Enter name in English"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">نوع الكيان *</label>
            <Select value={newEntity.entity_type_id} onValueChange={(value) => setNewEntity({...newEntity, entity_type_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الكيان" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.name_ar}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">الوصف *</label>
            <Textarea
              value={newEntity.description}
              onChange={(e) => setNewEntity({...newEntity, description: e.target.value})}
              placeholder="أدخل وصف الكيان"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">الموقع</label>
              <Input
                value={newEntity.location}
                onChange={(e) => setNewEntity({...newEntity, location: e.target.value})}
                placeholder="المدينة أو المنطقة"
              />
            </div>
            <div>
              <label className="text-sm font-medium">الموقع الرسمي</label>
              <Input
                value={newEntity.official_website}
                onChange={(e) => setNewEntity({...newEntity, official_website: e.target.value})}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">درجة الأهمية (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={newEntity.importance_score}
              onChange={(e) => setNewEntity({...newEntity, importance_score: parseInt(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>{newEntity.importance_score}</span>
              <span>10</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddEntity}>
              إضافة الكيان
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>جاري تحميل الكيانات الذكية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            إدارة الكيانات الذكية
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            إدارة قاعدة بيانات الكيانات والروابط الذكية
          </p>
        </div>
        
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          إضافة كيان
        </Button>
      </div>

      {/* الإحصائيات */}
      {renderStatsCards()}

      {/* التبويبات */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="entities">الكيانات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="space-y-4">
          {/* أدوات البحث والتصفية */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="البحث في الكيانات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="تصفية حسب النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {entityTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.name_ar}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* قائمة الكيانات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntities.map(renderEntityCard)}
          </div>

          {filteredEntities.length === 0 && (
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">لا توجد كيانات</h3>
                <p className="text-gray-500 mb-4">لم يتم العثور على كيانات تطابق البحث</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة كيان جديد
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle>تحليلات متقدمة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">ستتم إضافة التحليلات المتقدمة قريباً...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle>إعدادات النظام</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">ستتم إضافة إعدادات النظام قريباً...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* نافذة إضافة كيان */}
      {renderAddEntityDialog()}
      </div>
  );
}