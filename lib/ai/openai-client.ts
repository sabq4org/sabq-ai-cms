import OpenAI from 'openai';

// Shared OpenAI client instance
let openai: OpenAI | null = null;

/**
 * Get OpenAI client instance
 * Returns null if API key is not available to avoid build-time errors
 */
export function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return openai;
}

/**
 * Check if OpenAI is configured and available
 */
export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Standard error response for missing OpenAI configuration
 */
export const OPENAI_ERROR_RESPONSE = {
  success: false,
  error: 'خدمة الذكاء الاصطناعي غير متوفرة',
  details: 'مفتاح OpenAI API غير مُهيأ',
  code: 'OPENAI_NOT_CONFIGURED'
};
