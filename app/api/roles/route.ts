import { NextResponse } from 'next/server'; export async function GET() { return NextResponse.json({ roles: [], message: 'قائمة الأدوار' }) }
