import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

export const useAutoSave = <T>(data: T, onSave: (data: T) => Promise<void>, delay: number = 2000) => {
  const debouncedData = useDebounce(data, delay);
  const isSaving = useRef(false);

  useEffect(() => {
    const saveData = async () => {
      if (isSaving.current) return;
      isSaving.current = true;
      try {
        await onSave(debouncedData);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        isSaving.current = false;
      }
    };
    saveData();
  }, [debouncedData, onSave]);

  return { isSaving: isSaving.current };
};