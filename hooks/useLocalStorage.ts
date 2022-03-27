import { useState, useEffect } from 'react';

const getStorageValue = (key: string, defaultValue: string, account?: string) =>
  typeof window !== 'undefined' && (JSON.parse(localStorage.getItem(key)!) || defaultValue);

export const useLocalStorage = (key: string, defaultValue: string) => {
  const [value, setValue] = useState(() => getStorageValue(key, defaultValue));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
