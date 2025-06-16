import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ valid: false, message: 'API key is required' }, { status: 400 });
    }

    // اختبار المفتاح عن طريق استدعاء بسيط لـ OpenAI API
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ valid: true, message: 'API key is valid' });
    } else {
      return NextResponse.json({ valid: false, message: 'Invalid API key' });
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    return NextResponse.json({ valid: false, message: 'Error testing API key' }, { status: 500 });
  }
}
