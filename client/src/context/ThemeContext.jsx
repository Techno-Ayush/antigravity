import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('skillcycle-theme') || 'light';
  });

  const getSystemTheme = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    return theme === 'system' ? getSystemTheme() : theme;
  });

  useEffect(() => {
    const handleSystemChange = () => {
      if (theme === 'system') {
        const sys = getSystemTheme();
        setResolvedTheme(sys);
        document.documentElement.setAttribute('data-theme', sys);
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemChange);

    const active = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(active);
    document.documentElement.setAttribute('data-theme', active);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('skillcycle-theme', newTheme);
    const active = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(active);
    document.documentElement.setAttribute('data-theme', active);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
