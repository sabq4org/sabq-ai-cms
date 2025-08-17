import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

// دوال مساعدة لاستخراج المعلومات من النص عند فشل تحليل JSON
function extractField(content: string, englishKey: string, arabicKey: string): string {
  // البحث عن النمط بالإنجليزية
  const englishPattern = new RegExp(`"${englishKey}"\\s*:\\s*"([^"]+)"`, 'gi');
  const englishMatch = content.match(englishPattern);
  if (englishMatch && englishMatch[0]) {
    const value = englishMatch[0].match(/"([^"]+)"$/);
    if (value) return value[1];
  }

  // البحث عن النمط بالعربية
  const arabicPattern = new RegExp(`${arabicKey}\\s*:\\s*"([^"]+)"`, 'gi');
  const arabicMatch = content.match(arabicPattern);
  if (arabicMatch && arabicMatch[0]) {
    const value = arabicMatch[0].match(/"([^"]+)"$/);
    if (value) return value[1];
  }

  // البحث البديل
  const alternativePattern = new RegExp(`${englishKey}.*?[:：]\\s*["']?([^"'\\n]+)["']?`, 'gi');
  const altMatch = content.match(alternativePattern);
  if (altMatch && altMatch[0]) {
    const value = altMatch[0].split(/[:：]/)[1]?.trim().replace(/["']/g, '');
    if (value) return value;
  }

  return "";
}

function extractKeywords(content: string): string[] {
  // البحث عن الكلمات المفتاحية
  const keywordPatterns = [
    /"keywords"\s*:\s*\[([^\]]+)\]/gi,
    /الكلمات المفتاحية\s*:\s*\[([^\]]+)\]/gi,
    /"keywords"\s*:\s*"([^"]+)"/gi,
    /keywords.*?[:：]\s*\[([^\]]+)\]/gi
  ];

  for (const pattern of keywordPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      try {
        // تنظيف النص
        const keywordsText = match[1]
          .replace(/["']/g, '"')
          .split(',')
          .map(k => k.trim().replace(/^["']|["']$/g, ''))
          .filter(k => k.length > 0);
        
        if (keywordsText.length > 0) {
          return keywordsText.slice(0, 8); // حد أقصى 8 كلمات
        }
      } catch (error) {
        console.error("خطأ في استخراج الكلمات المفتاحية:", error);
        continue;
      }
    }
  }

  return [];
}

export async function POST(request: NextRequest) {
  try {
    // التحقق من صلاحيات المستخدم
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error || "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    // التحقق من نوع البيانات وتحويلها إذا لزم الأمر
    if (!content) {
      return NextResponse.json(
        { error: "المحتوى مطلوب" },
        { status: 400 }
      );
    }

    // تحويل المحتوى إلى string إذا لم يكن كذلك
    const contentString = typeof content === 'string' ? content : String(content);

    if (contentString.length < 100) {
      return NextResponse.json(
        { error: "المحتوى قصير جداً. يجب أن يكون 100 حرف على الأقل للحصول على نتائج جيدة" },
        { status: 400 }
      );
    }

    if (contentString.length > 5000) {
      return NextResponse.json(
        { error: "المحتوى طويل جداً. يجب أن يكون أقل من 5000 حرف" },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey === "sk-your-openai-api-key" || openaiApiKey.startsWith("sk-your-")) {
      console.error("❌ مفتاح OpenAI API غير مضبوط أو يحتوي على قيمة وهمية");
      return NextResponse.json(
        { 
          error: "مفتاح OpenAI API غير مضبوط بشكل صحيح. يرجى ضبط OPENAI_API_KEY في ملف .env.local",
          details: "يجب الحصول على مفتاح صحيح من https://platform.openai.com/account/api-keys"
        },
        { status: 500 }
      );
    }

    console.log("📤 محتوى مرسل إلى OpenAI:", {
      contentLength: contentString.length,
      contentPreview: contentString.substring(0, 200) + "...",
      timestamp: new Date().toISOString()
    });

    // استدعاء OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `أنت محرر أخبار محترف متخصص في الإعلام العربي وصحيفة سبق السعودية. 

مهمتك هي تحليل المحتوى المقدم بدقة وإنشاء عناصر إخبارية مناسبة ومتصلة مباشرة بالموضوع.

قواعد مهمة:
1. اقرأ المحتوى بعناية واستخرج الموضوع الرئيسي والتفاصيل المهمة
2. لا تخترع معلومات غير موجودة في النص
3. تأكد من أن العنوان يعكس جوهر الخبر الفعلي
4. اجعل الموجز ملخصاً دقيقاً للمحتوى المقدم
5. استخدم كلمات مفتاحية مستخرجة من النص الأصلي

يجب أن ترد بـ JSON صحيح بالتنسيق التالي:
{
  "title": "عنوان رئيسي يلخص الموضوع الأساسي (50-80 حرف)",
  "subtitle": "عنوان فرعي يضيف تفاصيل مهمة (80-120 حرف، اختياري)",
  "excerpt": "موجز دقيق يلخص المحتوى المقدم (200-400 حرف)",
  "keywords": ["كلمة1", "كلمة2", "كلمة3", "كلمة4", "كلمة5"]
}

تأكد من:
- استخدام اللغة العربية الفصحى
- الدقة في نقل المعلومات من النص الأصلي
- عدم إضافة معلومات خارجية
- صحة تنسيق JSON`
          },
          {
            role: "user",
            content: `بناءً على محتوى الخبر التالي، حلل النص بعناية وأنشئ العناصر المطلوبة مع التركيز على الموضوع الرئيسي والمعلومات المتاحة فقط:

النص الأصلي:
${contentString}

المطلوب: تحليل النص أعلاه وإنشاء عنوان وموجز وكلمات مفتاحية تعكس المحتوى الفعلي بدقة.`
          }
        ],
        temperature: 0.3, // تقليل العشوائية للحصول على نتائج أكثر دقة
        max_tokens: 800,  // تقليل عدد الرموز لضمان التركيز
        response_format: { type: "json_object" },
        presence_penalty: 0.1, // تقليل التكرار
        frequency_penalty: 0.1 // تقليل التكرار
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      let errorMessage = "حدث خطأ في التوليد التلقائي";
      
      if (response.status === 401) {
        errorMessage = "مفتاح OpenAI API غير صحيح أو منتهي الصلاحية";
      } else if (response.status === 429) {
        errorMessage = "تم تجاوز حد الاستخدام المسموح، يرجى المحاولة لاحقاً";
      } else if (response.status === 400) {
        errorMessage = "خطأ في معاملات الطلب المرسل";
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorText.substring(0, 200) + "...",
          status: response.status
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    console.log("📥 استجابة OpenAI:", {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      messageContent: data.choices?.[0]?.message?.content?.substring(0, 500) + "...",
      usage: data.usage,
      timestamp: new Date().toISOString()
    });
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid OpenAI response structure:", data);
      return NextResponse.json(
        { error: "استجابة غير صحيحة من خدمة الذكاء الاصطناعي" },
        { status: 500 }
      );
    }

    let result;
    try {
      const rawContent = data.choices[0].message.content;
      console.log("🔍 محتوى خام من OpenAI:", rawContent);
      
      // محاولة تحليل JSON مباشرة
      result = JSON.parse(rawContent);
      
      // التحقق من وجود الحقول المطلوبة
      if (!result.title && !result.excerpt) {
        throw new Error("JSON صحيح لكن لا يحتوي على الحقول المطلوبة");
      }
      
      console.log("✅ تم تحليل JSON بنجاح:", result);
      
    } catch (parseError) {
      console.error("❌ خطأ في تحليل JSON من OpenAI:", {
        error: parseError,
        content: data.choices[0].message.content.substring(0, 500)
      });
      
      // محاولة استخراج المعلومات يدوياً من النص
      const content = data.choices[0].message.content;
      
      // محاولة العثور على JSON مدفون في النص
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          console.log("✅ تم استخراج JSON من النص بنجاح:", result);
        } catch (nestedError) {
          console.log("⚠️ فشل في استخراج JSON، سيتم الاستخراج اليدوي");
          result = {
            title: extractField(content, "title", "العنوان"),
            subtitle: extractField(content, "subtitle", "العنوان الفرعي"),
            excerpt: extractField(content, "excerpt", "الموجز"),
            keywords: extractKeywords(content)
          };
        }
      } else {
        console.log("⚠️ لم يتم العثور على JSON، سيتم الاستخراج اليدوي");
        result = {
          title: extractField(content, "title", "العنوان"),
          subtitle: extractField(content, "subtitle", "العنوان الفرعي"),
          excerpt: extractField(content, "excerpt", "الموجز"),
          keywords: extractKeywords(content)
        };
      }
    }

    const finalResult = {
      title: result.title || "",
      subtitle: result.subtitle || "",
      excerpt: result.excerpt || "",
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
    };

    // التحقق من جودة النتائج
    if (!finalResult.title || finalResult.title.length < 10) {
      console.warn("⚠️ العنوان قصير جداً أو فارغ:", finalResult.title);
    }
    
    if (!finalResult.excerpt || finalResult.excerpt.length < 50) {
      console.warn("⚠️ الموجز قصير جداً أو فارغ:", finalResult.excerpt);
    }
    
    if (finalResult.keywords.length === 0) {
      console.warn("⚠️ لا توجد كلمات مفتاحية");
    }

    // إضافة تحذير إذا كانت النتائج لا تبدو متصلة بالمحتوى
    const originalWords = contentString.toLowerCase().split(/\s+/).slice(0, 10);
    const titleWords = finalResult.title.toLowerCase().split(/\s+/);
    const hasCommonWords = originalWords.some((word: string) => 
      word.length > 3 && titleWords.some((titleWord: string) => titleWord.includes(word) || word.includes(titleWord))
    );
    
    if (!hasCommonWords && contentString.length > 100) {
      console.warn("⚠️ العنوان قد لا يكون متصلاً بالمحتوى الأصلي");
    }

    console.log("✅ نتيجة نهائية:", {
      titleLength: finalResult.title.length,
      subtitleLength: finalResult.subtitle.length,
      excerptLength: finalResult.excerpt.length,
      keywordsCount: finalResult.keywords.length,
      result: finalResult,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(finalResult);

  } catch (error) {
    console.error("خطأ في توليد المحتوى:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
