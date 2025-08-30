import { NextRequest, NextResponse } from 'next/server';

// Build-safe AI route for keyword generation
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
    
    console.log('🏷️ [AI Keywords] Starting keyword generation...');
    
    if (!isOpenAIAvailable()) {
      return NextResponse.json(OPENAI_ERROR_RESPONSE, { status: 500 });
    }
    
    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(OPENAI_ERROR_RESPONSE, { status: 500 });
    }
    
    const body = await request.json();
    const { content, title, currentKeywords = [] } = body;
    
    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required for keyword generation'
      }, { status: 400 });
    }
    
    const startTime = Date.now();
    
    const prompt = `
You are an SEO expert and Arabic content analyst. Analyze the article and extract the most important keywords.

Title: ${title || 'Not specified'}

Content:
${content}

Current Keywords: ${currentKeywords.join(', ') || 'None'}

Extract 12-15 important keywords including:
1. Main topic-related keywords (5-6 words)
2. Names of people and organizations mentioned (2-3 words)
3. Locations and places (2-3 words)
4. Important concepts and terms (3-4 words)

Return the result as a JSON array of keywords only, example:
["keyword1", "keyword2", "keyword3", ...]
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert specialized in Arabic content analysis and keyword extraction."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 250,
      temperature: 0.3,
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('No response received from AI');
    }

    // Try to parse JSON
    let keywords: string[] = [];
    try {
      keywords = JSON.parse(aiResponse);
    } catch (parseError) {
      // If parsing fails, extract keywords from text
      const lines = aiResponse.split(/[\n,]/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').replace(/^"/, '').replace(/"$/, ''))
        .filter(line => line.length > 2 && line.length < 50);
      
      keywords = lines.slice(0, 15);
    }

    // Clean and validate keywords
    keywords = keywords
      .filter(keyword => keyword && typeof keyword === 'string')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 2 && keyword.length < 50)
      .slice(0, 15);

    // Ensure we have valid keywords
    if (!keywords || keywords.length === 0) {
      throw new Error('Failed to extract keywords');
    }

    const processingTime = Date.now() - startTime;

    console.log(`✅ [AI Keywords] Generated ${keywords.length} keywords in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      keywords: keywords,
      count: keywords.length,
      processing_time: processingTime,
      generated_at: new Date().toISOString(),
      message: `Generated ${keywords.length} SEO keywords`
    });

  } catch (error: any) {
    console.error('❌ [AI Keywords] Error generating keywords:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate keywords',
      details: error.message,
      code: 'KEYWORD_GENERATION_ERROR'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Smart keyword generation service is ready',
    version: '1.0',
    model: 'gpt-4o',
    features: ['SEO optimization', '12-15 keywords', 'Content analysis', 'Arabic support']
  });
}
