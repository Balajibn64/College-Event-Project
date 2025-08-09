import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 dark:hover:border-gray-600 dark:focus:ring-offset-gray-900"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative">
        {theme === 'light' ? (
          <Moon className="h-5 w-5 transition-transform duration-200 rotate-0 scale-100" />
        ) : (
          <Sun className="h-5 w-5 transition-transform duration-200 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;