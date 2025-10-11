import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Tagline */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-lavender-500 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                MindDump
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                From Chaos to Clarity
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/about" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              About
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link 
              to="/settings" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              Settings
            </Link>
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <span>© 2025 MindDump. All rights reserved.</span>
          </div>
        </div>

        {/* Mobile Copyright */}
        <div className="md:hidden text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Made with care for organizing minds everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;