'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BookOpen,
  Image,
  Video,
  Mic,
  Link,
  Star,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Target,
  Zap,
  Award,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Archive,
  Copy,
  ExternalLink,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Send,
  Save,
  X,
  Check,
  Hash,
  Folder,
  FolderOpen
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlobalStore, useAuth } from '@/stores/globalStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OptimizedImage } from '@/components/OptimizedImage';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// ===========================================
// Types
// ===========================================

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived' | 'trashed';
  visibility: 'public' | 'private' | 'protected';
  type: 'article' | 'video' | 'audio' | 'gallery' | 'poll';
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
  };
  featured: boolean;
  sticky: boolean;
  allowComments: boolean;
  language: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  parentId?: string;
  children?: Category[];
  count: number;
}

interface ContentStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
  todayViews: number;
  weeklyGrowth: number;
  topCategory: string;
  averageEngagement: number;
}

interface ContentFilters {
  status?: string;
  category?: string;
  author?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  featured?: boolean;
  sticky?: boolean;
}

// ===========================================
// API Functions
// ===========================================

const fetchContent = async (
  page: number = 1,
  limit: number = 20,
  filters?: ContentFilters
): Promise<{ items: ContentItem[]; total: number; stats: ContentStats }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  const response = await fetch(`/api/content?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب المحتوى');
  }

  return response.json();
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch('/api/categories', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب الفئات');
  }

  return response.json();
};

const createContent = async (data: Partial<ContentItem>): Promise<ContentItem> => {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('فشل في إنشاء المحتوى');
  }

  return response.json();
};

const updateContent = async (id: string, data: Partial<ContentItem>): Promise<ContentItem> => {
  const response = await fetch(`/api/content/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('فشل في تحديث المحتوى');
  }

  return response.json();
};

