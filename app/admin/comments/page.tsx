/**
 * صفحة إدارة التعليقات مع التصميم الحديث RTL
 */

"use client";

import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  Eye,
  Filter,
  Flag,
  MessageSquare,
  MoreHorizontal,
  Reply,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    email: string;
  };
  article: {
    title: string;
    slug: string;
  };
  status: "approved" | "pending" | "rejected" | "spam";
  createdAt: string;
  updatedAt?: string;
  likes: number;
  dislikes: number;
  reports: number;
  parentId?: string;
  replies: Comment[];
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected" | "spam"
  >("all");

  // بيانات وهمية للاختبار
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: "1",
        content:
          "مقال ممتاز ومفيد جداً، شكراً لكم على هذا المحتوى المميز. أتطلع لقراءة المزيد من هذه المقالات القيمة.",
        author: {
          name: "أحمد محمد الأحمد",
          email: "ahmed@example.com",
          avatar: "",
        },
        article: {
          title: "تطورات الذكاء الاصطناعي في 2024",
          slug: "ai-developments-2024",
        },
        status: "approved",
        createdAt: "2024-07-26T10:30:00Z",
        likes: 15,
        dislikes: 2,
        reports: 0,
        replies: [],
      },
      {
        id: "2",
        content:
          "لست متفق مع بعض النقاط المذكورة في المقال، خاصة الجزء المتعلق بالتأثير على الوظائف.",
        author: {
          name: "فاطمة علي السالم",
          email: "fatima@example.com",
          avatar: "",
        },
        article: {
          title: "تطورات الذكاء الاصطناعي في 2024",
          slug: "ai-developments-2024",
        },
        status: "pending",
        createdAt: "2024-07-26T09:15:00Z",
        likes: 8,
        dislikes: 5,
        reports: 1,
        replies: [],
      },
      {
        id: "3",
        content: "محتوى سطحي ولا يقدم معلومات جديدة!",
        author: {
          name: "مستخدم مجهول",
          email: "anonymous@example.com",
          avatar: "",
        },
        article: {
          title: "دليل المبتدئين للبرمجة",
          slug: "programming-guide",
        },
        status: "rejected",
        createdAt: "2024-07-26T08:45:00Z",
        likes: 2,
        dislikes: 12,
        reports: 3,
        replies: [],
      },
    ];

    setTimeout(() => {
      setComments(mockComments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "spam":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "موافق عليه";
      case "pending":
        return "في الانتظار";
      case "rejected":
        return "مرفوض";
      case "spam":
        return "سبام";
      default:
        return "غير محدد";
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || comment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="space-y-6" dir="rtl">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي التعليقات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {comments.length.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">موافق عليها</p>
                  <p className="text-2xl font-bold text-green-600">
                    {comments.filter((c) => c.status === "approved").length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {comments.filter((c) => c.status === "pending").length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">مرفوضة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {comments.filter((c) => c.status === "rejected").length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* البحث والفلاتر */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="البحث في التعليقات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="approved">موافق عليها</option>
                  <option value="pending">في الانتظار</option>
                  <option value="rejected">مرفوضة</option>
                  <option value="spam">سبام</option>
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 ml-2" />
                  فلاتر متقدمة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة التعليقات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              قائمة التعليقات ({filteredComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل التعليقات...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage
                          src={comment.author.avatar}
                          alt={comment.author.name}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {comment.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {comment.author.name}
                              </h3>
                              <Badge
                                className={`${getStatusColor(
                                  comment.status
                                )} border text-xs`}
                              >
                                {getStatusText(comment.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "ar-SA"
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {comment.author.email}
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 ml-2" />
                                عرض المقال
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Reply className="w-4 h-4 ml-2" />
                                الرد على التعليق
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {comment.status === "pending" && (
                                <>
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    موافقة
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="w-4 h-4 ml-2" />
                                    رفض
                                  </DropdownMenuItem>
                                </>
                              )}
                              {comment.status === "approved" && (
                                <DropdownMenuItem className="text-yellow-600">
                                  <Ban className="w-4 h-4 ml-2" />
                                  إلغاء الموافقة
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-orange-600">
                                <Flag className="w-4 h-4 ml-2" />
                                تمييز كسبام
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف التعليق
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-800 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                            المقال: {comment.article.title}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {comment.likes}
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="w-4 h-4" />
                              {comment.dislikes}
                            </div>
                            {comment.reports > 0 && (
                              <div className="flex items-center gap-1 text-red-600">
                                <Flag className="w-4 h-4" />
                                {comment.reports} بلاغ
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
