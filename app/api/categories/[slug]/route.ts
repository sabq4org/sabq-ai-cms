import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  cover_image?: string;
  icon: string;
  color_hex: string;
  position: number;
  parent_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function loadCategories(): Promise<Category[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'categories.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.categories || [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const categories = await loadCategories();
    
    const category = categories.find(cat => cat.slug === slug && cat.is_active);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: category
    });
    
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
} 