import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Palette, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabaseClient.js';
import ProtectedRoute from '../components/ProtectedRoute';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const SettingsContent: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, hideToast } = useToast();

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setDisplayName(user.user_metadata?.display_name || '');
    }
  }, [user]);

  // Clear success states after delay
  useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => setProfileSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess]);

  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => setPasswordSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);

    try {
      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });

        if (emailError) {
          throw emailError;
        }
      }

      // Update display name
      const { error: profileError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
        }
      });

      if (profileError) {
        throw profileError;
      }

      setProfileSuccess(true);
      showToast('Profile updated successfully!', 'success');

    } catch (error: any) {
      console.error('Profile update error:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      showToast('Password updated successfully!', 'success');

    } catch (error: any) {
      console.error('Password update error:', error);
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="space-y-8">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize how MindDump looks</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your personal details</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                {profileSuccess && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Profile updated successfully!</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="ml-auto flex items-center space-x-2 bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>{isUpdatingProfile ? 'Updating...' : 'Update Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                {passwordSuccess && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Password updated successfully!</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                  className="ml-auto flex items-center space-x-2 bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

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

const Settings: React.FC = () => {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
};

export default Settings;