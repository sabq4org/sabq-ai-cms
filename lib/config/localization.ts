/**
 * إعدادات التوطين - التحكم في عرض التواريخ والأرقام
 * Localization Settings - Control date and number display
 */

export const LOCALIZATION_CONFIG = {
  // إعدادات التواريخ - Date Settings
  DATE_FORMAT: {
    USE_GREGORIAN: true, // استخدام التقويم الميلادي
    USE_WESTERN_NUMERALS: true, // استخدام الأرقام الغربية
    DEFAULT_LOCALE: "ar-SA", // النظام المحلي الافتراضي
    WESTERN_LOCALE: "en-US", // النظام المحلي للأرقام الغربية
  },

  // إعدادات الأرقام - Number Settings
  NUMBERS: {
    USE_WESTERN_NUMERALS: true, // استخدام الأرقام الغربية (1234567890)
    THOUSAND_SEPARATOR: true, // فاصل الآلاف
    WESTERN_LOCALE: "en-US", // النظام المحلي للأرقام الغربية
  },

  // تنسيقات التاريخ المختلفة - Different Date Formats
  FORMATS: {
    FULL_DATE: "dd/MM/yyyy", // التاريخ الكامل
    SHORT_DATE: "dd/MM/yyyy", // التاريخ المختصر
    MONTH_YEAR: "MM/yyyy", // الشهر والسنة
    TIME_12H: "hh:mm a", // الوقت 12 ساعة
    TIME_24H: "HH:mm", // الوقت 24 ساعة
    DATETIME_FULL: "dd/MM/yyyy HH:mm", // التاريخ والوقت الكامل
  },
};

/**
 * تحويل الأرقام العربية الشرقية إلى غربية
 * Convert Eastern Arabic numerals to Western numerals
 */
export function convertToWesternNumerals(text: string | number): string {
  if (typeof text === "number") {
    return text.toString();
  }

  if (!LOCALIZATION_CONFIG.NUMBERS.USE_WESTERN_NUMERALS) {
    return text;
  }

  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const westernNumerals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let convertedText = text;

  arabicNumerals.forEach((arabicNum, index) => {
    const regex = new RegExp(arabicNum, "g");
    convertedText = convertedText.replace(regex, westernNumerals[index]);
  });

  return convertedText;
}

/**
 * تنسيق الأرقام للعرض
 * Format numbers for display
 */
export function formatNumber(
  value: number | string,
  options?: {
    useThousandSeparator?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0";
  }

  const {
    useThousandSeparator = LOCALIZATION_CONFIG.NUMBERS.THOUSAND_SEPARATOR,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options || {};

  let formattedNumber: string;

  if (LOCALIZATION_CONFIG.NUMBERS.USE_WESTERN_NUMERALS) {
    formattedNumber = numValue.toLocaleString(
      LOCALIZATION_CONFIG.NUMBERS.WESTERN_LOCALE,
      {
        useGrouping: useThousandSeparator,
        minimumFractionDigits,
        maximumFractionDigits,
      }
    );
  } else {
    formattedNumber = numValue.toLocaleString("ar-SA", {
      useGrouping: useThousandSeparator,
      minimumFractionDigits,
      maximumFractionDigits,
    });
  }

  return formattedNumber;
}

/**
 * تنسيق الأرقام الكبيرة (ك، م)
 * Format large numbers with K, M abbreviations
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return formatNumber(value / 1000000, { maximumFractionDigits: 1 }) + "م";
  } else if (value >= 1000) {
    return formatNumber(value / 1000, { maximumFractionDigits: 1 }) + "ك";
  }
  return formatNumber(value);
}

/**
 * تحقق من صحة القيم العددية
 * Validate numeric values
 */
export function isValidNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
