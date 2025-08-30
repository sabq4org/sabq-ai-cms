import { NextRequest, NextResponse } from 'next/server';

// Simple build-safe AI route that won't fail during build time
export async function POST(request: NextRequest) {
  try {
    // During build time, just return a placeholder response
    if (process.env.NODE_ENV === 'production' && !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'AI service not configured',
        message: 'OpenAI API key not available during build'
      }, { status: 503 });
    }

    // Only import OpenAI when we actually need it
    const { getOpenAIClient, isOpenAIAvailable, OPENAI_ERROR_RESPONSE } = await import('@/lib/ai/openai-client');
    
    console.log('🎯 [AI Titles] Starting title generation...');
    
    if (!isOpenAIAvailable()) {
      return NextResponse.json(OPENAI_ERROR_RESPONSE, { status: 500 });
    }
    
    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(OPENAI_ERROR_RESPONSE, { status: 500 });
    }
    
    const body = await request.json();
    const { content, currentTitle } = body;
    
    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required for title generation'
      }, { status: 400 });
    }
    
    const startTime = Date.now();
    
    const prompt = `
You are a professional editor for Sabq News. Generate 5 attractive, professional article titles.

Content:
${content}

Current Title: ${currentTitle || 'None'}

Create 5 different alternative titles, each should be:
1. Engaging and attention-grabbing
2. Accurately reflecting the content
3. Suitable for digital journalism
4. Between 8-15 words
5. Containing strong, impactful words

Return the result as a JSON array only, example:
["Title One", "Title Two", "Title Three", "Title Four", "Title Five"]
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional news editor expert in writing attractive and professional titles in Arabic."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('No response received from AI');
    }

    // Try to parse JSON
    let titles: string[] = [];
    try {
      titles = JSON.parse(aiResponse);
    } catch (parseError) {
      // If parsing fails, extract titles from text
      const lines = aiResponse.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').replace(/^"/, '').replace(/"$/, ''))
        .filter(line => line.length > 5);
      
      titles = lines.slice(0, 5);
    }

    // Ensure we have valid titles
    if (!titles || titles.length === 0) {
      throw new Error('Failed to parse generated titles');
    }

    const processingTime = Date.now() - startTime;

    console.log(`✅ [AI Titles] Generated ${titles.length} titles in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      titles: titles,
      processing_time: processingTime,
      generated_at: new Date().toISOString(),
      message: `Generated ${titles.length} professional titles`
    });

  } catch (error: any) {
    console.error('❌ [AI Titles] Error generating titles:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate titles',
      details: error.message,
      code: 'TITLE_GENERATION_ERROR'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Smart title generation service is ready',
    version: '1.0',
    model: 'gpt-4o',
    features: ['Generate 5 titles', 'Professional titles', 'Content analysis', 'Impactful words']
  });
}
