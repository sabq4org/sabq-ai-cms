'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Users, Lock, Eye, X, Save, Trash2, Edit3, CheckCircle } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
  users: number;
  permissions: string[];
  color: string;
}

export default function RolesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: 'رئيس التحرير', description: 'إدارة شاملة للمحتوى والفريق', users: 2, permissions: ['create_articles', 'edit_articles', 'delete_articles', 'publish_articles', 'manage_users'], color: 'blue' },
    { id: 2, name: 'محرر', description: 'كتابة وتحرير المقالات', users: 8, permissions: ['create_articles', 'edit_articles', 'publish_articles'], color: 'green' },
    { id: 3, name: 'مدقق', description: 'مراجعة وتدقيق المحتوى', users: 3, permissions: ['edit_articles', 'review_articles'], color: 'purple' },
    { id: 4, name: 'مسوق المحتوى', description: 'تسويق ونشر المحتوى', users: 2, permissions: ['view_articles', 'share_articles'], color: 'orange' }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    color: 'blue'
  });

  const availablePermissions = [
    { id: 'create_articles', name: 'إنشاء المقالات', category: 'المحتوى' },
    { id: 'edit_articles', name: 'تعديل المقالات', category: 'المحتوى' },
    { id: 'delete_articles', name: 'حذف المقالات', category: 'المحتوى' },
    { id: 'publish_articles', name: 'نشر المقالات', category: 'المحتوى' },
    { id: 'review_articles', name: 'مراجعة المقالات', category: 'المحتوى' },
    { id: 'manage_users', name: 'إدارة المستخدمين', category: 'المستخدمين' },
    { id: 'view_analytics', name: 'عرض الإحصائيات', category: 'النظام' },
    { id: 'manage_settings', name: 'إدارة الإعدادات', category: 'النظام' }
  ];

  const colors = [
    { name: 'أزرق', value: 'blue' },
    { name: 'أخضر', value: 'green' },
    { name: 'بنفسجي', value: 'purple' },
    { name: 'برتقالي', value: 'orange' },
    { name: 'أحمر', value: 'red' },
    { name: 'سماوي', value: 'cyan' }
  ];

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  const showSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleCreateRole = () => {
    if (formData.name && formData.description) {
      const newRole: Role = {
        id: Math.max(...roles.map(r => r.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        users: 0,
        permissions: formData.permissions,
        color: formData.color
      };
      
      setRoles([...roles, newRole]);
      setFormData({ name: '', description: '', permissions: [], color: 'blue' });
      setShowCreateModal(false);
      showSuccess();
    }
  };

  const handleEditRole = () => {
    if (selectedRole && formData.name && formData.description) {
      setRoles(roles.map(role => 
        role.id === selectedRole.id 
          ? { ...role, name: formData.name, description: formData.description, permissions: formData.permissions, color: formData.color }
          : role
      ));
      setShowEditModal(false);
      setSelectedRole(null);
      showSuccess();
    }
  };

  const handleDeleteRole = (roleId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الدور؟')) {
      setRoles(roles.filter(role => role.id !== roleId));
      showSuccess();
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
      color: role.color
    });
    setShowEditModal(true);
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' }
    };
    return colorMap[color] || colorMap.blue;
  };

  const totalUsers = roles.reduce((sum, role) => sum + role.users, 0);

  return (
    <div className={`p-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : ''}`}>
      {/* رسالة النجاح */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          تم تحديث الأدوار بنجاح!
        </div>
      )}

      {/* العنوان والوصف */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>إدارة الأدوار والصلاحيات</h1>
        <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>إدارة أدوار المستخدمين وصلاحياتهم في النظام</p>
      </div>

      {/* قسم الإحصائيات - نفس التصميم المعتمد */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className={`text-sm mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>إجمالي الأدوار</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{roles.length}</span>
                <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>دور نشط</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className={`text-sm mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>إجمالي المستخدمين</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{totalUsers}</span>
                <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>مستخدم</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className={`text-sm mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>الصلاحيات المتاحة</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{availablePermissions.length}</span>
                <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>صلاحية</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* زر إضافة دور جديد */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className={`text-xl font-semibold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>الأدوار المتاحة</h2>
        <button 
          onClick={() => {
            setFormData({ name: '', description: '', permissions: [], color: 'blue' });
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          إضافة دور جديد
        </button>
      </div>

      {/* شبكة الأدوار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const colorClasses = getColorClasses(role.color);
          return (
            <div key={role.id} className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
                    <Shield className={`w-6 h-6 ${colorClasses.text}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{role.name}</h3>
                    <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{role.description}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => openEditModal(role)}
                    className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-600'}`}
                    title="تعديل الدور"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteRole(role.id)}
                    className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'}`}
                    title="حذف الدور"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>المستخدمين</span>
                  <span className={`text-lg font-semibold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{role.users}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>الصلاحيات</span>
                  <span className={`text-lg font-semibold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{role.permissions.length}</span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <span key={index} className={`text-xs px-2 py-1 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
                        {availablePermissions.find(p => p.id === permission)?.name || permission}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        +{role.permissions.length - 3} أخرى
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* نوافذ منبثقة للإنشاء والتعديل */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {showCreateModal ? 'إنشاء دور جديد' : `تعديل الدور: ${selectedRole?.name}`}
                </h2>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>اسم الدور</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    placeholder="مثال: محرر أول"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>وصف الدور</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    placeholder="وصف مختصر لمهام ومسؤوليات هذا الدور"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>اللون</label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({...formData, color: color.value})}
                        className={`w-8 h-8 rounded-lg border-2 transition-all duration-300 ${
                          formData.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                        } ${getColorClasses(color.value).bg}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الصلاحيات</label>
                  <div className="space-y-4">
                    {['المحتوى', 'المستخدمين', 'النظام'].map((category) => (
                      <div key={category}>
                        <h4 className={`text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {availablePermissions.filter(p => p.category === category).map((permission) => (
                            <label key={permission.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{permission.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button 
                  onClick={showCreateModal ? handleCreateRole : handleEditRole}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2 font-medium transition-all duration-300"
                >
                  <Save className="w-5 h-5" />
                  {showCreateModal ? 'إنشاء الدور' : 'حفظ التغييرات'}
                </button>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className={`px-6 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
