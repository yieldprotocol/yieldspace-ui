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
  };

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? DARK : LIGHT);
  }, []);

  return { theme, toggleTheme };
};
