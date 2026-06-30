import { useState, useCallback } from 'react';

interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

export const useFormValidation = <T extends Record<string, any>>(initialValues: T, rules: ValidationRules) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback((name: keyof T, value: any) => {
    const fieldRules = rules[name as string];
    if (!fieldRules) return true;
    
    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        setErrors(prev => ({ ...prev, [name]: rule.message }));
        return false;
      }
    }
    setErrors(prev => ({ ...prev, [name]: undefined }));
    return true;
  }, [rules]);

  const validateForm = useCallback(() => {
    let isValid = true;
    Object.keys(values).forEach(key => {
      if (!validateField(key as keyof T, values[key as keyof T])) {
        isValid = false;
      }
    });
    return isValid;
  }, [values, validateField]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  }, [values, validateField]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValid: Object.values(errors).every(e => !e),
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm,
    resetForm,
  };
};