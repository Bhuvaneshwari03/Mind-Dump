import React from 'react';
import { Brain, Target, BarChart3, Users, Heart, Lightbulb } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-lavender-500 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">About MindDump</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Transforming mental chaos into organized clarity, one thought at a time.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Heart className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Mission</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            We believe that everyone deserves a clear, organized mind. MindDump was created to help you capture 
            fleeting thoughts, transform mental clutter into actionable insights, and achieve the clarity you need 
            to focus on what truly matters.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Organization</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Our intelligent system automatically categorizes your thoughts, saving you time and mental energy.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Focus Mode</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Built-in Pomodoro timer helps you tackle one thought at a time with maximum productivity.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Insightful Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your progress and discover patterns in your thinking with detailed weekly insights.
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">The Story Behind MindDump</h2>
          </div>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              MindDump was born from a simple observation: our minds are constantly generating thoughts, ideas, 
              and reminders, but we often struggle to capture and organize them effectively. Traditional note-taking 
              apps felt too rigid, while simple text files became chaotic over time.
            </p>
            <p>
              We envisioned a solution that would be as natural as thinking itself – a place where you could 
              simply "dump" whatever was on your mind, knowing that intelligent systems would help organize 
              and make sense of it all. The result is MindDump: a thoughtful blend of simplicity and intelligence.
            </p>
            <p>
              Today, MindDump helps thousands of people transform their mental chaos into organized clarity, 
              enabling them to focus on what truly matters and achieve their goals with greater ease.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-gradient-to-r from-primary-500 to-lavender-500 rounded-2xl p-8 text-white text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div>
              <h3 className="font-semibold mb-2">Simplicity</h3>
              <p className="text-primary-100 text-sm">
                We believe the best tools are the ones that get out of your way and let you focus on what matters.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Privacy</h3>
              <p className="text-primary-100 text-sm">
                Your thoughts are personal. We use industry-standard security to keep your data safe and private.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Growth</h3>
              <p className="text-primary-100 text-sm">
                We're committed to helping you grow by providing insights that help you understand your thinking patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;