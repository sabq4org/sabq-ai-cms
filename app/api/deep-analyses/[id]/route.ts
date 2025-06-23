import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { DeepAnalysis, UpdateAnalysisRequest } from '@/types/deep-analysis';

// مسار ملف البيانات
const DATA_PATH = join(process.cwd(), 'data', 'deep_analyses.json');

// قراءة التحليلات من الملف
async function readAnalyses(): Promise<DeepAnalysis[]> {
  try {
    const data = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// كتابة التحليلات إلى الملف
async function writeAnalyses(analyses: DeepAnalysis[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(analyses, null, 2));
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - جلب تحليل محدد
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const analyses = await readAnalyses();
    const analysis = analyses.find(a => a.id === id || a.slug === id);
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    // زيادة عدد المشاهدات
    analysis.views += 1;
    await writeAnalyses(analyses);
    
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

// PUT - تحديث تحليل
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body: UpdateAnalysisRequest = await request.json();
    const analyses = await readAnalyses();
    
    const analysisIndex = analyses.findIndex(a => a.id === id);
    if (analysisIndex === -1) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    const currentAnalysis = analyses[analysisIndex];
    
    // تحديث التحليل
    const updatedAnalysis: DeepAnalysis = {
      ...currentAnalysis,
      ...(body.title && { title: body.title }),
      ...(body.summary && { summary: body.summary }),
      ...(body.categories && { categories: body.categories }),
      ...(body.tags && { tags: body.tags }),
      ...(body.status && { status: body.status }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      ...(body.displayPosition && { displayPosition: body.displayPosition }),
      updatedAt: new Date().toISOString()
    };
    
    // إذا تم تغيير الحالة إلى منشور
    if (body.status === 'published' && currentAnalysis.status !== 'published') {
      updatedAnalysis.publishedAt = new Date().toISOString();
    }
    
    analyses[analysisIndex] = updatedAnalysis;
    await writeAnalyses(analyses);
    
    return NextResponse.json(updatedAnalysis);
    
  } catch (error) {
    console.error('Error updating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to update analysis' },
      { status: 500 }
    );
  }
}

// DELETE - حذف تحليل
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const analyses = await readAnalyses();
    
    const analysisIndex = analyses.findIndex(a => a.id === id);
    if (analysisIndex === -1) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    // حذف التحليل
    analyses.splice(analysisIndex, 1);
    await writeAnalyses(analyses);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
} 