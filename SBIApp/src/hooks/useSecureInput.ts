import { useState, useCallback } from 'react';
import { SecurityUtils } from '../utils/securityUtils';

export const useSecureInput = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const handleChange = useCallback((text: string, validationType?: 'email' | 'password' | 'phone' | 'amount') => {
    const sanitized = SecurityUtils.sanitizeInput(text);
    setValue(sanitized);

    if (SecurityUtils.hasSQLInjectionPattern(sanitized) || SecurityUtils.hasXSSPattern(sanitized)) {
      setError('Invalid characters detected');
      setIsValid(false);
      return;
    }

    if (validationType === 'email') {
      const valid = SecurityUtils.validateEmail(sanitized);
      setError(valid ? null : 'Invalid email format');
      setIsValid(valid);
    } else if (validationType === 'password') {
      const result = SecurityUtils.validatePassword(sanitized);
      setError(result.valid ? null : result.message);
      setIsValid(result.valid);
    } else if (validationType === 'phone') {
      const valid = SecurityUtils.validatePhone(sanitized);
      setError(valid ? null : 'Invalid phone number');
      setIsValid(valid);
    } else if (validationType === 'amount') {
      const num = parseFloat(sanitized);
      const valid = SecurityUtils.validateAmount(num);
      setError(valid ? null : 'Invalid amount');
      setIsValid(valid);
    } else {
      setError(null);
      setIsValid(true);
    }
  }, []);

  const reset = useCallback(() => {
    setValue('');
    setError(null);
    setIsValid(true);
  }, []);

  return { value, error, isValid, onChange: handleChange, reset, setValue };
};