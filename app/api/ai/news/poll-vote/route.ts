import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export const runtime = 'nodejs'

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') || ''
  const ip = fwd.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '0.0.0.0'
  return ip
}

function hashIp(ip: string): string {
  const secret = process.env.POLL_SALT || 'poll_salt'
  return crypto.createHash('sha256').update(ip + secret).digest('hex').slice(0, 32)
}

function questionIdFromPayload(articleId: string, question: string, options?: string[]): string {
  const base = `${articleId}::${question}::${(options || []).join('|')}`
  return crypto.createHash('sha256').update(base).digest('hex').slice(0, 24)
}

export async function POST(req: NextRequest) {
  try {
    const { articleId, question, options, optionIndex, userId } = await req.json()

    if (!articleId || !question || typeof optionIndex !== 'number') {
      return NextResponse.json({ success: false, error: 'بيانات ناقصة' }, { status: 400 })
    }
    if (!Array.isArray(options) || optionIndex < 0 || optionIndex >= options.length) {
      return NextResponse.json({ success: false, error: 'خيارات غير صالحة' }, { status: 400 })
    }

    const ip = getClientIp(req)
    const ipHash = hashIp(ip)
    const ua = req.headers.get('user-agent') || ''
    const qid = questionIdFromPayload(articleId, question, options)

    // منع التكرار باستخدام unique constraints (user أو ip)
    // نحاول الإدراج، وإن فشل لوجود تصويت سابق نعيد النتائج الحالية
    try {
      await prisma.ai_poll_votes.create({
        data: {
          article_id: articleId,
          question_id: qid,
          question_text: question,
          option_index: optionIndex,
          options: options as any,
          user_id: userId || null,
          ip_hash: ipHash,
          user_agent: ua,
        },
      })
    } catch (e: any) {
      // ignore unique violation, سنعيد النتائج المجمّعة
    }

    // إرجاع النتائج المجمّعة
    const rows = await prisma.ai_poll_votes.findMany({
      where: { article_id: articleId, question_id: qid },
      select: { option_index: true },
    })
    const counts = new Array(options.length).fill(0)
    for (const r of rows) counts[r.option_index] = (counts[r.option_index] || 0) + 1
    const total = counts.reduce((a, b) => a + b, 0)

    return NextResponse.json({ success: true, counts, total })
  } catch (error) {
    console.error('poll vote error', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId') || ''
    const question = searchParams.get('question') || ''
    const optionsJson = searchParams.get('options') || '[]'
    const options = JSON.parse(optionsJson)
    if (!articleId || !question || !Array.isArray(options)) {
      return NextResponse.json({ success: false, error: 'بيانات ناقصة' }, { status: 400 })
    }
    const qid = questionIdFromPayload(articleId, question, options)
    const rows = await prisma.ai_poll_votes.findMany({
      where: { article_id: articleId, question_id: qid },
      select: { option_index: true },
    })
    const counts = new Array(options.length).fill(0)
    for (const r of rows) counts[r.option_index] = (counts[r.option_index] || 0) + 1
    const total = counts.reduce((a, b) => a + b, 0)
    return NextResponse.json({ success: true, counts, total })
  } catch (error) {
    console.error('poll results error', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}


