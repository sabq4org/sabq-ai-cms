/**
 * صفحة إدارة أعضاء الفريق
 */

"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Edit,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Twitter,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  ArrowUpRight,
  Upload,
  X,
  Camera
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ImageUploadComponent as ImageUpload } from "@/components/ui/ImageUpload";

// مكون بطاقة إحصائية
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; label: string };
}) => {
  return (
    <div className="card" style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'hsl(var(--accent) / 0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--accent))'
        }}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
          <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
            {value}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight style={{ 
                width: '14px', 
                height: '14px',
                color: '#10b981'
              }} />
              <span className="text-xs" style={{ color: '#10b981' }}>
                {trend.value}%
              </span>
              <span className="text-xs text-muted">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
}

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamMemberForm>({
    name: "",
    email: "",
    role: "",
    department: "",
    position: "",
    bio: "",
    avatar: "",
    phone: "",
    social_links: {
      twitter: "",
      linkedin: "",
      facebook: "",
      instagram: "",
    },
    is_active: true,
  });

  // جلب الأدوار من قاعدة البيانات
  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await fetch("/api/admin/roles", {
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const rolesData = data.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          display_name: role.display_name || role.name,
          description: role.description,
        }));
        setRoles(rolesData);
      } else {
        // استخدام الأدوار الافتراضية كـ fallback
        setRoles([
          { id: "1", name: "admin", display_name: "مدير" },
          { id: "2", name: "editor", display_name: "محرر" },
          { id: "3", name: "reporter", display_name: "مراسل" },
          { id: "4", name: "writer", display_name: "كاتب" },
        ]);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب الأدوار:", error);
      toast.error("فشل في جلب الأدوار، سيتم استخدام القائمة الافتراضية");

      // استخدام الأدوار الافتراضية عند الفشل
      setRoles([
        { id: "1", name: "admin", display_name: "مدير" },
        { id: "2", name: "editor", display_name: "محرر" },
        { id: "3", name: "reporter", display_name: "مراسل" },
        { id: "4", name: "writer", display_name: "كاتب" },
        { id: "5", name: "chief_editor", display_name: "رئيس التحرير" },
        { id: "6", name: "moderator", display_name: "مشرف" },
      ]);
    } finally {
      setRolesLoading(false);
    }
  };

  // جلب بيانات الفريق
  const fetchTeamMembers = async (forceRefresh = false) => {
    try {
      const cacheBuster = forceRefresh ? `?t=${Date.now()}` : "";
      const response = await fetch(`/api/team-members${cacheBuster}`, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        credentials: 'include'
      });
      if (!response.ok) throw new Error("فشل في جلب البيانات");

      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error("خطأ في جلب أعضاء الفريق:", error);
      toast.error("فشل في جلب بيانات الفريق");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // جلب البيانات بشكل متوازي
    Promise.all([fetchTeamMembers(), fetchRoles()]);
  }, []);

  // فلترة أعضاء الفريق
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.position &&
        member.position.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && member.is_active) ||
      (statusFilter === "inactive" && !member.is_active);

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // حساب الإحصائيات
  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter((m) => m.is_active).length,
    editors: teamMembers.filter((m) => m.role === "editor").length,
    reporters: teamMembers.filter((m) => m.role === "reporter").length,
    admins: teamMembers.filter(
      (m) => m.role === "chief_editor" || m.role === "admin"
    ).length,
  };

  // معالجات النموذج
  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddMember = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      position: "",
      bio: "",
      avatar: "",
      phone: "",
      social_links: {
        twitter: "",
        linkedin: "",
        facebook: "",
        instagram: "",
      },
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department || "",
      position: member.position || "",
      bio: member.bio || "",
      avatar: member.avatar || "",
      phone: member.phone || "",
      social_links: member.social_links || {
        twitter: "",
        linkedin: "",
        facebook: "",
        instagram: "",
      },
      is_active: member.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async () => {
    try {
      if (!formData.name || !formData.email || !formData.role) {
        const missingFields = [];
        if (!formData.name) missingFields.push("الاسم");
        if (!formData.email) missingFields.push("البريد الإلكتروني");
        if (!formData.role) missingFields.push("الدور");

        toast.error(`الرجاء ملء الحقول المطلوبة: ${missingFields.join(", ")}`);
        return;
      }

      const url = selectedMember
        ? `/api/team-members/${selectedMember.id}`
        : "/api/team-members";

      const method = selectedMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("❌ خطأ في تحليل الاستجابة:", parseError);
        throw new Error(`خطأ في تحليل الاستجابة: ${response.status}`);
      }

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.message ||
          `خطأ HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      toast.success(
        selectedMember ? "تم تحديث العضو بنجاح" : "تم إضافة العضو بنجاح"
      );

      // إعادة جلب البيانات على الفور مع force refresh
      await fetchTeamMembers(true);

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedMember(null);
      // إعادة تعيين النموذج
      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
        position: "",
        bio: "",
        avatar: "",
        phone: "",
        social_links: {
          twitter: "",
          linkedin: "",
          facebook: "",
          instagram: "",
        },
        is_active: true,
      });

      // تأكيد إضافي بعد ثانية واحدة
      setTimeout(() => {
        fetchTeamMembers(true);
      }, 1000);
    } catch (error: any) {
      console.error("❌ خطأ في حفظ العضو:", error);
      
      let errorMessage = "فشل في حفظ البيانات";

      if (error.name === "TypeError" && error.message.includes("Load failed")) {
        errorMessage = "فشل في الاتصال بالخادم - تحقق من اتصال الشبكة";
      } else if (error.name === "AbortError") {
        errorMessage = "انتهت مهلة الاتصال - حاول مرة أخرى";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العضو؟")) return;

    try {
      const response = await fetch(`/api/team-members/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      if (!response.ok) throw new Error("فشل في حذف العضو");

      toast.success("تم حذف العضو بنجاح");
      fetchTeamMembers();
    } catch (error) {
      toast.error("فشل في حذف العضو");
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    try {
      const response = await fetch(`/api/team-members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !member.is_active }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error("فشل في تحديث الحالة");

      toast.success(member.is_active ? "تم تعطيل العضو" : "تم تفعيل العضو");
      fetchTeamMembers();
    } catch (error) {
      toast.error("فشل في تحديث الحالة");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeamMembers(true);
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      chief_editor: 'chip-danger',
      admin: 'chip-danger',
      editor: 'chip-info',
      reporter: 'chip-success',
      writer: 'chip-warning',
      moderator: 'chip-outline'
    };

    const labels = {
      system_admin: "مدير النظام",
      chief_editor: "رئيس التحرير",
      admin: "مدير",
      editor: "محرر",
      reporter: "مراسل",
      moderator: "مشرف",
      writer: "كاتب"
    };

    return (
      <span className={`chip chip-sm ${badges[role as keyof typeof badges] || 'chip-outline'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  // تحويل الأدوار المجلبة من قاعدة البيانات للتنسيق المطلوب
  const availableRoles = roles.map((role) => ({
    value: role.name,
    label: role.display_name,
  }));

  // قائمة الأقسام
  const departments = [
    ...new Set(teamMembers.map((m) => m.department).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid hsl(var(--line))',
            borderTopColor: 'hsl(var(--accent))',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p className="text-muted">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg))', padding: '40px 20px' }} dir="rtl">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                  إدارة أعضاء الفريق
                </h1>
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  إدارة فريق العمل والمحررين في صحيفة سبق
                </p>
              </div>
            </div>
            <button
              onClick={handleAddMember}
              className="btn"
              style={{ background: 'hsl(var(--accent))', color: 'white' }}
            >
              <UserPlus style={{ width: '16px', height: '16px' }} />
              إضافة عضو
            </button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="إجمالي الفريق"
            value={stats.total}
            icon={Users}
            trend={{ value: 8, label: "هذا الشهر" }}
          />
          <StatCard
            title="نشطون"
            value={stats.active}
            icon={UserCheck}
          />
          <StatCard
            title="محررون"
            value={stats.editors}
            icon={Edit}
          />
          <StatCard
            title="مراسلون"
            value={stats.reporters}
            icon={Briefcase}
          />
          <StatCard
            title="إداريون"
            value={stats.admins}
            icon={Shield}
          />
        </div>

        {/* شريط الأدوات */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              {/* البحث */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'hsl(var(--muted))',
                    width: '20px',
                    height: '20px'
                  }} />
                  <input
                    type="text"
                    placeholder="البحث بالاسم، البريد الإلكتروني، أو المنصب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                </div>
              </div>

              {/* الفلاتر */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input"
                  style={{ width: '140px' }}
                >
                  <option value="all">جميع الأدوار</option>
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                {departments.length > 0 && (
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="input"
                    style={{ width: '140px' }}
                  >
                    <option value="all">جميع الأقسام</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept || ""}>
                        {dept}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                  style={{ width: '140px' }}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">معطل</option>
                </select>
              </div>

              {/* الأزرار */}
              <button
                className="btn btn-ghost"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ padding: '8px' }}
              >
                <RefreshCw
                  style={{ width: '16px', height: '16px' }}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* قائمة أعضاء الفريق */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredMembers.map((member) => (
            <div key={member.id} className="card" style={{ transition: 'box-shadow 0.2s ease' }}>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: member.avatar ? 'transparent' : 'hsl(var(--accent) / 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'hsl(var(--accent))', fontWeight: '600' }}>
                          {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="heading-3" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {member.name}
                        {member.is_active ? (
                          <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                        ) : (
                          <UserX style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                        )}
                      </h3>
                      {getRoleBadge(member.role)}
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setShowActionMenu(showActionMenu === member.id ? null : member.id)}
                    >
                      <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                    </button>
                    
                    {showActionMenu === member.id && (
                      <div className="card" style={{
                        position: 'absolute',
                        left: '0',
                        top: '100%',
                        marginTop: '4px',
                        minWidth: '180px',
                        zIndex: '1000',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ padding: '8px' }}>
                          <button
                            onClick={() => {
                              handleEditMember(member);
                              setShowActionMenu(null);
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '4px' }}
                          >
                            <Edit style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                            تعديل
                          </button>
                          <button
                            onClick={() => {
                              handleToggleStatus(member);
                              setShowActionMenu(null);
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '4px' }}
                          >
                            {member.is_active ? (
                              <>
                                <UserX style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                                تعطيل
                              </>
                            ) : (
                              <>
                                <UserCheck style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                                تفعيل
                              </>
                            )}
                          </button>
                          <div style={{ height: '1px', background: 'hsl(var(--line))', margin: '8px 0' }}></div>
                          <button
                            onClick={() => {
                              handleDeleteMember(member.id);
                              setShowActionMenu(null);
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ width: '100%', justifyContent: 'flex-start', color: 'hsl(var(--danger))' }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                            حذف
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail style={{ width: '14px', height: '14px' }} />
                    {member.email}
                  </div>

                  {member.position && (
                    <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase style={{ width: '14px', height: '14px' }} />
                      {member.position}
                    </div>
                  )}

                  {member.department && (
                    <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building style={{ width: '14px', height: '14px' }} />
                      {member.department}
                    </div>
                  )}

                  {member.phone && (
                    <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone style={{ width: '14px', height: '14px' }} />
                      {member.phone}
                    </div>
                  )}
                </div>

                {member.bio && (
                  <p className="text-sm text-muted" style={{ marginBottom: '16px', lineClamp: '2', WebkitLineClamp: '2', overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                    {member.bio}
                  </p>
                )}

                {/* الروابط الاجتماعية */}
                {member.social_links &&
                  Object.values(member.social_links).some((link) => link) && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      {member.social_links.twitter && (
                        <a
                          href={member.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted"
                          style={{ transition: 'color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#1DA1F2'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted))'}
                        >
                          <Twitter style={{ width: '16px', height: '16px' }} />
                        </a>
                      )}
                      {member.social_links.linkedin && (
                        <a
                          href={member.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted"
                          style={{ transition: 'color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#0077B5'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted))'}
                        >
                          <Linkedin style={{ width: '16px', height: '16px' }} />
                        </a>
                      )}
                      {member.social_links.facebook && (
                        <a
                          href={member.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted"
                          style={{ transition: 'color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#1877F2'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted))'}
                        >
                          <Facebook style={{ width: '16px', height: '16px' }} />
                        </a>
                      )}
                      {member.social_links.instagram && (
                        <a
                          href={member.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted"
                          style={{ transition: 'color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#E4405F'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted))'}
                        >
                          <Instagram style={{ width: '16px', height: '16px' }} />
                        </a>
                      )}
                    </div>
                  )}

                <div style={{ borderTop: '1px solid hsl(var(--line))', paddingTop: '12px' }}>
                  <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    انضم: {format(new Date(member.created_at), "dd MMM yyyy", { locale: ar })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* نموذج إضافة/تعديل عضو */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: '9999'
          }}>
            <div className="card" style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div className="card-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 className="card-title">
                  <Users style={{ width: '20px', height: '20px' }} />
                  {selectedMember ? "تعديل عضو الفريق" : "إضافة عضو جديد"}
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedMember(null);
                  }}
                  className="btn btn-sm btn-ghost"
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* معلومات أساسية */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="أدخل الاسم الكامل"
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="example@sabq.org"
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                        الدور الوظيفي *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange("role", e.target.value)}
                        disabled={rolesLoading}
                        className="input"
                        style={{ width: '100%' }}
                      >
                        <option value="">
                          {rolesLoading ? "جاري تحميل الأدوار..." : "اختر الدور الوظيفي"}
                        </option>
                        {!rolesLoading && availableRoles.length > 0 && availableRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                        المنصب
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleInputChange("position", e.target.value)}
                        placeholder="مثال: محرر أول"
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                        القسم
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        placeholder="مثال: قسم الأخبار"
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                        رقم الهاتف
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+966 5XXXXXXXX"
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                      نبذة مختصرة
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="نبذة عن العضو..."
                      rows={3}
                      className="input"
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                      الصورة الشخصية
                    </label>
                    <ImageUpload
                      currentImage={formData.avatar}
                      onImageUploaded={(url) => handleInputChange("avatar", url)}
                      type="avatar"
                      accept="image/*"
                      maxSize={5}
                      label="رفع صورة شخصية"
                    />
                    {formData.avatar && (
                      <div style={{ marginTop: '12px' }}>
                        <img
                          src={formData.avatar}
                          alt="معاينة الصورة"
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid hsl(var(--line))'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label" style={{ marginBottom: '12px', display: 'block' }}>
                      الروابط الاجتماعية
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label className="text-xs text-muted" style={{ marginBottom: '4px', display: 'block' }}>
                          Twitter
                        </label>
                        <input
                          type="url"
                          value={formData.social_links.twitter}
                          onChange={(e) => handleInputChange("social_links.twitter", e.target.value)}
                          placeholder="https://twitter.com/username"
                          className="input"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted" style={{ marginBottom: '4px', display: 'block' }}>
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={formData.social_links.linkedin}
                          onChange={(e) => handleInputChange("social_links.linkedin", e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="input"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted" style={{ marginBottom: '4px', display: 'block' }}>
                          Facebook
                        </label>
                        <input
                          type="url"
                          value={formData.social_links.facebook}
                          onChange={(e) => handleInputChange("social_links.facebook", e.target.value)}
                          placeholder="https://facebook.com/username"
                          className="input"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted" style={{ marginBottom: '4px', display: 'block' }}>
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={formData.social_links.instagram}
                          onChange={(e) => handleInputChange("social_links.instagram", e.target.value)}
                          placeholder="https://instagram.com/username"
                          className="input"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'hsl(var(--muted) / 0.1)',
                    borderRadius: '8px'
                  }}>
                    <label className="label">حالة العضو</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="text-sm text-muted">معطل</span>
                      <label style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '44px',
                        height: '24px'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange("is_active", e.target.checked)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: formData.is_active ? 'hsl(var(--accent))' : 'hsl(var(--muted))',
                          transition: '0.4s',
                          borderRadius: '24px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '""',
                            height: '18px',
                            width: '18px',
                            left: formData.is_active ? '23px' : '3px',
                            bottom: '3px',
                            background: 'white',
                            transition: '0.4s',
                            borderRadius: '50%'
                          }}></span>
                        </span>
                      </label>
                      <span className="text-sm text-muted">نشط</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '24px'
                }}>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      setSelectedMember(null);
                    }}
                    className="btn btn-outline"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveMember}
                    className="btn"
                    style={{ background: 'hsl(var(--accent))', color: 'white' }}
                  >
                    {selectedMember ? "حفظ التغييرات" : "إضافة العضو"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* إغلاق القائمة عند النقر خارجها */}
      {showActionMenu && (
        <div
          style={{
            position: 'fixed',
            inset: '0',
            zIndex: '999'
          }}
          onClick={() => setShowActionMenu(null)}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
