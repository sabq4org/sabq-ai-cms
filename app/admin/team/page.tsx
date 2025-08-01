/**
 * صفحة إدارة أعضاء الفريق
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Eye,
  Ban,
  CheckCircle,
  Briefcase,
  Building,
  Award,
  Clock,
  Activity,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Upload,
  Star,
  Link,
  Twitter,
  Linkedin,
  Facebook,
  Instagram
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ImageUploadComponent as ImageUpload } from '@/components/ui/ImageUpload';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
  permissions_override?: string[];
}

interface TeamMemberForm {
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  bio: string;
  avatar: string;
  phone: string;
  social_links: {
    twitter: string;
    linkedin: string;
    facebook: string;
    instagram: string;
  };
  is_active: boolean;
}

export default function TeamManagementPage() {
  const { darkMode } = useDarkModeContext();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberForm>({
    name: '',
    email: '',
    role: '',
    department: '',
    position: '',
    bio: '',
    avatar: '',
    phone: '',
    social_links: {
      twitter: '',
      linkedin: '',
      facebook: '',
      instagram: ''
    },
    is_active: true
  });

  // جلب بيانات الفريق
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team-members');
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      
      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error('خطأ في جلب أعضاء الفريق:', error);
      toast.error('فشل في جلب بيانات الفريق');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // فلترة أعضاء الفريق
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.is_active) ||
                         (statusFilter === 'inactive' && !member.is_active);
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // حساب الإحصائيات
  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.is_active).length,
    editors: teamMembers.filter(m => m.role === 'editor').length,
    reporters: teamMembers.filter(m => m.role === 'reporter').length,
    admins: teamMembers.filter(m => m.role === 'chief_editor' || m.role === 'admin').length
  };

  // معالجات النموذج
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddMember = () => {
    setFormData({
      name: '',
      email: '',
      role: 'reporter', // قيمة افتراضية
      department: '',
      position: '',
      bio: '',
      avatar: '',
      phone: '',
      social_links: {
        twitter: '',
        linkedin: '',
        facebook: '',
        instagram: ''
      },
      is_active: true
    });
    setIsAddModalOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department || '',
      position: member.position || '',
      bio: member.bio || '',
      avatar: member.avatar || '',
      phone: member.phone || '',
      social_links: member.social_links || {
        twitter: '',
        linkedin: '',
        facebook: '',
        instagram: ''
      },
      is_active: member.is_active
    });
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async () => {
    try {
      // التحقق من البيانات المطلوبة مع تشخيص أفضل
      console.log('🔍 التحقق من البيانات:', formData);
      
      if (!formData.name || !formData.email || !formData.role) {
        const missingFields = [];
        if (!formData.name) missingFields.push('الاسم');
        if (!formData.email) missingFields.push('البريد الإلكتروني');
        if (!formData.role) missingFields.push('الدور');
        
        console.log('❌ حقول ناقصة:', missingFields);
        toast.error(`الرجاء ملء الحقول المطلوبة: ${missingFields.join(', ')}`);
        return;
      }
      
      const url = selectedMember 
        ? `/api/team-members/${selectedMember.id}`
        : '/api/team-members';
      
      const method = selectedMember ? 'PUT' : 'POST';
      
      console.log('📤 إرسال البيانات:', { 
        url, 
        method, 
        formDataSummary: { 
          name: formData.name?.length || 0, 
          email: formData.email?.length || 0, 
          role: formData.role?.length || 0 
        },
        fullFormData: formData,
        window_location: window.location.origin,
        full_url: window.location.origin + url
      });
      
      // التحقق من الاتصال أولاً
      console.log('🔗 اختبار الاتصال بالـ API...');
      try {
        const testResponse = await fetch('/api/team-members', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ اختبار الاتصال نجح:', testResponse.status);
      } catch (testError: any) {
        console.error('❌ فشل اختبار الاتصال:', testError);
        throw new Error(`فشل في الاتصال بالخادم: ${testError.message}`);
      }
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        // إضافة timeout أطول
        signal: AbortSignal.timeout(10000) // 10 ثوانٍ
      });
      
      console.log('📄 استجابة الخادم:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      let data;
      try {
        data = await response.json();
        console.log('📋 بيانات الاستجابة:', data);
      } catch (parseError) {
        console.error('❌ خطأ في تحليل الاستجابة:', parseError);
        const rawText = await response.text();
        console.log('📄 استجابة نصية خام:', rawText);
        throw new Error(`خطأ في تحليل الاستجابة: ${response.status}`);
      }
      
      if (!response.ok) {
        const errorMessage = data.error || data.message || `خطأ HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ خطأ من الخادم:', {
          status: response.status,
          error: data.error,
          details: data.details,
          debug: data.debug
        });
        throw new Error(errorMessage);
      }
      
      toast.success(selectedMember ? 'تم تحديث العضو بنجاح' : 'تم إضافة العضو بنجاح');
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedMember(null);
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        position: '',
        bio: '',
        avatar: '',
        phone: '',
        social_links: {
          twitter: '',
          linkedin: '',
          facebook: '',
          instagram: ''
        },
        is_active: true
      });
      fetchTeamMembers();
    } catch (error: any) {
      console.error('❌ خطأ في حفظ العضو:', error);
      console.error('📊 تفاصيل الخطأ:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        type: error.constructor.name
      });
      
      let errorMessage = 'فشل في حفظ البيانات';
      
      if (error.name === 'TypeError' && error.message.includes('Load failed')) {
        errorMessage = 'فشل في الاتصال بالخادم - تحقق من اتصال الشبكة';
      } else if (error.name === 'AbortError') {
        errorMessage = 'انتهت مهلة الاتصال - حاول مرة أخرى';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return;
    
    try {
      const response = await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('فشل في حذف العضو');
      
      toast.success('تم حذف العضو بنجاح');
      fetchTeamMembers();
    } catch (error) {
      toast.error('فشل في حذف العضو');
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    try {
      const response = await fetch(`/api/team-members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active })
      });
      
      if (!response.ok) throw new Error('فشل في تحديث الحالة');
      
      toast.success(member.is_active ? 'تم تعطيل العضو' : 'تم تفعيل العضو');
      fetchTeamMembers();
    } catch (error) {
      toast.error('فشل في تحديث الحالة');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeamMembers();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chief_editor':
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'editor':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'reporter':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'chief_editor':
        return 'رئيس التحرير';
      case 'admin':
        return 'مدير';
      case 'editor':
        return 'محرر';
      case 'reporter':
        return 'مراسل';
      default:
        return role;
    }
  };

  // قائمة الأدوار المتاحة
  const availableRoles = [
    { value: 'chief_editor', label: 'رئيس التحرير' },
    { value: 'editor', label: 'محرر' },
    { value: 'reporter', label: 'مراسل' },
    { value: 'admin', label: 'مدير' },
    { value: 'moderator', label: 'مشرف' },
    { value: 'writer', label: 'كاتب' }
  ];

  // قائمة الأقسام
  const departments = [...new Set(teamMembers.map(m => m.department).filter(Boolean))];

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="إدارة الفريق"
        pageDescription="إدارة أعضاء فريق التحرير والإدارة"
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="إدارة الفريق"
      pageDescription="إدارة أعضاء فريق التحرير والإدارة"
    >
      <div className="space-y-6">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي الفريق</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">نشطون</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">محررون</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.editors}</p>
                </div>
                <Edit className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">مراسلون</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.reporters}</p>
                </div>
                <Briefcase className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">إداريون</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط الأدوات */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* البحث */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="البحث بالاسم، البريد الإلكتروني، أو المنصب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 w-full"
                  />
                </div>
              </div>

              {/* الفلاتر */}
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    {availableRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {departments.length > 0 && (
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأقسام</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept || ''}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">معطل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* الأزرار */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={handleAddMember}>
                  <UserPlus className="h-4 w-4 ml-2" />
                  إضافة عضو
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة أعضاء الفريق */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <Badge className={getRoleColor(member.role)}>
                        {getRoleText(member.role)}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditMember(member)}>
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(member)}>
                        {member.is_active ? (
                          <>
                            <UserX className="h-4 w-4 ml-2" />
                            تعطيل
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 ml-2" />
                            تفعيل
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                  
                  {member.position && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4" />
                      <span>{member.position}</span>
                    </div>
                  )}
                  
                  {member.department && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Building className="h-4 w-4" />
                      <span>{member.department}</span>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                {member.bio && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {member.bio}
                  </p>
                )}

                {/* الروابط الاجتماعية */}
                {member.social_links && Object.values(member.social_links).some(link => link) && (
                  <div className="mt-3 flex gap-2">
                    {member.social_links.twitter && (
                      <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                      </a>
                    )}
                    {member.social_links.linkedin && (
                      <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                      </a>
                    )}
                    {member.social_links.facebook && (
                      <a href={member.social_links.facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4 text-gray-400 hover:text-blue-700" />
                      </a>
                    )}
                    {member.social_links.instagram && (
                      <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4 text-gray-400 hover:text-pink-600" />
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>انضم: {format(new Date(member.created_at), 'dd MMM yyyy', { locale: ar })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {member.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <UserX className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* نموذج إضافة/تعديل عضو */}
        <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedMember ? 'تعديل عضو الفريق' : 'إضافة عضو جديد'}
              </DialogTitle>
              <DialogDescription>
                {selectedMember ? 'قم بتحديث بيانات العضو' : 'أدخل بيانات العضو الجديد'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@sabq.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">الدور الوظيفي *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">المنصب</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="مثال: محرر أول"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">القسم</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="مثال: قسم الأخبار"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+966 5XXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">نبذة مختصرة</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="نبذة عن العضو..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>الصورة الشخصية</Label>
                <ImageUpload
                  currentImage={formData.avatar}
                  onImageUploaded={(url) => handleInputChange('avatar', url)}
                  type="avatar"
                  accept="image/*"
                  maxSize={5}
                  label="رفع صورة شخصية"
                />
              </div>

              <div className="space-y-4">
                <Label>الروابط الاجتماعية</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-sm">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.social_links.twitter}
                      onChange={(e) => handleInputChange('social_links.twitter', e.target.value)}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.social_links.linkedin}
                      onChange={(e) => handleInputChange('social_links.linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.social_links.facebook}
                      onChange={(e) => handleInputChange('social_links.facebook', e.target.value)}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.social_links.instagram}
                      onChange={(e) => handleInputChange('social_links.instagram', e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="text-sm">حالة العضو</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">معطل</span>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <span className="text-sm text-gray-500">نشط</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedMember(null);
              }}>
                إلغاء
              </Button>
              <Button onClick={handleSaveMember}>
                {selectedMember ? 'حفظ التغييرات' : 'إضافة العضو'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
