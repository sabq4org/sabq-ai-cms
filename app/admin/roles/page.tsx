'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import toast from 'react-hot-toast';
import { 
  Shield, 
  Users, 
  Crown, 
  Edit, 
  Search, 
  Plus, 
  Settings 
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
}

interface RoleCardProps {
  title: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
  permissionsCount?: number;
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  title, 
  description, 
  permissions, 
  isSystem = false,
  permissionsCount 
}) => {
  const getRoleIcon = () => {
    if (title.includes('مسؤول') || title.includes('admin')) return Crown;
    if (title.includes('محرر') || title.includes('editor')) return Edit;
    if (title.includes('مراسل') || title.includes('correspondent')) return Users;
    return Shield;
  };

  const Icon = getRoleIcon();

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${isSystem ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSystem ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Icon className={`h-5 w-5 ${isSystem ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {isSystem && (
                <Badge variant="secondary" className="text-xs mt-1">
                  دور النظام
                </Badge>
              )}
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">
              {permissionsCount || permissions.length}
            </div>
            <div className="text-xs text-gray-500">صلاحية</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        
        {permissions.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">أمثلة على الصلاحيات:</div>
            <div className="flex flex-wrap gap-1">
              {permissions.slice(0, 3).map((permission, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
              {permissions.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  +{permissions.length - 3} أخرى
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      console.log('🔍 جلب الأدوار من /api/admin/roles...');
      
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log(`✅ تم جلب ${data.count} دور بنجاح`);
        setRoles(data.data);
      } else {
        console.error('❌ فشل في جلب الأدوار:', data.error);
        toast.error(data.error || 'فشل في جلب الأدوار');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب الأدوار:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const parsePermissions = (permissions: any): string[] => {
    if (Array.isArray(permissions)) {
      return permissions;
    }
    if (typeof permissions === 'string') {
      try {
        return JSON.parse(permissions);
      } catch (error) {
        return [];
      }
    }
    return [];
  };

  const filteredRoles = roles.filter(role =>
    role.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systemRoles = filteredRoles.filter(role => role.is_system);
  const customRoles = filteredRoles.filter(role => !role.is_system);

  if (loading) {
    return (
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">جاري تحميل الأدوار...</p>
          </div>
        </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">إدارة الأدوار والصلاحيات</h1>
          <p className="text-sm sm:text-base text-gray-600">عرض وإدارة أدوار المستخدمين والصلاحيات المرتبطة بها</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الأدوار</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{roles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">أدوار النظام</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{systemRoles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">أدوار مخصصة</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{customRoles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الصلاحيات</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {roles.reduce((total, role) => total + parsePermissions(role.permissions).length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الأدوار والصلاحيات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => toast.info('ميزة إضافة دور جديد قريباً')}
            className="whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            دور جديد
          </Button>
        </div>

        {/* System Roles */}
        {systemRoles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">أدوار النظام</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {systemRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  title={role.display_name}
                  description={role.description || 'بدون وصف'}
                  permissions={parsePermissions(role.permissions)}
                  isSystem={true}
                  permissionsCount={parsePermissions(role.permissions).length}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Roles */}
        {customRoles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">الأدوار المخصصة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {customRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  title={role.display_name}
                  description={role.description || 'بدون وصف'}
                  permissions={parsePermissions(role.permissions)}
                  isSystem={false}
                  permissionsCount={parsePermissions(role.permissions).length}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRoles.length === 0 && !loading && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أدوار</h3>
            <p className="text-gray-600">
              {searchQuery ? 'لا توجد أدوار تطابق البحث الحالي' : 'لم يتم العثور على أي أدوار'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}