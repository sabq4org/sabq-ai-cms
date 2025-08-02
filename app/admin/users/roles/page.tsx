/**
 * إدارة الأدوار والصلاحيات
 * User Roles and Permissions Management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import RoleFormModal from '@/components/admin/RoleFormModal';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Users,
  Settings,
  Eye,
  EyeOff,
  Crown,
  UserCheck,
  Lock,
  Key
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  color: string;
  createdAt: string;
  level: number;
}

interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  isSystem: boolean;
}

export default function UserRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [stats, setStats] = useState({
    totalRoles: 0,
    activeRoles: 0,
    totalUsers: 0,
    adminUsers: 0
  });

  // جلب البيانات من قاعدة البيانات
  useEffect(() => {
    fetchRolesData();
  }, []);

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      console.log('🔍 جلب الأدوار من قاعدة البيانات...');
      
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log(`✅ تم جلب ${data.count} دور`);
        
        // تحويل البيانات للصيغة المطلوبة للواجهة
        const formattedRoles = data.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          displayName: role.display_name || role.name,
          description: role.description || 'بدون وصف',
          usersCount: 0, // سيتم حسابه لاحقاً
          permissions: Array.isArray(role.permissions) ? role.permissions : [],
          isActive: true,
          isSystem: role.is_system || false,
          color: role.is_system ? 'blue' : 'green',
          createdAt: role.created_at || new Date().toISOString(),
          level: role.name === 'admin' ? 1 : 
                 role.name === 'editor' ? 2 : 
                 role.name === 'correspondent' ? 3 : 
                 role.name === 'content-manager' ? 2 : 4
        }));
        
        setRoles(formattedRoles);
        
        // إحصائيات مبسطة
        setStats({
          totalRoles: formattedRoles.length,
          activeRoles: formattedRoles.filter((r: any) => r.isActive).length,
          totalUsers: 0, // سيتم حسابه لاحقاً
          adminUsers: 0  // سيتم حسابه لاحقاً
        });
        
        // صلاحيات افتراضية (يمكن تحسينها لاحقاً)
        setPermissions([
          { id: '1', name: 'users.view', displayName: 'عرض المستخدمين', description: 'عرض قائمة المستخدمين', category: 'المستخدمون', isSystem: true },
          { id: '2', name: 'users.create', displayName: 'إنشاء مستخدمين', description: 'إضافة مستخدمين جدد', category: 'المستخدمون', isSystem: true },
          { id: '3', name: 'articles.view', displayName: 'عرض المقالات', description: 'عرض قائمة المقالات', category: 'المحتوى', isSystem: true },
          { id: '4', name: 'articles.create', displayName: 'إنشاء مقالات', description: 'إضافة مقالات جديدة', category: 'المحتوى', isSystem: true },
          { id: '5', name: 'articles.edit', displayName: 'تعديل المقالات', description: 'تعديل المقالات الموجودة', category: 'المحتوى', isSystem: true },
          { id: '6', name: 'articles.delete', displayName: 'حذف المقالات', description: 'حذف المقالات', category: 'المحتوى', isSystem: true }
        ]);
        
      } else {
        console.error('❌ فشل في جلب الأدوار:', data.error);
        toast.error(data.error || 'فشل في جلب الأدوار والصلاحيات');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب البيانات:', error);
      toast.error('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-700 border-red-200';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'gray': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (level: number) => {
    switch (level) {
      case 1: return Crown;
      case 2: return Shield;
      case 3: return Edit;
      case 4: return UserCheck;
      default: return Users;
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // فتح نموذج إضافة دور جديد
  const handleAddRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  // فتح نموذج تعديل دور
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  // حذف دور
  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('تم حذف الدور بنجاح');
        fetchRolesData();
      } else {
        toast.error(data.error || 'فشل في حذف الدور');
      }
    } catch (error) {
      console.error('خطأ في حذف الدور:', error);
      toast.error('حدث خطأ في حذف الدور');
    }
  };

  // تبديل حالة الدور (تفعيل/تعطيل)
  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isActive ? 'تم تعطيل الدور' : 'تم تفعيل الدور');
        fetchRolesData();
      } else {
        toast.error(data.error || 'فشل في تحديث حالة الدور');
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الدور:', error);
      toast.error('حدث خطأ في تحديث حالة الدور');
    }
  };

  // إغلاق النموذج
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  // نجاح العملية
  const handleSuccess = () => {
    fetchRolesData();
  };

  return (
    <div className="space-y-6">
        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles">الأدوار</TabsTrigger>
            <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            {/* شريط الأدوات العلوي */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddRole}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  دور جديد
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  إعدادات الأدوار
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="البحث في الأدوار..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* الإحصائيات السريعة */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'إجمالي الأدوار', value: stats.totalRoles.toString(), icon: Shield },
                { title: 'الأدوار النشطة', value: stats.activeRoles.toString(), icon: Eye },
                { title: 'إجمالي المستخدمين', value: stats.totalUsers.toString(), icon: Users },
                { title: 'المستخدمين المدراء', value: stats.adminUsers.toString(), icon: Crown }
              ].map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* قائمة الأدوار */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">جارٍ تحميل الأدوار والصلاحيات...</p>
                </div>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا توجد أدوار حالياً</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map((role) => {
                const RoleIcon = getRoleIcon(role.level);
                return (
                  <Card key={role.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* اسم الدور والأيقونة */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getColorClass(role.color)}`}>
                              <RoleIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{role.displayName}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {role.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={role.isActive ? 'default' : 'secondary'}>
                              {role.isActive ? 'نشط' : 'معطل'}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  تحرير
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Users className="h-4 w-4 mr-2" />
                                  عرض المستخدمين
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleRole(role.id, role.isActive)}>
                                  {role.isActive ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      تعطيل
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      تفعيل
                                    </>
                                  )}
                                </DropdownMenuItem>
                                {!role.isSystem && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteRole(role.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    حذف
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* الوصف */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {role.description}
                        </p>

                        {/* عدد الصلاحيات */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Key className="h-4 w-4" />
                          <span>
                            {role.permissions.includes('*') 
                              ? 'جميع الصلاحيات' 
                              : `${role.permissions.length} صلاحية`
                            }
                          </span>
                        </div>

                        {/* إحصائيات المستخدمين */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{role.usersCount} مستخدم</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            تحرير
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            )}

            {/* إضافة دور جديد */}
            <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">إضافة دور جديد</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      قم بإنشاء دور جديد وتحديد صلاحياته
                    </p>
                  </div>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddRole}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إنشاء دور
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            {/* شريط الأدوات للصلاحيات */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  صلاحية جديدة
                </Button>
                <Button variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  صلاحيات النظام
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="البحث في الصلاحيات..."
                  className="w-64"
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* قائمة الصلاحيات مجمعة حسب التصنيف */}
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {category === 'articles' && 'المقالات'}
                      {category === 'users' && 'المستخدمين'}
                      {category === 'categories' && 'التصنيفات'}
                      {category === 'media' && 'الوسائط'}
                      {category === 'system' && 'النظام'}
                      <Badge variant="secondary">{categoryPermissions.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{permission.displayName}</h4>
                              {permission.isSystem && (
                                <Badge variant="outline" className="text-xs">
                                  نظام
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {permission.description}
                            </p>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {permission.name}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* نموذج إضافة/تعديل الدور */}
      <RoleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        role={editingRole}
        permissions={permissions}
      />
    </div>
  );
};
