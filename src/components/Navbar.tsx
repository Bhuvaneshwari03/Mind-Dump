import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Menu, X, LogOut, User, LayoutDashboard, Target, BarChart3, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-lavender-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">MindDump</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                    isActive('/dashboard') 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/focus" 
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                    isActive('/focus') 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  <span>Focus Mode</span>
                </Link>
                <Link 
                  to="/insights" 
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                    isActive('/insights') 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Weekly Insights</span>
                </Link>
              </>
            )}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4" />
                
                </div>
                <Link
                  to="/settings"
                  className={`p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isActive('/settings') ? 'text-primary-600 dark:text-primary-400' : ''
                  }`}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                      isActive('/dashboard') 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/focus" 
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                      isActive('/focus') 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Target className="h-4 w-4" />
                    <span>Focus Mode</span>
                  </Link>
                  <Link 
                    to="/insights" 
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                      isActive('/insights') 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Weekly Insights</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                      isActive('/settings') 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </>
              )}
              
              {user ? (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;