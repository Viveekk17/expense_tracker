import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      type="button"
      tabIndex={0}
      className={`relative flex items-center w-24 h-11 bg-gray-200 dark:bg-gray-900 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner border-0`}
      style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', border: 'none' }}
    >
      {/* Sliding Knob (behind icons) */}
      <span
        className={`absolute top-1/2 left-1 transition-transform duration-300 ease-in-out w-9 h-9 rounded-full shadow-md ${isDark ? 'translate-x-12 bg-gray-800' : 'translate-x-0 bg-yellow-400/90'}`}
        style={{ transform: `translateY(-50%) ${isDark ? 'translateX(48px)' : 'translateX(0)'}`, zIndex: 1 }}
      />
      {/* Sun Icon */}
      <span className="flex-1 flex justify-center z-10">
        <Sun className={`h-6 w-6 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-yellow-500'}`} />
      </span>
      {/* Moon Icon */}
      <span className="flex-1 flex justify-center z-10">
        <Moon className={`h-6 w-6 transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-gray-400'}`} />
      </span>
    </button>
  );
}; 