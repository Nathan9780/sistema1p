import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [customWallpaper, setCustomWallpaper] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedWallpaper = localStorage.getItem('customWallpaper');
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      applyTheme(savedTheme === 'dark');
    }
    
    if (savedWallpaper) {
      setCustomWallpaper(savedWallpaper);
      document.body.style.backgroundImage = `url(${savedWallpaper})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }
  }, []);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    } else {
      document.body.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#f5f5f5';
      document.body.style.color = '#111111';
    }
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    applyTheme(newMode);
  };

  const changeWallpaper = (imageUrl) => {
    setCustomWallpaper(imageUrl);
    localStorage.setItem('customWallpaper', imageUrl);
    document.body.style.backgroundImage = `url(${imageUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  };

  const removeWallpaper = () => {
    setCustomWallpaper(null);
    localStorage.removeItem('customWallpaper');
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundAttachment = '';
  };

  const themes = {
    flores: { name: '🌸 Flores', url: 'https://images.unsplash.com/photo-1490750967868-88aa4476b946?w=1920' },
    natureza: { name: '🌄 Natureza', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920' },
    cidade: { name: '🌆 Cidade', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920' },
    espaco: { name: '🌌 Espaço', url: 'https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=1920' }
  };

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleTheme, 
      customWallpaper, 
      changeWallpaper, 
      removeWallpaper, 
      themes 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};