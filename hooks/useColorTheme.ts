import { useEffect, useState } from 'react';

export const useColorTheme = () => {
  const [theme, setTheme] = useState<string>(localStorage.theme || 'dark');

  const toggleTheme = () => {
    // Whenever the user explicitly chooses light mode
    if (theme === 'dark') {
      // Whenever the user explicitly chooses light mode
      localStorage.theme = 'light';
      document.documentElement.classList.remove('dark');
      setTheme('light');
    } else {
      localStorage.theme = 'dark';
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }

    // // Whenever the user explicitly chooses to respect the OS preference
    // localStorage.removeItem('theme');
  };

  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  return { theme, toggleTheme };
};
