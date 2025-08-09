import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, Users, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Calendar, roles: ['STUDENT', 'EVENT_MANAGER', 'ADMIN'] },
    { name: 'Events', path: '/events', icon: Calendar, roles: ['STUDENT', 'EVENT_MANAGER', 'ADMIN'] },
    { name: 'Dashboard', path: user?.role === 'ADMIN' ? '/admin-dashboard' : '/student-dashboard', icon: BarChart3, roles: ['STUDENT', 'ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-colors duration-200 dark:bg-gray-900/95 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="p-2 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors duration-200 dark:bg-primary-900/30 dark:group-hover:bg-primary-900/50">
                  <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  EventHub
                </span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`
                      inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Theme toggle, User info, Logout */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Info */}
            {user && (
              <Link
                to="/profile"
                className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 cursor-pointer"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.role}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Link>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50 dark:focus:ring-offset-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <ThemeToggle />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200 dark:hover:text-gray-300 dark:hover:bg-gray-800"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg dark:border-gray-800 dark:bg-gray-900/95">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User info and logout in mobile */}
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
              <Link
                to="/profile"
                className="flex items-center px-5 py-3 bg-gray-50 mx-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 dark:bg-gray-800/50 dark:hover:bg-gray-800/70"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                    {user.role}
                  </div>
                </div>
              </Link>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;