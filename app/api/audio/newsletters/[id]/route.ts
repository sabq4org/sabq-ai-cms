import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE: حذف نشرة صوتية
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.audioNewsletter.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Newsletter deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to delete newsletter' },
      { status: 500 }
    );
  }
} 