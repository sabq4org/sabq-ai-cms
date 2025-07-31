'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { Loader2, Shield, Key, Save, X } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

interface Role {
  id?: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  level: number;
  permissions: any[];
  isActive?: boolean;
  isSystem?: boolean;
}

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: Role | null;
  permissions: Permission[];
}

export default function RoleFormModal({
  isOpen,
  onClose,
  onSuccess,
  role,
  permissions
}: RoleFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    color: 'gray',
    level: 10,
    permissions: [] as string[]
  });

  const isEditMode = !!role;

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        color: role.color || 'gray',
        level: role.level || 10,
        permissions: role.permissions.map((p: any) => p.id || p)
      });
    } else {
      setFormData({
        name: '',
        displayName: '',
        description: '',
        color: 'gray',
        level: 10,
        permissions: []
      });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.displayName) {
      toast.error('يرجى إدخال اسم الدور والاسم المعروض');
      return;
    }

    setLoading(true);

    try {
      const url = isEditMode 
        ? `/api/roles/${role.id}`
        : '/api/roles';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEditMode ? 'تم تحديث الدور بنجاح' : 'تم إنشاء الدور بنجاح');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('حدث خطأ في العملية');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const toggleAllPermissions = (category: string, permissionIds: string[]) => {
    const allSelected = permissionIds.every(id => formData.permissions.includes(id));
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(id => !permissionIds.includes(id))
        : [...new Set([...prev.permissions, ...permissionIds])]
    }));
  };

  // تجميع الصلاحيات حسب الفئة
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const categoryLabels: Record<string, string> = {
    articles: 'المقالات',
    users: 'المستخدمين',
    categories: 'التصنيفات',
    media: 'الوسائط',
    comments: 'التعليقات',
    system: 'النظام'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isEditMode ? 'تعديل الدور' : 'إضافة دور جديد'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'قم بتعديل معلومات الدور وصلاحياته'
              : 'قم بإنشاء دور جديد وتحديد صلاحياته'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
              <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الدور (بالإنجليزية)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="admin"
                    disabled={isEditMode && role?.isSystem}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">الاسم المعروض</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="مدير النظام"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر لمهام ومسؤوليات هذا الدور"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">اللون</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">أحمر</SelectItem>
                      <SelectItem value="blue">أزرق</SelectItem>
                      <SelectItem value="green">أخضر</SelectItem>
                      <SelectItem value="yellow">أصفر</SelectItem>
                      <SelectItem value="purple">بنفسجي</SelectItem>
                      <SelectItem value="gray">رمادي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">المستوى</Label>
                  <Input
                    id="level"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 10 })}
                  />
                  <p className="text-xs text-gray-500">كلما قل الرقم، زادت الأهمية</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                    const categoryPermissionIds = categoryPermissions.map(p => p.id);
                    const allSelected = categoryPermissionIds.every(id => 
                      formData.permissions.includes(id)
                    );
                    const someSelected = categoryPermissionIds.some(id => 
                      formData.permissions.includes(id)
                    );

                    return (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            {categoryLabels[category] || category}
                            <Badge variant="secondary" className="text-xs">
                              {categoryPermissions.length}
                            </Badge>
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAllPermissions(category, categoryPermissionIds)}
                          >
                            {allSelected ? 'إلغاء الكل' : 'تحديد الكل'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 pl-6">
                          {categoryPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-2 space-x-reverse p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Checkbox
                                id={permission.id}
                                checked={formData.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={permission.id}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {permission.displayName}
                                </label>
                                <p className="text-xs text-gray-500">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'حفظ التغييرات' : 'إنشاء الدور'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}