const deleteContent = async (id: string): Promise<void> => {
  const response = await fetch(`/api/content/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في حذف المحتوى');
  }
};

const bulkUpdateContent = async (ids: string[], action: string, data?: any): Promise<void> => {
  const response = await fetch('/api/content/bulk', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
    body: JSON.stringify({ ids, action, data }),
  });

  if (!response.ok) {
    throw new Error('فشل في تحديث المحتوى بالجملة');
  }
};

// ===========================================
// Utility Functions
// ===========================================

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'archived':
      return 'bg-yellow-100 text-yellow-800';
    case 'trashed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'published':
      return <CheckCircle className="w-4 h-4" />;
    case 'draft':
      return <Edit className="w-4 h-4" />;
    case 'scheduled':
      return <Clock className="w-4 h-4" />;
    case 'archived':
      return <Archive className="w-4 h-4" />;
    case 'trashed':
      return <Trash2 className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'article':
      return <FileText className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'audio':
      return <Mic className="w-4 h-4" />;
    case 'gallery':
      return <Image className="w-4 h-4" />;
    case 'poll':
      return <Target className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// ===========================================
// Components
// ===========================================

const ContentStats = ({ stats }: { stats: ContentStats }) => {
  const statCards = [
    {
      title: 'إجمالي المحتوى',
      value: stats.total,
      icon: FileText,
      color: 'blue',
    },
    {
      title: 'منشور',
      value: stats.published,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'مسودات',
      value: stats.draft,
      icon: Edit,
      color: 'gray',
    },
    {
      title: 'مجدول',
      value: stats.scheduled,
      icon: Clock,
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
              </div>
              <div className={`h-10 w-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ContentFilters = ({ 
  filters, 
  onFiltersChange,
  categories 
}: { 
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
  categories: Category[];
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Input
        placeholder="البحث في المحتوى..."
        value={filters.search || ''}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        className="w-64"
      />

      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? undefined : value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="published">منشور</SelectItem>
          <SelectItem value="draft">مسودة</SelectItem>
          <SelectItem value="scheduled">مجدول</SelectItem>
          <SelectItem value="archived">مؤرشف</SelectItem>
          <SelectItem value="trashed">محذوف</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, category: value === 'all' ? undefined : value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="الفئة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الفئات</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, type: value === 'all' ? undefined : value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="النوع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="article">مقال</SelectItem>
          <SelectItem value="video">فيديو</SelectItem>
          <SelectItem value="audio">صوتي</SelectItem>
          <SelectItem value="gallery">معرض</SelectItem>
          <SelectItem value="poll">استطلاع</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        المزيد
      </Button>

      <Button variant="outline" size="sm">
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  );
};

const ContentTable = ({ 
  content, 
  onEdit, 
  onDelete, 
  selectedItems, 
  onSelectionChange 
}: { 
  content: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  selectedItems: string[];
  onSelectionChange: (ids: string[]) => void;
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(content.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, id]);
    } else {
      onSelectionChange(selectedItems.filter(itemId => itemId !== id));
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.length === content.length && content.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الكاتب</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإحصائيات</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.thumbnail && (
                      <OptimizedImage
                        src={item.thumbnail}
                        alt={item.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="font-medium line-clamp-1">{item.title}</span>
                        {item.featured && <Star className="w-4 h-4 text-yellow-500" />}
                        {item.sticky && <Flag className="w-4 h-4 text-red-500" />}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{item.excerpt}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={item.author.avatar} />
                      <AvatarFallback className="text-xs">
                        {item.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{item.author.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category.name}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      {item.status === 'published' ? 'منشور' :
                       item.status === 'draft' ? 'مسودة' :
                       item.status === 'scheduled' ? 'مجدول' :
                       item.status === 'archived' ? 'مؤرشف' : 'محذوف'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {item.publishedAt 
                      ? format(new Date(item.publishedAt), 'dd/MM/yyyy', { locale: ar })
                      : format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: ar })
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(item.stats.views)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {formatNumber(item.stats.likes)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {formatNumber(item.stats.comments)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={`/news/${item.slug}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="w-4 h-4 mr-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          نسخ
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          أرشفة
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const BulkActions = ({ 
  selectedItems, 
  onBulkAction,
  onClearSelection 
}: { 
  selectedItems: string[];
  onBulkAction: (action: string, data?: any) => void;
  onClearSelection: () => void;
}) => {
  if (selectedItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            تم اختيار {selectedItems.length} عنصر
          </span>
          
          <div className="flex items-center gap-2">
            <Select onValueChange={(value) => onBulkAction('status', { status: value })}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="تغيير الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">نشر</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="archived">أرشفة</SelectItem>
                <SelectItem value="trashed">حذف</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('feature')}
            >
              <Star className="w-4 h-4 mr-2" />
              إبراز
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('duplicate')}
            >
              <Copy className="w-4 h-4 mr-2" />
              نسخ
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('export')}
            >
              <Download className="w-4 h-4 mr-2" />
              تصدير
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="w-4 h-4 mr-2" />
          إلغاء الاختيار
        </Button>
      </div>
    </motion.div>
  );
};

const QuickEdit = ({ 
  item, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  item: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ContentItem>) => void;
}) => {
  const [formData, setFormData] = useState({
    title: item.title,
    excerpt: item.excerpt,
    status: item.status,
    featured: item.featured,
    sticky: item.sticky,
    allowComments: item.allowComments,
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تعديل سريع: {item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>العنوان</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label>المقتطف</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>مقال مميز</Label>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>مثبت في الأعلى</Label>
              <Switch
                checked={formData.sticky}
                onCheckedChange={(checked) => setFormData({ ...formData, sticky: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>السماح بالتعليقات</Label>
              <Switch
                checked={formData.allowComments}
                onCheckedChange={(checked) => setFormData({ ...formData, allowComments: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              حفظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ===========================================
// Main Component
// ===========================================

export const ContentManagement: React.FC = () => {
  const { user, trackPageView } = useGlobalStore();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ContentFilters>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    trackPageView('/content-management');
  }, [trackPageView]);

  // Fetch content
  const {
    data: contentData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['content', currentPage, filters],
    queryFn: () => fetchContent(currentPage, 20, filters),
    enabled: !!user,
  });

  // Fetch categories
  const {
    data: categories = [],
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: !!user,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentItem> }) =>
      updateContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('تم تحديث المحتوى بنجاح');
    },
    onError: () => {
      toast.error('فشل في تحديث المحتوى');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('تم حذف المحتوى بنجاح');
    },
    onError: () => {
      toast.error('فشل في حذف المحتوى');
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, action, data }: { ids: string[]; action: string; data?: any }) =>
      bulkUpdateContent(ids, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setSelectedItems([]);
      toast.success('تم تحديث المحتوى بالجملة بنجاح');
    },
    onError: () => {
      toast.error('فشل في تحديث المحتوى بالجملة');
    },
  });

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleQuickSave = (data: Partial<ContentItem>) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
      setEditingItem(null);
    }
  };

  const handleBulkAction = (action: string, data?: any) => {
    bulkUpdateMutation.mutate({ ids: selectedItems, action, data });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">يجب تسجيل الدخول لإدارة المحتوى</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>حدث خطأ في تحميل المحتوى</AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4">
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            إدارة المحتوى
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة ذكية وشاملة لجميع المحتوى
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            استيراد
          </Button>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            محتوى جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      {contentData?.stats && (
        <ContentStats stats={contentData.stats} />
      )}

      {/* Filters */}
      <ContentFilters 
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {/* Bulk actions */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <BulkActions
            selectedItems={selectedItems}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedItems([])}
          />
        )}
      </AnimatePresence>

      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>

        {contentData && (
          <div className="text-sm text-gray-500">
            عرض {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, contentData.total)} من {contentData.total}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : contentData?.items ? (
        <ContentTable
          content={contentData.items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا يوجد محتوى متاح</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {contentData && contentData.total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          
          <span className="text-sm text-gray-500">
            صفحة {currentPage} من {Math.ceil(contentData.total / 20)}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * 20 >= contentData.total}
          >
            التالي
          </Button>
        </div>
      )}

      {/* Quick edit dialog */}
      {editingItem && (
        <QuickEdit
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleQuickSave}
        />
      )}
    </div>
  );
};

export default ContentManagement;
