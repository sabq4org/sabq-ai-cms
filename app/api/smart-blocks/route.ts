import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';











const prisma = new PrismaClient();

interface SmartBlock {
  id: string;
  name: string;
  position: 'topBanner' | 'afterHighlights' | 'afterCards' | 'beforePersonalization' | 'beforeFooter' | 'below_header' | 'below_personalized' | 'below_deep_analysis' | 'above_footer';
  type: 'smart' | 'custom' | 'html';
  status: 'active' | 'inactive' | 'scheduled';
  displayType: 'grid' | 'cards' | 'horizontal' | 'gallery' | 'list' | 'hero-slider';
  keywords?: string[];
  category?: string;
  articlesCount: number;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  customHtml?: string;
  schedule?: {
    startDate: string;
    endDate: string;
    isAlwaysActive: boolean;
  };
  order: number;
  createdAt: string;
  updatedAt: string;
}



// دالة مساعدة لتوليد ID
function generateId() {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// قراءة البلوكات من قاعدة البيانات
async function readBlocks(): Promise<SmartBlock[]> {
  try {
    console.log('🔍 جلب البلوكات الذكية من قاعدة البيانات...');
    
    const blocks = await prisma.smart_blocks.findMany({
      orderBy: [
        { is_active: 'desc' },
        { created_at: 'desc' }
      ]
    });

    console.log(`✅ تم جلب ${blocks.length} بلوك ذكي`);

    // تحويل البيانات من قاعدة البيانات إلى تنسيق API القديم
    return blocks.map(block => {
      const config = block.config as any;
      return {
        id: block.id,
        name: block.name,
        position: config.position || 'afterHighlights',
        type: block.type as any,
        status: block.is_active ? 'active' : 'inactive',
        displayType: config.displayType || 'grid',
        keywords: config.keywords || [],
        category: config.category,
        articlesCount: config.articlesCount || 6,
        theme: config.theme || {
          primaryColor: '#00BFA6',
          backgroundColor: '#f8fafc',
          textColor: '#1a1a1a'
        },
        order: config.order || 1,
        schedule: config.schedule,
        createdAt: block.created_at.toISOString(),
        updatedAt: block.updated_at.toISOString()
      };
    });

  } catch (error) {
    console.error('❌ خطأ في جلب البلوكات:', error);
    
    // في حالة فشل قاعدة البيانات، إرجع بلوكات افتراضية
    const defaultBlocks: SmartBlock[] = [
        {
          id: '1',
          name: 'أخبار اليوم الوطني',
          position: 'afterHighlights',
          type: 'smart',
          status: 'active',
          displayType: 'grid',
          keywords: ['اليوم الوطني'],
          articlesCount: 6,
          theme: {
            primaryColor: '#00BFA6',
            backgroundColor: '#f8fafc',
            textColor: '#1a1a1a'
          },
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'أخبار الرياضة',
          position: 'afterCards',
          type: 'smart',
          status: 'active',
          displayType: 'cards',
          keywords: ['رياضة'],
          category: 'رياضة',
          articlesCount: 4,
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937'
          },
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      return defaultBlocks;
  } finally {
    await prisma.$disconnect();
  }
}

// إنشاء بلوك جديد في قاعدة البيانات
async function createBlock(blockData: SmartBlock) {
  try {
    console.log('📝 إنشاء بلوك جديد:', blockData.name);
    
    const newBlock = await prisma.smart_blocks.create({
      data: {
        id: blockData.id || generateId(),
        name: blockData.name,
        type: blockData.type,
        config: {
          position: blockData.position,
          displayType: blockData.displayType,
          keywords: blockData.keywords,
          category: blockData.category,
          articlesCount: blockData.articlesCount,
          theme: blockData.theme,
          order: blockData.order,
          schedule: blockData.schedule
        },
        is_active: blockData.status === 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إنشاء البلوك:', newBlock.id);
    return newBlock;
  } catch (error) {
    console.error('❌ خطأ في إنشاء البلوك:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تحديث بلوك في قاعدة البيانات
async function updateBlock(id: string, blockData: Partial<SmartBlock>) {
  try {
    console.log('🔄 تحديث البلوك:', id);
    
    const updatedBlock = await prisma.smart_blocks.update({
      where: { id },
      data: {
        name: blockData.name,
        type: blockData.type,
        config: {
          position: blockData.position,
          displayType: blockData.displayType,
          keywords: blockData.keywords,
          category: blockData.category,
          articlesCount: blockData.articlesCount,
          theme: blockData.theme,
          order: blockData.order,
          schedule: blockData.schedule
        },
        is_active: blockData.status === 'active',
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم تحديث البلوك:', updatedBlock.id);
    return updatedBlock;
  } catch (error) {
    console.error('❌ خطأ في تحديث البلوك:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// حذف بلوك من قاعدة البيانات
async function deleteBlock(id: string) {
  try {
    console.log('🗑️ حذف البلوك:', id);
    
    await prisma.smart_blocks.delete({
      where: { id }
    });
    
    console.log('✅ تم حذف البلوك:', id);
  } catch (error) {
    console.error('❌ خطأ في حذف البلوك:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// GET - جلب جميع البلوكات
export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const status = searchParams.get('status');
    
    let blocks = await readBlocks();
    
    // فلترة حسب الموقع
    if (position) {
      blocks = blocks.filter(block => block.position === position);
    }
    
    // فلترة حسب الحالة
    if (status) {
      blocks = blocks.filter(block => block.status === status);
    }
    
    // فلترة البلوكات المجدولة
    const now = new Date().toISOString();
    blocks = blocks.filter(block => {
      if (block.status === 'scheduled' && block.schedule && !block.schedule.isAlwaysActive) {
        const startDate = block.schedule.startDate;
        const endDate = block.schedule.endDate;
        
        if (startDate && endDate) {
          return now >= startDate && now <= endDate;
        }
      }
      return true;
    });
    
    // ترتيب حسب order
    blocks.sort((a, b) => a.order - b.order);
    
    return NextResponse.json(blocks);
  } catch (error) {
    console.error('خطأ في جلب البلوكات:', error);
    return NextResponse.json(
      { error: 'فشل في جلب البلوكات' },
      { status: 500 }
    );
  }
}

// POST - إنشاء بلوك جديد
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/smart-blocks - بداية معالجة الطلب');
    
    const blockData = await request.json();
    console.log('📦 البيانات المستلمة:', blockData);
    
    // التحقق من صحة البيانات الأساسية
    if (!blockData.name || !blockData.type) {
      return NextResponse.json({
        success: false,
        error: 'اسم البلوك والنوع مطلوبان'
      }, { status: 400 });
    }
    
    // إنشاء البلوك الجديد
    const newBlock: SmartBlock = {
      ...blockData,
      id: blockData.id || generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: blockData.order || 1,
      status: blockData.status || 'active'
    };
    
    const createdBlock = await createBlock(newBlock);
    
    // تحويل الاستجابة لتنسيق API المتوقع
    const responseBlock = {
      ...newBlock,
      id: createdBlock.id
    };
    
    console.log('✅ تم إنشاء البلوك بنجاح:', responseBlock.id);
    return NextResponse.json(responseBlock, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء البلوك:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء البلوك',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - تحديث بلوك أو ترتيب البلوكات
export async function PUT(request: NextRequest) {
  try {
    console.log('🚀 PUT /api/smart-blocks - بداية معالجة الطلب');
    
    const data = await request.json();
    
    // إذا كان الطلب يحتوي على id، فهو تحديث بلوك واحد
    if (data.id) {
      console.log('🔄 تحديث بلوك واحد:', data.id);
      
      const updatedBlock = await updateBlock(data.id, data);
      
      // تحويل الاستجابة لتنسيق API
      const responseBlock = {
        id: updatedBlock.id,
        name: updatedBlock.name,
        type: updatedBlock.type,
        ...(updatedBlock.config as any),
        status: updatedBlock.is_active ? 'active' : 'inactive',
        createdAt: updatedBlock.created_at.toISOString(),
        updatedAt: updatedBlock.updated_at.toISOString()
      };
      
      return NextResponse.json(responseBlock);
    }
    
    // إذا كان الطلب يحتوي على مصفوفة blocks، فهو تحديث ترتيب
    if (data.blocks && Array.isArray(data.blocks)) {
      console.log('🔄 تحديث ترتيب البلوكات');
      
      // تحديث ترتيب كل بلوك
      const updatePromises = data.blocks.map((block: any, index: number) => 
        updateBlock(block.id, { ...block, order: index + 1 })
      );
      
      await Promise.all(updatePromises);
      
      return NextResponse.json({ message: 'تم تحديث ترتيب البلوكات بنجاح' });
    }
    
    return NextResponse.json(
      { error: 'البيانات غير صحيحة' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث البلوكات:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث البلوكات',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - حذف بلوك
export async function DELETE(request: NextRequest) {
  try {
    console.log('🚀 DELETE /api/smart-blocks - بداية معالجة الطلب');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف البلوك مطلوب'
      }, { status: 400 });
    }
    
    console.log('🗑️ حذف البلوك:', id);
    await deleteBlock(id);
    
    console.log('✅ تم حذف البلوك بنجاح:', id);
    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف البلوك بنجاح' 
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في حذف البلوك:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'البلوك غير موجود'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف البلوك',
      details: error.message
    }, { status: 500 });
  }
} 