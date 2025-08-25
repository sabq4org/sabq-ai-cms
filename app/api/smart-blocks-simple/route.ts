import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// دالة مساعدة لتوليد ID
function generateId() {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET - جلب البلوكات
export async function GET() {
  try {
    console.log('🔍 [Smart Blocks Simple] جلب البلوكات...');
    
    const blocks = await prisma.smart_blocks.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`✅ [Smart Blocks Simple] تم جلب ${blocks.length} بلوك`);
    
    return NextResponse.json(blocks);
    
  } catch (error: any) {
    console.error('❌ [Smart Blocks Simple] خطأ:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب البلوكات',
      details: error.message
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

// POST - إنشاء بلوك
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Smart Blocks Simple] POST - بدء الطلب');
    
    const data = await request.json();
    console.log('📦 البيانات:', data);
    
    const newBlock = await prisma.smart_blocks.create({
      data: {
        id: generateId(),
        name: data.name || 'بلوك جديد',
        type: data.type || 'smart',
        config: data,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إنشاء البلوك:', newBlock.id);
    return NextResponse.json(newBlock, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ [Smart Blocks Simple] خطأ:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء البلوك',
      details: error.message
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}