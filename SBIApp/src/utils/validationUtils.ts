export const ValidationUtils = {
  isRequired: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  minLength: (value: string, min: number): boolean => value.length >= min,
  maxLength: (value: string, max: number): boolean => value.length <= max,
  isNumeric: (value: string): boolean => /^\d+$/.test(value),
  isDecimal: (value: string): boolean => /^\d+(\.\d{1,2})?$/.test(value),
  isValidUrl: (url: string): boolean => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url),
};