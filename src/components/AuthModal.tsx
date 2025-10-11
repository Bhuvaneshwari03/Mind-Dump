import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signUp, signIn, resetPassword } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRememberMe(false);
    setShowPassword(false);
    setError(null);
    setSuccess(null);
  };

  const handleModeChange = (newMode: 'login' | 'signup' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }

        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created!');
        }
      } else if (mode === 'login') {
        const { error } = await signIn(email, password, rememberMe);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Password reset email sent! Check your inbox.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
            <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password (not shown for reset mode) */}
          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (only for signup) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Remember Me (only for login) */}
          {mode === 'login' && (
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me for 7 days
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-lavender-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-lavender-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>
                  {mode === 'login' && 'Signing In...'}
                  {mode === 'signup' && 'Creating Account...'}
                  {mode === 'reset' && 'Sending Email...'}
                </span>
              </div>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Send Reset Email'}
              </>
            )}
          </button>
        </form>

        {/* Mode Switching */}
        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => handleModeChange('signup')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </button>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Forgot your password?{' '}
                <button
                  onClick={() => handleModeChange('reset')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Reset it
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => handleModeChange('login')}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <button
                onClick={() => handleModeChange('login')}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;