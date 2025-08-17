/**
 * صفحة إدارة التعليقات الحديثة
 * Modern Comments Management Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  MessageSquare,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Eye,
  Flag,
  Heart,
  Reply,
  User,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Ban,
  Star,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    verified: boolean;
  };
  article: {
    id: string;
    title: string;
  };
  status: 'approved' | 'pending' | 'rejected' | 'spam';
  createdAt: Date;
  likes: number;
  dislikes: number;
  replies: number;
  reported: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
}

const commentsData: Comment[] = [
  {
    id: '1',
    content: 'مقال ممتاز ومفيد جداً، شكراً للكاتب على هذا المحتوى القيم والمعلومات المفصلة التي ساعدتني في فهم الموضوع بشكل أفضل.',
    author: {
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      verified: true
    },
    article: {
      id: '1',
      title: 'التطورات الاقتصادية في المملكة العربية السعودية 2025'
    },
    status: 'approved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 12,
    dislikes: 1,
    replies: 3,
    reported: false,
    sentiment: 'positive'
  },
  {
    id: '2',
    content: 'هل يمكن توضيح النقطة المتعلقة بالاستثمار في التقنية؟ أشعر أن هناك معلومات ناقصة في هذا الجانب.',
    author: {
      name: 'سارة أحمد',
      email: 'sara@example.com',
      verified: false
    },
    article: {
      id: '2',
      title: 'مستقبل الذكاء الاصطناعي في الشرق الأوسط'
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    likes: 5,
    dislikes: 0,
    replies: 1,
    reported: false,
    sentiment: 'neutral'
  },
  {
    id: '3',
    content: 'لا أتفق مع وجهة النظر المطروحة في المقال. أعتقد أن هناك جوانب أخرى لم يتم تناولها بالشكل المطلوب.',
    author: {
      name: 'محمد علي',
      email: 'mohammed@example.com',
      verified: true
    },
    article: {
      id: '3',
      title: 'قمة العشرين: نتائج ومخرجات مهمة'
    },
    status: 'approved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    likes: 3,
    dislikes: 8,
    replies: 7,
    reported: true,
    sentiment: 'negative'
  },
  {
    id: '4',
    content: 'تعليق غير مناسب وخارج الموضوع...',
    author: {
      name: 'مستخدم مجهول',
      email: 'spam@example.com',
      verified: false
    },
    article: {
      id: '1',
      title: 'التطورات الاقتصادية في المملكة العربية السعودية 2025'
    },
    status: 'spam',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    likes: 0,
    dislikes: 15,
    replies: 0,
    reported: true,
    sentiment: 'negative'
  }
];

export default function ModernComments() {
  const [comments, setComments] = useState(commentsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');

  const getStatusColor = (status: Comment['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'spam': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSentimentColor = (sentiment: Comment['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'neutral': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'negative': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Comment['status']) => {
    switch (status) {
      case 'approved': return 'موافق عليه';
      case 'pending': return 'في الانتظار';
      case 'rejected': return 'مرفوض';
      case 'spam': return 'رسائل مزعجة';
      default: return status;
    }
  };

  const getSentimentText = (sentiment: Comment['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'إيجابي';
      case 'neutral': return 'محايد';
      case 'negative': return 'سلبي';
      default: return sentiment;
    }
  };

  const getSentimentIcon = (sentiment: Comment['sentiment']) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-3 w-3" />;
      case 'neutral': return <MessageSquare className="h-3 w-3" />;
      case 'negative': return <ThumbsDown className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || comment.status === selectedStatus;
    const matchesSentiment = selectedSentiment === 'all' || comment.sentiment === selectedSentiment;
    
    return matchesSearch && matchesStatus && matchesSentiment;
  });

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  return (
    <DashboardLayout 
      pageTitle="إدارة التعليقات"
      pageDescription="مراجعة ومراقبة التعليقات والتفاعلات"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              الموافقة على المحدد
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              تصفية
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في التعليقات..."
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
            { title: 'إجمالي التعليقات', value: comments.length.toString(), icon: MessageSquare, color: 'blue' },
            { title: 'في الانتظار', value: comments.filter(c => c.status === 'pending').length.toString(), icon: Clock, color: 'yellow' },
            { title: 'تم الإبلاغ عنها', value: comments.filter(c => c.reported).length.toString(), icon: Flag, color: 'red' },
            { title: 'موافق عليها', value: comments.filter(c => c.status === 'approved').length.toString(), icon: Check, color: 'green' }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={cn(
                    "h-8 w-8",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'yellow' && "text-yellow-500",
                    stat.color === 'red' && "text-red-500",
                    stat.color === 'green' && "text-green-500"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التبويبات والمحتوى */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">جميع التعليقات</TabsTrigger>
            <TabsTrigger value="pending">في الانتظار</TabsTrigger>
            <TabsTrigger value="reported">مبلغ عنها</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* فلاتر */}
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm">الحالة</Label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="approved">موافق عليه</option>
                  <option value="pending">في الانتظار</option>
                  <option value="rejected">مرفوض</option>
                  <option value="spam">رسائل مزعجة</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">المشاعر</Label>
                <select 
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">جميع المشاعر</option>
                  <option value="positive">إيجابي</option>
                  <option value="neutral">محايد</option>
                  <option value="negative">سلبي</option>
                </select>
              </div>
            </div>

            {/* قائمة التعليقات */}
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <Card key={comment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* معلومات المؤلف والحالة */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {getUserInitials(comment.author.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{comment.author.name}</span>
                              {comment.author.verified && (
                                <Check className="h-4 w-4 text-blue-500" />
                              )}
                              {comment.reported && (
                                <Flag className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{getTimeAgo(comment.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(comment.status)}>
                            {getStatusText(comment.status)}
                          </Badge>
                          <Badge className={getSentimentColor(comment.sentiment)}>
                            {getSentimentIcon(comment.sentiment)}
                            <span className="mr-1">{getSentimentText(comment.sentiment)}</span>
                          </Badge>
                        </div>
                      </div>

                      {/* محتوى التعليق */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>

                      {/* معلومات المقال */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>على المقال:</span>
                        <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                          {comment.article.title}
                        </span>
                      </div>

                      {/* إحصائيات التفاعل */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{comment.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="h-3 w-3" />
                            <span>{comment.dislikes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            <span>{comment.replies} رد</span>
                          </div>
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex gap-2">
                          {comment.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Check className="h-4 w-4 mr-1" />
                                موافقة
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                <X className="h-4 w-4 mr-1" />
                                رفض
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Reply className="h-4 w-4 mr-2" />
                                الرد
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Flag className="h-4 w-4 mr-2" />
                                الإبلاغ
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Ban className="h-4 w-4 mr-2" />
                                حظر المستخدم
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <X className="h-4 w-4 mr-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">التعليقات في الانتظار</h3>
              <p className="text-gray-600">
                {comments.filter(c => c.status === 'pending').length} تعليق في انتظار المراجعة
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reported" className="space-y-4">
            <div className="text-center py-8">
              <Flag className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">التعليقات المبلغ عنها</h3>
              <p className="text-gray-600">
                {comments.filter(c => c.reported).length} تعليق تم الإبلاغ عنه
              </p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تحليل المشاعر</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['positive', 'neutral', 'negative'].map((sentiment) => (
                      <div key={sentiment} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(sentiment as Comment['sentiment'])}
                          <span className="text-sm">{getSentimentText(sentiment as Comment['sentiment'])}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(comments.filter(c => c.sentiment === sentiment).length / comments.length) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="font-semibold text-sm w-8">
                            {comments.filter(c => c.sentiment === sentiment).length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات النشاط</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">متوسط التعليقات/اليوم</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">47</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">معدل الموافقة</span>
                      <span className="font-semibold">84.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">التعليقات المميزة</span>
                      <span className="font-semibold">{comments.filter(c => c.likes > 10).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
