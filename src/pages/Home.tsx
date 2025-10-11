import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Target,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThoughtInput from '../components/ThoughtInput';
import AuthModal from '../components/AuthModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import AnimatedOrganized from '../components/AnimatedOrganized';

const Home: React.FC = () => {
  const { toast, showToast, hideToast } = useToast();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');

  const handleThoughtSubmit = (thought: string) => {
    console.log('New thought submitted:', thought);
    showToast('Thought dumped successfully!', 'success');
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-lavender-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Mind,
            <AnimatedOrganized />
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Dump random thoughts, let AI categorize them automatically, and
            transform mental chaos into organized insights.
          </p>
        </div>

        {/* Auth Buttons for Non-Authenticated Users */}
        {!user && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => handleAuthClick('signup')}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-lavender-500 text-white px-8 py-3 rounded-xl font-medium hover:from-primary-600 hover:to-lavender-600 transition-all duration-200 transform hover:scale-105"
            >
              <UserPlus className="h-5 w-5" />
              <span>Get Started Free</span>
            </button>
            <button
              onClick={() => handleAuthClick('login')}
              className="flex items-center space-x-2 border-2 border-primary-500 text-primary-600 dark:text-primary-400 px-8 py-3 rounded-xl font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Thought Input Section */}
        <div className="max-w-4xl mx-auto mb-20 animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {user ? 'Start Your Mind Dump' : 'Try It Out'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user
                ? 'Think it, Dump it, Forget it, We got it.'
                : 'See how it works - sign in to save your thoughts!'}
            </p>
          </div>
          <ThoughtInput onSubmit={handleThoughtSubmit} />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Organize and manage all your thoughts with smart filtering and
              categorization
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
            <div className="w-12 h-12 bg-gradient-to-br from-mint-500 to-mint-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Focus Mode
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Work on one thought at a time with built-in Pomodoro timer for
              maximum productivity
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
            <div className="w-12 h-12 bg-gradient-to-br from-lavender-500 to-lavender-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Weekly Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your progress and discover patterns in your thinking with
              detailed analytics
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary-500 to-lavender-500 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to organize your mind?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Start dumping your thoughts and see the magic happen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                >
                  View Dashboard
                </Link>
                <button
                  onClick={() => document.querySelector('textarea')?.focus()}
                  className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
                >
                  Start Dumping
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleAuthClick('signup')}
                  className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => handleAuthClick('login')}
                  className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default Home;