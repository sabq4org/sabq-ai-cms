import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { is_published } = await request.json();

    const newsletter = await prisma.audioNewsletter.update({
      where: { id },
      data: { is_published }
    });

    return NextResponse.json({
      success: true,
      newsletter
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle publish status' },
      { status: 500 }
    );
  }
} 