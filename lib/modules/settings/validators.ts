/**
 * نظام التحقق من صحة الإعدادات
 * Settings Validation System
 */

import { ValidationRules } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * التحقق من صحة قيمة الإعداد
 * Validate setting value
 */
export async function validateSettingValue(
  value: any, 
  rules?: ValidationRules
): Promise<ValidationResult> {
  const errors: string[] = [];
  
  if (!rules) {
    return { valid: true, errors: [] };
  }

  // التحقق من الإجبارية
  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push('هذا الحقل مطلوب');
    return { valid: false, errors };
  }

  // إذا كانت القيمة فارغة وليست مطلوبة، فهي صالحة
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return { valid: true, errors: [] };
  }

  // التحقق من النوع النصي
  if (typeof value === 'string') {
    // الحد الأدنى للطول
    if (rules.min_length && value.length < rules.min_length) {
      errors.push(`الحد الأدنى للطول هو ${rules.min_length} أحرف`);
    }

    // الحد الأقصى للطول
    if (rules.max_length && value.length > rules.max_length) {
      errors.push(`الحد الأقصى للطول هو ${rules.max_length} أحرف`);
    }

    // التحقق من النمط
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors.push('تنسيق القيمة غير صحيح');
      }
    }

    // التحقق من القيم المسموحة
    if (rules.enum_values && !rules.enum_values.includes(value)) {
      errors.push(`القيمة يجب أن تكون واحدة من: ${rules.enum_values.join(', ')}`);
    }
  }

  // التحقق من النوع الرقمي
  if (typeof value === 'number' && rules.numeric_range) {
    if (value < rules.numeric_range.min) {
      errors.push(`القيمة يجب أن تكون أكبر من أو تساوي ${rules.numeric_range.min}`);
    }
    if (value > rules.numeric_range.max) {
      errors.push(`القيمة يجب أن تكون أقل من أو تساوي ${rules.numeric_range.max}`);
    }
  }

  // التحقق المخصص
  if (rules.custom_validator) {
    try {
      const customValidation = await executeCustomValidator(rules.custom_validator, value);
      if (!customValidation.valid) {
        errors.push(...customValidation.errors);
      }
    } catch (error) {
      errors.push('خطأ في التحقق المخصص');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * تنفيذ تحقق مخصص
 * Execute custom validator
 */
async function executeCustomValidator(validator: string, value: any): Promise<ValidationResult> {
  try {
    // يمكن تنفيذ نظام تحقق مخصص متقدم هنا
    // مثل تشغيل JavaScript أو استدعاء API خارجي
    
    switch (validator) {
      case 'email':
        return validateEmail(value);
      case 'url':
        return validateURL(value);
      case 'color':
        return validateColor(value);
      case 'json':
        return validateJSON(value);
      default:
        return { valid: true, errors: [] };
    }
  } catch (error) {
    return { valid: false, errors: ['خطأ في التحقق المخصص'] };
  }
}

/**
 * التحقق من البريد الإلكتروني
 * Validate email format
 */
function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: emailRegex.test(email),
    errors: emailRegex.test(email) ? [] : ['تنسيق البريد الإلكتروني غير صحيح']
  };
}

/**
 * التحقق من الرابط
 * Validate URL format
 */
function validateURL(url: string): ValidationResult {
  try {
    new URL(url);
    return { valid: true, errors: [] };
  } catch {
    return { valid: false, errors: ['تنسيق الرابط غير صحيح'] };
  }
}

/**
 * التحقق من اللون
 * Validate color format (hex, rgb, etc.)
 */
function validateColor(color: string): ValidationResult {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
  return {
    valid: colorRegex.test(color),
    errors: colorRegex.test(color) ? [] : ['تنسيق اللون غير صحيح']
  };
}

/**
 * التحقق من JSON
 * Validate JSON format
 */
function validateJSON(jsonString: string): ValidationResult {
  try {
    JSON.parse(jsonString);
    return { valid: true, errors: [] };
  } catch {
    return { valid: false, errors: ['تنسيق JSON غير صحيح'] };
  }
}

/**
 * التحقق من المصفوفة
 * Validate array
 */
export function validateArray(value: any, rules?: { min_items?: number; max_items?: number; item_type?: string }): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(value)) {
    return { valid: false, errors: ['القيمة يجب أن تكون مصفوفة'] };
  }

  if (rules?.min_items && value.length < rules.min_items) {
    errors.push(`الحد الأدنى لعدد العناصر هو ${rules.min_items}`);
  }

  if (rules?.max_items && value.length > rules.max_items) {
    errors.push(`الحد الأقصى لعدد العناصر هو ${rules.max_items}`);
  }

  if (rules?.item_type) {
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] !== rules.item_type) {
        errors.push(`العنصر ${i + 1} يجب أن يكون من نوع ${rules.item_type}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * التحقق من القيمة المنطقية
 * Validate boolean
 */
export function validateBoolean(value: any): ValidationResult {
  if (typeof value === 'boolean') {
    return { valid: true, errors: [] };
  }

  // قبول النصوص المحولة
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'].includes(lowerValue)) {
      return { valid: true, errors: [] };
    }
  }

  // قبول الأرقام
  if (typeof value === 'number' && (value === 0 || value === 1)) {
    return { valid: true, errors: [] };
  }

  return { valid: false, errors: ['القيمة يجب أن تكون منطقية (true/false)'] };
}

/**
 * التحقق من التاريخ
 * Validate date
 */
export function validateDate(value: any): ValidationResult {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return { valid: true, errors: [] };
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return { valid: true, errors: [] };
    }
  }

  return { valid: false, errors: ['تنسيق التاريخ غير صحيح'] };
}
