// src/hooks/useTheme.ts
import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  // 1. بنقرا الثيم المحفوظ من الـ localStorage، ولو مفيش بنخليه light ديفولت
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  // 2. أول ما الثيم يتغير، بنضيف أو نشيل كلاس dark من الـ html ونحفظ الاختيار
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. دالة سريعة لتبديل الثيم
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme, setTheme };
}