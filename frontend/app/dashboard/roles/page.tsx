'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Shield, Users, Edit, Trash2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { SabqButton } from '@/components/ui/SabqButton';
import { SabqCard } from '@/components/ui/SabqCard';
import { SabqBadge } from '@/components/ui/SabqBadge';

interface Permission {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_system: boolean;
  users_count: number;
  permissions_count: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [expandedRoles, setExpandedRoles] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      const data = await response.json();
      if (data.success) {
        setPermissions(data.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const toggleRoleExpansion = (roleId: number) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      articles: 'المقالات',
      content: 'المحتوى',
      users: 'المستخدمين',
      system: 'النظام',
      ai: 'الذكاء الاصطناعي'
    };
    return names[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      articles: 'bg-blue-100 text-blue-800',
      content: 'bg-green-100 text-green-800',
      users: 'bg-purple-100 text-purple-800',
      system: 'bg-gray-100 text-gray-800',
      ai: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الأدوار والصلاحيات</h1>
          <p className="text-gray-600 mt-1">تحديد صلاحيات كل دور في النظام</p>
        </div>
        <SabqButton>
          <Plus className="h-4 w-4 ml-2" />
          إنشاء دور جديد
        </SabqButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SabqCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الأدوار</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </SabqCard>

        <SabqCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">أدوار مخصصة</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles.filter(r => !r.is_system).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </SabqCard>

        <SabqCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الصلاحيات</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(permissions).flat().length}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </SabqCard>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {loading ? (
          <SabqCard className="p-8 text-center">
            <p className="text-gray-500">جاري التحميل...</p>
          </SabqCard>
        ) : (
          roles.map((role) => (
            <SabqCard key={role.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleRoleExpansion(role.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedRoles.has(role.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <div className="mr-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                        {role.is_system && (
                          <SabqBadge variant="info" size="sm">
                            دور أساسي
                          </SabqBadge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {role.users_count} مستخدم
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          {role.permissions_count} صلاحية
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    {!role.is_system && (
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Permissions */}
                {expandedRoles.has(role.id) && (
                  <div className="mt-6 space-y-4">
                    {Object.entries(permissions).map(([category, perms]) => (
                      <div key={category} className="border-r-4 border-gray-200 pr-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(category)}`}>
                            {getCategoryName(category)}
                          </span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {perms.map((perm) => (
                            <label key={perm.id} className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                defaultChecked={Math.random() > 0.5} // للعرض التوضيحي
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{perm.name}</p>
                                <p className="text-xs text-gray-500">{perm.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <SabqButton variant="secondary" size="sm">
                        إلغاء
                      </SabqButton>
                      <SabqButton size="sm">
                        حفظ التغييرات
                      </SabqButton>
                    </div>
                  </div>
                )}
              </div>
            </SabqCard>
          ))
        )}
      </div>
    </div>
  );
} 