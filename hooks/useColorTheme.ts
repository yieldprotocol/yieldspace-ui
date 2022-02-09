import { useEffect, useState } from 'react';

const LIGHT = 'light';
const DARK = 'dark';

export const useColorTheme = () => {
  const [theme, setTheme] = useState<string>(localStorage.theme || DARK);

  const toggleTheme = () => {
    // Whenever the user explicitly chooses light mode
    if (theme === DARK) {
      // Whenever the user explicitly chooses light mode
      localStorage.theme = LIGHT;
      document.documentElement.classList.remove(DARK);
      setTheme(LIGHT);
    } else {
      localStorage.theme = DARK;
      document.documentElement.classList.add(DARK);
      setTheme(DARK);
    }

    // // Whenever the user explicitly chooses to respect the OS preference
    // localStorage.removeItem('theme');
  };

  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.theme === DARK ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add(DARK);
      setTheme(DARK);
    } else {
      document.documentElement.classList.remove(DARK);
      setTheme(LIGHT);
    }
  }, []);

  return { theme, toggleTheme };
};
