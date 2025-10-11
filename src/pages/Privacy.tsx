import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: January 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              At MindDump, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              and protect your personal information when you use our service. We believe in transparency and 
              want you to understand exactly how your data is handled.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Account Information</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  When you create an account, we collect your email address and any optional profile information 
                  you choose to provide, such as your display name.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Thought Data</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We store the thoughts, ideas, and notes you choose to save in MindDump. This content is 
                  encrypted and only accessible to you.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Usage Information</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We collect basic usage statistics to improve our service, such as feature usage patterns 
                  and performance metrics. This data is anonymized and aggregated.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <UserCheck className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
            </div>
            
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>To provide and maintain the MindDump service</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>To categorize your thoughts using AI (processing happens securely)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>To generate insights and analytics about your thinking patterns</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>To communicate with you about service updates or support</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>To improve our service based on usage patterns</span>
              </li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Security</h2>
            </div>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• All data is encrypted in transit and at rest</li>
                <li>• We use secure authentication protocols</li>
                <li>• Regular security audits and updates</li>
                <li>• Limited access to your data on a need-to-know basis</li>
                <li>• Secure cloud infrastructure with Supabase</li>
              </ul>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Sharing</h2>
            </div>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white">
                We do not sell, trade, or rent your personal information to third parties.
              </p>
              <p>
                We may share your information only in the following limited circumstances:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• With your explicit consent</li>
                <li>• To comply with legal obligations</li>
                <li>• To protect our rights and prevent fraud</li>
                <li>• With service providers who help us operate MindDump (under strict confidentiality agreements)</li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <UserCheck className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Rights</h2>
            </div>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>You have the right to:</p>
              <ul className="space-y-2 ml-4">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate information</li>
                <li>• Delete your account and data</li>
                <li>• Export your data</li>
                <li>• Opt out of certain communications</li>
                <li>• Request information about how your data is processed</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us through the settings page or email us directly.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-primary-500 to-lavender-500 rounded-2xl p-8 text-white text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-2xl font-semibold">Questions About Privacy?</h2>
            </div>
            <p className="text-primary-100 mb-6">
              If you have any questions about this Privacy Policy or how we handle your data, 
              we're here to help.
            </p>
            <div className="space-y-2">
              <p className="font-medium">Contact us:</p>
              <p className="text-primary-100">privacy@minddump.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;