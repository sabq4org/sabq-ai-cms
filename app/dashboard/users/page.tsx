'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users,
  UserCheck,
  UserX,
  Ban,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  Flag,
  Shield,
  Star,
  TrendingUp,
  Activity,
  MessageSquare,
  Share2,
  BookmarkCheck
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unspecified';
  country?: string;
  city?: string;
  avatar?: string;
  isVerified?: boolean;
  status?: 'active' | 'pending' | 'banned';
  role?: 'regular' | 'vip' | 'media' | 'admin';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // استرجاع حالة الوضع الليلي
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // جلب المستخدمين من API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.users) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    banned: users.filter(u => u.status === 'banned').length,
    verified: users.filter(u => u.isVerified).length,
    todayJoined: users.filter(u => {
      const joinDate = new Date(u.created_at);
      const today = new Date();
      return joinDate.toDateString() === today.toDateString();
    }).length
  };

  // مكون بطاقة الإحصائية الدائرية
  const CircularStatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm mb-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{value.toLocaleString()}</span>
            <span className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // دالة تطبيق الفلاتر
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesCountry = selectedCountry === 'all' || user.country === selectedCountry;
      const matchesGender = selectedGender === 'all' || user.gender === selectedGender;
      
      return matchesSearch && matchesStatus && matchesRole && matchesCountry && matchesGender;
    });
  };

  // مكون صف المستخدم
  const UserRow = ({ user }: { user: User }) => {
    const getStatusBadge = (status?: string) => {
      const statusConfig = {
        active: { color: 'bg-green-100 text-green-700', text: 'نشط' },
        pending: { color: 'bg-yellow-100 text-yellow-700', text: 'في الانتظار' },
        banned: { color: 'bg-red-100 text-red-700', text: 'محظور' }
      };
      return statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-700', text: 'نشط' };
    };

    const getRoleBadge = (role?: string) => {
      const roleConfig = {
        admin: { color: 'bg-purple-100 text-purple-700', text: 'مسؤول' },
        media: { color: 'bg-blue-100 text-blue-700', text: 'إعلامي' },
        vip: { color: 'bg-orange-100 text-orange-700', text: 'VIP' },
        regular: { color: 'bg-gray-100 text-gray-700', text: 'عادي' }
      };
      return roleConfig[role as keyof typeof roleConfig] || { color: 'bg-gray-100 text-gray-700', text: 'عادي' };
    };

    const status = getStatusBadge(user.status || 'active');
    const role = getRoleBadge(user.role || 'regular');

    return (
      <tr className={`transition-colors duration-200 hover:bg-gray-50 border-b ${
        darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
      }`}>
        {/* المستخدم */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              user.avatar ? '' : 'bg-gray-200'
            }`}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <span className="text-gray-600 font-medium">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link 
                  href={`/dashboard/users/${user.id}`}
                  className={`font-medium transition-colors duration-300 hover:underline ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {user.name}
                </Link>
                {user.isVerified && (
                  <UserCheck className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>{user.email}</p>
            </div>
          </div>
        </td>

        {/* رقم الجوال */}
        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {user.phone || '-'}
        </td>

        {/* الجنس */}
        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {user.gender === 'male' ? 'ذكر' : user.gender === 'female' ? 'أنثى' : 'غير محدد'}
        </td>

        {/* الموقع */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {user.city || 'غير محدد'}, {user.country || 'غير محدد'}
            </span>
          </div>
        </td>

        {/* تاريخ التسجيل */}
        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {new Date(user.created_at).toLocaleDateString('ar-SA')}
        </td>

        {/* آخر دخول */}
        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {new Date(user.updated_at).toLocaleDateString('ar-SA')}
        </td>

        {/* الحالة */}
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            {status.text}
          </span>
        </td>

        {/* النوع */}
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
            {role.text}
          </span>
        </td>

        {/* الوسوم */}
        <td className="px-6 py-4">
          <div className="flex gap-1 flex-wrap">
            {user.tags && user.tags.length > 0 ? (
              <>
                {user.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
                {user.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{user.tags.length - 2}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </div>
        </td>

        {/* الإجراءات */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/users/${user.id}`}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                darkMode 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="عرض التفاصيل"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              className={`p-2 rounded-lg transition-colors duration-300 ${
                darkMode 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="المزيد"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
      {/* عنوان وتعريف الصفحة */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>إدارة المستخدمين</h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>إدارة شاملة للمستخدمين المسجلين في صحيفة سبق الإلكترونية</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300"
          >
            <Plus className="w-4 h-4" />
            إضافة مستخدم
          </button>
          <button className={`p-2 rounded-lg border transition-colors duration-300 ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>
            <Upload className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg border transition-colors duration-300 ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* إحصائيات المستخدمين */}
      <div className="grid grid-cols-6 gap-6 mb-8">
        <CircularStatsCard
          title="إجمالي المستخدمين"
          value={stats.total}
          subtitle="مستخدم"
          icon={Users}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <CircularStatsCard
          title="المستخدمون النشطون"
          value={stats.active}
          subtitle="نشط"
          icon={UserCheck}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <CircularStatsCard
          title="في الانتظار"
          value={stats.pending}
          subtitle="غير مفعل"
          icon={Clock}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <CircularStatsCard
          title="المحظورون"
          value={stats.banned}
          subtitle="محظور"
          icon={Ban}
          bgColor="bg-red-100"
          iconColor="text-red-600"
        />
        <CircularStatsCard
          title="الحسابات الموثقة"
          value={stats.verified}
          subtitle="موثق"
          icon={Shield}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <CircularStatsCard
          title="انضموا اليوم"
          value={stats.todayJoined}
          subtitle="جديد"
          icon={Star}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* جدول المستخدمين */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        {/* شريط البحث والفلاتر */}
        <div className={`px-6 py-4 border-b transition-colors duration-300 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96">
                <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 pr-10 text-sm rounded-lg border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="pending">في الانتظار</option>
                <option value="banned">محظور</option>
              </select>
              
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="all">جميع الأنواع</option>
                <option value="admin">مسؤول</option>
                <option value="media">إعلامي</option>
                <option value="vip">VIP</option>
                <option value="regular">عادي</option>
              </select>

              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="all">جميع الدول</option>
                <option value="السعودية">السعودية</option>
                <option value="الإمارات">الإمارات</option>
                <option value="الكويت">الكويت</option>
                <option value="قطر">قطر</option>
              </select>

              <select 
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="all">جميع الأجناس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
                <option value="unspecified">غير محدد</option>
              </select>
            </div>
          </div>
        </div>

        {/* الجدول */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`transition-colors duration-300 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>المستخدم</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>رقم الجوال</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>الجنس</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>الموقع</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>تاريخ التسجيل</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>آخر تحديث</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>الحالة</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>النوع</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>الوسوم</th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              darkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <UserRow key={user.id} user={user} />
                ))
              ) : (
                <tr>
                  <td colSpan={10} className={`px-6 py-8 text-center transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {users.length === 0 ? 'لا يوجد مستخدمون مسجلون حتى الآن' : 'لا توجد نتائج مطابقة للبحث'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 