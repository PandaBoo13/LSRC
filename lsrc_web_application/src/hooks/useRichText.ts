// src/hooks/useRichText.ts
import { useState, useCallback } from 'react';

export const useRichText = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const reset = useCallback(() => {
    setValue('');
  }, []);

  const setContent = useCallback((content: string) => {
    setValue(content);
  }, []);

  return {
    value,
    onChange,
    reset,
    setContent,
    isEmpty: !value || value === '<p><br></p>',
  };
};

export default useRichText;