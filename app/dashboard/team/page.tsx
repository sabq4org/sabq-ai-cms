'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Download, Bell, Shield, Mail, Phone, Calendar, Clock, CheckCircle, AlertCircle, UserPlus, Edit3, Trash2, Filter, X } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  permissions: string[];
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: string;
}

export default function TeamPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      name: 'أحمد محمد السالم',
      email: 'ahmed.salem@sabq.org',
      phone: '+966501234567',
      role: 'رئيس التحرير',
      department: 'إدارة المحتوى',
      joinDate: '2023-01-15',
      lastActive: 'منذ ساعة',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      permissions: ['create_articles', 'edit_articles', 'delete_articles', 'publish_articles', 'manage_users']
    },
    {
      id: 2,
      name: 'فاطمة عبدالله النور',
      email: 'fatima.noor@sabq.org',
      phone: '+966507654321',
      role: 'محرر أول',
      department: 'إدارة المحتوى',
      joinDate: '2023-03-22',
      lastActive: 'منذ 30 دقيقة',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      permissions: ['create_articles', 'edit_articles', 'publish_articles']
    },
    {
      id: 3,
      name: 'خالد عبدالعزيز الشمري',
      email: 'khalid.shamri@sabq.org',
      phone: '+966503456789',
      role: 'محرر',
      department: 'إدارة المحتوى',
      joinDate: '2023-06-10',
      lastActive: 'منذ يوم',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      permissions: ['create_articles', 'edit_articles']
    },
    {
      id: 4,
      name: 'مريم سعد العتيبي',
      email: 'mariam.otaibi@sabq.org',
      phone: '+966509876543',
      role: 'مدقق لغوي',
      department: 'إدارة المحتوى',
      joinDate: '2023-08-05',
      lastActive: 'منذ 3 ساعات',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      permissions: ['edit_articles', 'review_articles']
    },
    {
      id: 5,
      name: 'عبدالرحمن أحمد القحطاني',
      email: 'abdul.qahtani@sabq.org',
      phone: '+966502345678',
      role: 'مطور',
      department: 'التقنية',
      joinDate: '2023-04-12',
      lastActive: 'منذ 2 ساعة',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      permissions: ['system_settings', 'manage_users', 'backup_system']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    permissions: [] as string[]
  });

  const availableRoles = ['رئيس التحرير', 'محرر أول', 'محرر', 'مدقق لغوي', 'مطور', 'مسوق المحتوى', 'محلل البيانات'];
  const availableDepartments = ['إدارة المحتوى', 'التقنية', 'التسويق', 'إدارة التفاعل', 'تحليل البيانات'];
  const availablePermissions = [
    { id: 'create_articles', name: 'إنشاء المقالات' },
    { id: 'edit_articles', name: 'تعديل المقالات' },
    { id: 'delete_articles', name: 'حذف المقالات' },
    { id: 'publish_articles', name: 'نشر المقالات' },
    { id: 'manage_users', name: 'إدارة المستخدمين' },
    { id: 'system_settings', name: 'إعدادات النظام' },
    { id: 'backup_system', name: 'النسخ الاحتياطي' },
    { id: 'review_articles', name: 'مراجعة المقالات' }
  ];

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

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

  const handleAddMember = () => {
    if (formData.name && formData.email && formData.role && formData.department) {
      const newMember: TeamMember = {
        id: Math.max(...teamMembers.map(m => m.id), 0) + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: 'الآن',
        status: 'active',
        avatar: '/api/placeholder/40/40',
        permissions: formData.permissions
      };
      
      setTeamMembers([...teamMembers, newMember]);
      setFormData({ name: '', email: '', phone: '', role: '', department: '', permissions: [] });
      setShowAddModal(false);
      addNotification(`تم إضافة ${formData.name} إلى الفريق بنجاح`, 'success');
    }
  };

  const handleEditMember = () => {
    if (selectedMember && formData.name && formData.email && formData.role && formData.department) {
      setTeamMembers(teamMembers.map(member => 
        member.id === selectedMember.id 
          ? { ...member, name: formData.name, email: formData.email, phone: formData.phone, role: formData.role, department: formData.department, permissions: formData.permissions }
          : member
      ));
      setShowEditModal(false);
      setSelectedMember(null);
      addNotification(`تم تحديث بيانات ${formData.name} بنجاح`, 'success');
    }
  };

  const handleDeleteMember = (memberId: number) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member && confirm(`هل أنت متأكد من حذف ${member.name} من الفريق؟`)) {
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      addNotification(`تم حذف ${member.name} من الفريق`, 'warning');
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

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      permissions: [...member.permissions]
    });
    setShowEditModal(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الدور', 'القسم', 'تاريخ الانضمام', 'آخر نشاط', 'الحالة'],
      ...filteredMembers.map(member => [
        member.name,
        member.email,
        member.phone,
        member.role,
        member.department,
        member.joinDate,
        member.lastActive,
        member.status === 'active' ? 'نشط' : member.status === 'inactive' ? 'غير نشط' : 'في الانتظار'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `team_members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addNotification('تم تصدير قائمة الفريق بنجاح', 'success');
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || member.department === filterDepartment;
    const matchesStatus = !filterStatus || member.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'pending': return 'في الانتظار';
      default: return 'غير محدد';
    }
  };

  return (
    <div className={`p-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : ''}`}>
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
                  {teamMembers.filter(m => m.status === 'active').length}
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
                  {new Set(teamMembers.map(m => m.role)).size}
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
              <option value="pending">في الانتظار</option>
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
                setFormData({ name: '', email: '', phone: '', role: '', department: '', permissions: [] });
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
                <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>آخر نشاط</th>
                <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
              {filteredMembers.map((member) => (
                <tr key={member.id} className={`transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</p>
                        <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {member.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {getStatusText(member.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {member.lastActive}
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
                  }}
                  className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الاسم الكامل</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="example@sabq.org"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>رقم الهاتف</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                      placeholder="+966501234567"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الدور</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">اختر الدور</option>
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
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

                <div>
                  <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الصلاحيات</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
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