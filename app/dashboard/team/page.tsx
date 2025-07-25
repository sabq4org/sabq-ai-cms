'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Download, Bell, Shield, CheckCircle, AlertCircle, UserPlus, Edit3, Trash2, X, Camera, Eye, EyeOff, Upload } from 'lucide-react';
import { Role } from '@/types/roles';
import { TeamMember } from '@/types/team';
interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: string;
}
export default function TeamPage() {
  // إضافة رسالة تشخيص
  console.log('TeamPage component loaded');
  const [darkMode, setDarkMode] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  // بيانات إضافة عضو جديد
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: '',
    roleId: '',
    department: '',
    phone: '',
    bio: '',
    isActive: true,
    isVerified: false
  });
  const availableDepartments = ['التحرير', 'المراسلين', 'التقنية', 'التسويق', 'المراجعة والتدقيق', 'الإدارة'];
  useEffect(() => {
    console.log('🚀 تحميل صفحة إدارة الفريق...');
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    // جلب البيانات
    console.log('📥 بدء جلب البيانات...');
    fetchTeamMembers();
    fetchRoles();
    
    // للتأكد من تحميل الأدوار، إعادة المحاولة بعد ثانيتين
    setTimeout(() => {
      if (roles.length === 0) {
        console.log('⚠️ لم يتم تحميل الأدوار، إعادة المحاولة...');
        fetchRoles();
      }
    }, 2000);
  }, []);

  // useEffect منفصل لمراقبة تحميل الأدوار
  useEffect(() => {
    console.log('🔄 تغيير في حالة الأدوار:', roles.length, 'أدوار محملة');
    if (roles.length > 0) {
      console.log('✅ الأدوار متاحة:', roles.map((r: any) => r.display_name || r.name));
    }
  }, [roles]);
  // جلب أعضاء الفريق
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team-members');
      const data = await response.json();
      if (data.success && data.data) {
        setTeamMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      addNotification('فشل تحميل أعضاء الفريق', 'warning');
    } finally {
      setLoading(false);
    }
  };
  // دالة تشخيص النظام
  const diagnoseSystem = async () => {
    console.log('🔍 بدء تشخيص شامل للنظام...');
    
    try {
      // اختبار الاتصال بقاعدة البيانات
      console.log('1️⃣ اختبار API التشخيص...');
      const debugResponse = await fetch('/api/debug/roles');
      const debugData = await debugResponse.json();
      console.log('� نتائج التشخيص:', debugData);
      
      // اختبار API الأدوار مباشرة
      console.log('2️⃣ اختبار API الأدوار...');
      const rolesResponse = await fetch('/api/roles');
      console.log('📡 رد API الأدوار:', {
        status: rolesResponse.status,
        statusText: rolesResponse.statusText,
        headers: Object.fromEntries(rolesResponse.headers.entries())
      });
      
      const rolesText = await rolesResponse.text();
      console.log('📄 نص الاستجابة الخام:', rolesText.substring(0, 500) + (rolesText.length > 500 ? '...' : ''));
      
      try {
        const rolesData = JSON.parse(rolesText);
        console.log('📦 البيانات المحللة:', rolesData);
        
        // تحليل مفصل للبيانات
        if (rolesData.success && rolesData.data) {
          console.log('✅ البيانات صحيحة - عدد الأدوار:', rolesData.data.length);
          rolesData.data.forEach((role: any, index: number) => {
            console.log(`📋 الدور ${index + 1}:`, {
              id: role.id,
              name: role.name,
              display_name: role.display_name,
              hasPermissions: !!role.permissions
            });
          });
        } else {
          console.error('❌ البيانات غير صحيحة:', rolesData);
        }
        
      } catch (parseError) {
        console.error('❌ خطأ في تحليل JSON:', parseError);
        console.log('📄 محتوى الاستجابة:', rolesText);
      }
      
      // معلومات المتصفح والبيئة
      console.log('3️⃣ معلومات البيئة:', {
        userAgent: navigator.userAgent,
        currentURL: window.location.href,
        timestamp: new Date().toISOString(),
        rolesState: {
          currentRolesCount: roles.length,
          rolesList: roles.map(r => ({ id: r.id, name: r.name, display_name: r.display_name }))
        }
      });
      
      addNotification('تم إجراء التشخيص الشامل - تحقق من Console للتفاصيل', 'info');
      
    } catch (error) {
      console.error('❌ خطأ في التشخيص:', error);
      addNotification('فشل في التشخيص', 'warning');
    }
  };

  // جلب الأدوار
  const fetchRoles = async () => {
    try {
      console.log('🔄 بدء جلب الأدوار...');
      const response = await fetch('/api/roles');
      console.log('📡 استجابة الخادم:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 بيانات الأدوار المستلمة:', data);
      
      if (data.success) {
        if (data.data && Array.isArray(data.data)) {
          setRoles(data.data);
          console.log('✅ تم تحميل الأدوار بنجاح:', data.data.length, 'أدوار');
          console.log('📋 قائمة الأدوار:', data.data.map((r: any) => `${r.name} (${r.display_name || r.name})`));
          
          if (data.data.length === 0) {
            addNotification('لا توجد أدوار مُعرَّفة في النظام', 'info');
          }
          
          // إشعار إذا كانت أدوار احتياطية
          if (data.fallback) {
            addNotification('تم تحميل أدوار افتراضية - يرجى إعداد قاعدة البيانات', 'warning');
          }
        } else {
          console.error('❌ البيانات المستلمة ليست مصفوفة:', data.data);
          addNotification('تنسيق البيانات غير صحيح', 'warning');
        }
      } else {
        console.error('❌ فشل في جلب الأدوار من الخادم:', data);
        
        // محاولة استخدام API الاحتياطي
        console.log('🔄 محاولة استخدام API الاحتياطي...');
        await tryFallbackRoles();
      }
    } catch (error) {
      console.error('❌ خطأ شبكة في جلب الأدوار:', error);
      
      // محاولة استخدام API الاحتياطي
      console.log('🔄 محاولة استخدام API الاحتياطي بعد خطأ الشبكة...');
      await tryFallbackRoles();
    }
  };

  // محاولة جلب الأدوار من API الاحتياطي
  const tryFallbackRoles = async () => {
    try {
      console.log('🔄 استخدام API الاحتياطي...');
      const fallbackResponse = await fetch('/api/roles-fallback');
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('� بيانات الأدوار الاحتياطية:', fallbackData);
        
        if (fallbackData.success && fallbackData.data && Array.isArray(fallbackData.data)) {
          setRoles(fallbackData.data);
          console.log('✅ تم تحميل الأدوار الاحتياطية بنجاح');
          addNotification('تم تحميل أدوار افتراضية - يرجى إعداد قاعدة البيانات', 'warning');
          return;
        }
      }
      
      // إذا فشل كل شيء
      console.error('❌ فشل في جميع محاولات جلب الأدوار');
      addNotification('فشل في تحميل الأدوار - يرجى إعادة تحميل الصفحة', 'warning');
      
    } catch (fallbackError) {
      console.error('❌ فشل API الاحتياطي:', fallbackError);
      addNotification('خطأ في الاتصال بالخادم لجلب الأدوار', 'warning');
      
      // محاولة التشخيص أكثر
      if (fallbackError instanceof Error) {
        console.error('🔍 رسالة الخطأ:', fallbackError.message);
      }
    }
  };
      addNotification('خطأ في الاتصال بالخادم لجلب الأدوار', 'warning');
      
      // محاولة التشخيص أكثر
      if (fallbackError instanceof Error) {
        console.error('🔍 رسالة الخطأ:', fallbackError.message);
      }
    }
  };

  const addNotification = (message: string, type: 'success' | 'info' | 'warning') => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleString('ar-SA')
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };
  const handleAddMember = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.roleId) {
      addNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
      return;
    }
    try {
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar || undefined,
          roleId: formData.roleId,
          isActive: formData.isActive,
          isVerified: formData.isVerified
        })
      });
      const data = await response.json();
      if (data.success) {
        addNotification('تمت إضافة العضو بنجاح', 'success');
        fetchTeamMembers();
        setShowAddModal(false);
        resetForm();
      } else {
        addNotification(data.error || 'حدث خطأ في إضافة العضو', 'warning');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      addNotification('حدث خطأ في إضافة العضو', 'warning');
    }
  };
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      avatar: '',
      roleId: '',
      department: '',
      phone: '',
      bio: '',
      isActive: true,
      isVerified: false
    });
    setAvatarPreview('');
    setShowPassword(false);
  };
  const handleEditMember = async () => {
    if (!selectedMember) return;
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        roleId: formData.roleId,
        department: formData.department,
        phone: formData.phone,
        bio: formData.bio,
        isActive: formData.isActive,
        isVerified: formData.isVerified
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      if (formData.avatar !== selectedMember.avatar) {
        updateData.avatar = formData.avatar;
      }
      const response = await fetch(`/api/team-members/${selectedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      if (data.success) {
        addNotification('تم تحديث بيانات العضو', 'success');
        fetchTeamMembers();
        setShowEditModal(false);
      } else {
        addNotification(data.error || 'حدث خطأ في التحديث', 'warning');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      addNotification('حدث خطأ في التحديث', 'warning');
    }
  };
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return;
    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        addNotification('تم حذف العضو بنجاح', 'success');
        fetchTeamMembers();
      } else {
        addNotification(data.error || 'حدث خطأ في حذف العضو', 'warning');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      addNotification('حدث خطأ في حذف العضو', 'warning');
    }
  };
  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: '',
      avatar: member.avatar || '',
      roleId: member.roleId,
      department: member.department || '',
      phone: member.phone || '',
      bio: member.bio || '',
      isActive: member.isActive,
      isVerified: member.isVerified
    });
    setAvatarPreview(member.avatar || '');
    setShowEditModal(true);
  };
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('بدء رفع الملف:', file.name, file.size, file.type);
    try {
      // عرض رسالة تحميل
      setUploadingAvatar(true);
      addNotification('جاري رفع الصورة...', 'info');
      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', file);
      console.log('إرسال الطلب إلى /api/upload');
      // رفع الصورة إلى الخادم
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      console.log('نتيجة الرفع:', result);
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل رفع الصورة');
      }
      // تحديث معاينة الصورة ورابط الصورة
      // معالجة structure مختلفة للـ response
      const imageUrl = result.data?.url || result.url;
      console.log('تحديث معاينة الصورة:', imageUrl);
      
      if (!imageUrl) {
        throw new Error('لم يتم الحصول على رابط الصورة من الخادم');
      }
      
      setAvatarPreview(imageUrl);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
      addNotification('تم رفع الصورة بنجاح', 'success');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addNotification(
        error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة',
        'warning'
      );
    } finally {
      setUploadingAvatar(false);
      // إعادة تعيين قيمة input لتمكين رفع نفس الملف مرة أخرى
      e.target.value = '';
    }
  };
  const exportToCSV = () => {
    const csvContent = [
      ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الدور', 'القسم', 'تاريخ الانضمام', 'الحالة', 'التوثيق'],
      ...filteredMembers.map(member => {
        const role = roles.find(r => r.id === member.roleId);
        return [
          member.name,
          member.email,
          member.phone || '',
          role?.name || '',
          member.department || '',
          new Date(member.createdAt).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            calendar: 'gregory',
            numberingSystem: 'latn'
          }),
          member.isActive ? 'نشط' : 'غير نشط',
          member.isVerified ? 'موثق' : 'غير موثق'
        ];
      })
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `team_members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addNotification('تم تصدير قائمة الفريق بنجاح', 'success');
  };
  const filteredMembers = teamMembers.filter(member => {
    const role = roles.find(r => r.id === member.roleId);
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (role?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || member.department === filterDepartment;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && member.isActive) ||
                         (filterStatus === 'inactive' && !member.isActive) ||
                         (filterStatus === 'verified' && member.isVerified) ||
                         (filterStatus === 'unverified' && !member.isVerified);
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  if (loading) {
    return (
  <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
  <div className={`p-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : ''}`} dir="rtl">
      {/* الإشعارات */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl shadow-xl flex items-center gap-2 animate-slide-in ${
                notification.type === 'success' ? 'bg-green-500 text-white' :
                notification.type === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
              }`}
            >
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
              {notification.type === 'info' && <Bell className="w-5 h-5" />}
              <span>{notification.message}</span>
            </div>
          ))}
        </div>
      )}
      {/* العنوان والوصف */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>إدارة الفريق</h1>
        <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>إدارة أعضاء الفريق وصلاحياتهم في النظام</p>
      </div>
      {/* الإحصائيات */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className={`text-sm mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>إجمالي الأعضاء</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{teamMembers.length}</span>
                <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>عضو</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className={`text-sm mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>النشطون</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {teamMembers.filter(m => m.isActive).length}
                </span>
                <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>عضو</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className={`text-sm mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>الأدوار</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {roles.length}
                </span>
                <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>دور</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className={`text-sm mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>الأقسام</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {new Set(teamMembers.map(m => m.department)).size}
                </span>
                <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>قسم</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* شريط البحث والتصفية */}
      <div className={`rounded-2xl p-6 shadow-sm border mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الأعضاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-4 pr-10 py-3 rounded-xl border transition-all duration-300 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 w-80`}
              />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className={`px-4 py-3 rounded-xl border transition-all duration-300 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">جميع الأقسام</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 rounded-xl border transition-all duration-300 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="verified">موثق</option>
              <option value="unverified">غير موثق</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              تصدير CSV
            </button>
            <button 
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  avatar: '',
                  roleId: '',
                  department: '',
                  phone: '',
                  bio: '',
                  isActive: true,
                  isVerified: false
                });
                setAvatarPreview('');
                setShowAddModal(true);
              }}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              إضافة عضو
            </button>
          </div>
        </div>
      </div>
      {/* جدول الأعضاء */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>العضو</th>
                <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>الدور</th>
                <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>القسم</th>
                <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>الحالة</th>
                <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
              {filteredMembers.map((member) => (
                <tr key={member.id} className={`transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Image src="/placeholder.jpg" alt="" width={100} height={100} />
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</p>
                        <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</p>
                        {member.isVerified && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                            <CheckCircle className="w-3 h-3" />
                            موثق
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {roles.find(r => r.id === member.roleId)?.display_name || roles.find(r => r.id === member.roleId)?.name || member.roleId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {member.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {member.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(member)}
                        className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-gray-600 text-gray-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-600'}`}
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'}`}
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
      {/* نوافذ منبثقة للإضافة والتعديل */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {showAddModal ? 'إضافة عضو جديد' : `تعديل: ${selectedMember?.name}`}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الاسم</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      كلمة المرور {showEditModal && <span className="text-xs text-gray-500">(اتركها فارغة إذا لم ترد تغييرها)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                        placeholder={showEditModal ? "••••••••" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الهاتف</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      الدور *
                    </label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => {
                        console.log('🔄 تم اختيار دور:', e.target.value);
                        setFormData({...formData, roleId: e.target.value});
                      }}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">اختر الدور</option>
                      {roles.length === 0 ? (
                        <option disabled>جاري تحميل الأدوار...</option>
                      ) : (
                        roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.display_name || role.name}
                          </option>
                        ))
                      )}
                    </select>
                    {roles.length === 0 && (
                      <div className={`text-xs mt-1 space-y-2`}>
                        <p className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          ⚠️ لا توجد أدوار متاحة. يرجى إنشاء الأدوار أولاً.
                        </p>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          📊 عدد الأدوار المحملة: {roles.length}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => {
                              console.log('🔄 إعادة تحميل الأدوار...');
                              fetchRoles();
                            }}
                            className={`text-blue-500 hover:text-blue-600 underline text-xs`}
                          >
                            🔄 إعادة تحميل الأدوار
                          </button>
                          <button 
                            onClick={diagnoseSystem}
                            className={`text-purple-500 hover:text-purple-600 underline text-xs`}
                          >
                            🔍 تشخيص النظام
                          </button>
                        </div>
                      </div>
                    )}
                    {formData.roleId && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ✅ تم اختيار الدور: {roles.find(r => r.id === formData.roleId)?.display_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>القسم</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">اختر القسم</option>
                      {availableDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الحالة</label>
                    <select
                      value={formData.isActive ? "active" : "inactive"}
                      onChange={(e) => setFormData({...formData, isActive: e.target.value === "active"})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>التوثيق</label>
                    <select
                      value={formData.isVerified ? "verified" : "unverified"}
                      onChange={(e) => setFormData({...formData, isVerified: e.target.value === "verified"})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="verified">موثق</option>
                      <option value="unverified">غير موثق</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الصورة الشخصية</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          id="avatar-upload"
                          className="sr-only"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className={`flex items-center justify-center w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                            uploadingAvatar
                              ? 'opacity-50 cursor-not-allowed'
                              : darkMode 
                                ? 'border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600' 
                                : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {uploadingAvatar ? (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Upload className="w-5 h-5 animate-bounce" />
                              <span className="text-sm">جاري الرفع...</span>
                            </div>
                          ) : avatarPreview ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm">تم رفع الصورة بنجاح</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Camera className="w-5 h-5" />
                              <span className="text-sm">اضغط لاختيار صورة</span>
                            </div>
                          )}
                        </label>
                      </div>
                      {avatarPreview && !uploadingAvatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarPreview('');
                            setFormData(prev => ({ ...prev, avatar: '' }));
                          }}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          حذف الصورة
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={avatarPreview ? 'block' : 'hidden'}>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>معاينة الصورة</label>
                    <div className="relative inline-block">
                      <Image src="/placeholder.jpg" alt="Avatar Preview" width={100} height={100} />
                      {avatarPreview && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>نبذة شخصية</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    placeholder="نبذة مختصرة عن العضو..."
                  />
                </div>
                {/* عرض معلومات الدور المختار */}
                {formData.roleId && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      معلومات الدور
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {roles.find(r => r.id === formData.roleId)?.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {roles.find(r => r.id === formData.roleId)?.permissions.length || 0} صلاحية
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button 
                  onClick={showAddModal ? handleAddMember : handleEditMember}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2 font-medium transition-all duration-300"
                >
                  <UserPlus className="w-5 h-5" />
                  {showAddModal ? 'إضافة العضو' : 'حفظ التغييرات'}
                </button>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
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