'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDarkMode } from "@/hooks/useDarkMode";
import { 
  ArrowRight, 
  Edit, 
  Eye, 
  ThumbsUp, 
  Share2, 
  Bookmark,
  Calendar,
  User,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface DeepAnalysis {
  id: string;
  ai_summary: string;
  key_topics: string[];
  tags: string[];
  sentiment: string;
  engagement_score: number;
  analyzed_at: string;
  updated_at: string;
  metadata: {
    title: string;
    summary: string;
    content?: string;
    authorName: string;
    categories: string[];
    sourceType: string;
    status: string;
    qualityScore: number;
    featuredImage?: string;
    views?: number;
    likes?: number;
    readingTime?: number;
  };
}

export default function ViewDeepAnalysisPage() {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!params?.id) return;
      
      try {
        const response = await fetch(`/api/deep-analyses/${params.id}`);
        if (!response.ok) throw new Error('فشل جلب البيانات');
        
        const data = await response.json();
        if (data) {
          // Handle both direct analysis response and wrapped response
          const analysisData = data.analysis || data;
          setAnalysis(analysisData);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        router.push('/dashboard/deep-analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center">
          <p className="text-lg mb-4">التحليل غير موجود</p>
          <Button onClick={() => router.push('/dashboard/deep-analysis')}>
            العودة للقائمة
          </Button>
        </div>
      </div>
    );
  }

  const metadata = analysis.metadata || {};
  const sentimentColor = {
    positive: 'text-green-600',
    neutral: 'text-gray-600',
    negative: 'text-red-600'
  }[analysis.sentiment] || 'text-gray-600';

  const sentimentLabel = {
    positive: 'إيجابي',
    neutral: 'محايد',
    negative: 'سلبي'
  }[analysis.sentiment] || 'محايد';

  return (
    <div className={`min-h-screen p-4 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={() => router.push('/dashboard/deep-analysis')}
            variant="outline"
            size="sm"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للقائمة
          </Button>
          
          <Link href={`/dashboard/deep-analysis/${params?.id}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Title and Image */}
          {metadata.featuredImage && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
              <img
                src={metadata.featuredImage}
                alt={metadata.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h1 className="absolute bottom-4 right-4 text-3xl md:text-4xl font-bold text-white">
                {metadata.title || 'تحليل عميق'}
              </h1>
            </div>
          )}
          
          {!metadata.featuredImage && (
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {metadata.title || 'تحليل عميق'}
            </h1>
          )}

          {/* Meta Info */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{metadata.authorName || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(analysis.analyzed_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span>{metadata.views || 0} مشاهدة</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className={sentimentColor}>{sentimentLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>الملخص</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                {metadata.summary || analysis.ai_summary}
              </p>
            </CardContent>
          </Card>

          {/* Content */}
          {metadata.content && (
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle>المحتوى التفصيلي</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: metadata.content }}
                />
              </CardContent>
            </Card>
          )}

          {/* Tags and Categories */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>التصنيفات والكلمات المفتاحية</CardTitle>
            </CardHeader>
            <CardContent>
              {metadata.categories && metadata.categories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">التصنيفات:</h4>
                  <div className="flex flex-wrap gap-2">
                    {metadata.categories.map((category, index) => (
                      <Badge key={index} variant="default">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.tags && analysis.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">الكلمات المفتاحية:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Details */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>تفاصيل التحليل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">نوع المصدر</p>
                  <p className="font-medium">
                    {metadata.sourceType === 'original' ? 'محتوى أصلي' :
                     metadata.sourceType === 'article' ? 'من مقال' :
                     metadata.sourceType === 'gpt' ? 'بالذكاء الاصطناعي' :
                     metadata.sourceType === 'mixed' ? 'مختلط' : 'غير محدد'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">نقاط الجودة</p>
                  <p className="font-medium">{metadata.qualityScore || analysis.engagement_score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">وقت القراءة</p>
                  <p className="font-medium">{metadata.readingTime || 5} دقائق</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">الحالة</p>
                  <Badge variant={metadata.status === 'published' ? 'default' : 'secondary'}>
                    {metadata.status === 'published' ? 'منشور' : 'مسودة'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="flex gap-4 justify-center">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="h-4 w-4 ml-2" />
                  {metadata.likes || 0} إعجاب
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 ml-2" />
                  مشاركة
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
