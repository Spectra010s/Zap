import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button 
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-icon">
        {isDark ? <FaSun /> : <FaMoon />}
      </span>
      <span className="theme-toggle-text">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
