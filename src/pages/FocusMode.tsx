import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Settings, Maximize, Minimize, Target, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

interface Thought {
  id: string;
  content: string;
  category: string;
  status: 'pending' | 'done' | 'archived' | 'thought';
  created_at: string;
  user_id: string;
}

const FocusModeContent: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Sound states
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('minddump-pomodoro-muted');
    return saved === 'true';
  });

  const { toast, showToast, hideToast } = useToast();
  const { user } = useAuth();

  const currentThought = thoughts[currentIndex] || null;

  // Create notification sound
  const playNotificationSound = () => {
    if (isMuted) return;

    try {
      // Create a pleasant notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a sequence of pleasant tones
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        // Smooth envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play a pleasant chord progression
      const now = audioContext.currentTime;
      playTone(523.25, now, 0.3); // C5
      playTone(659.25, now + 0.1, 0.3); // E5
      playTone(783.99, now + 0.2, 0.4); // G5
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
      
      // Fallback: try to use a simple beep
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Silent fail if audio can't play
        });
      } catch (fallbackError) {
        // Silent fail
      }
    }
  };

  // Toggle mute state
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('minddump-pomodoro-muted', newMutedState.toString());
    
    if (!newMutedState) {
      // Play a quick test sound when unmuting
      setTimeout(() => {
        playNotificationSound();
      }, 100);
    }
  };

  // Fetch pending thoughts (excluding random category and thoughts)
  const fetchPendingThoughts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .neq('category', 'random') // Exclude random thoughts
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setThoughts(data || []);
      setCurrentIndex(0); // Reset to first thought
    } catch (err) {
      console.error('Error fetching pending thoughts:', err);
      setError('Failed to load pending thoughts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to previous thought
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetTimer();
    }
  };

  // Navigate to next thought
  const goToNext = () => {
    if (currentIndex < thoughts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetTimer();
    }
  };

  // Mark current thought as done and move to next
  const markThoughtAsDone = async () => {
    if (!currentThought || !user) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('thoughts')
        .update({ status: 'done' })
        .eq('id', currentThought.id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      showToast('Thought marked as done! 🎉', 'success');
      
      // Remove the completed thought from the list
      const updatedThoughts = thoughts.filter(t => t.id !== currentThought.id);
      setThoughts(updatedThoughts);
      
      // Adjust current index if necessary
      if (currentIndex >= updatedThoughts.length && updatedThoughts.length > 0) {
        setCurrentIndex(updatedThoughts.length - 1);
      } else if (updatedThoughts.length === 0) {
        setCurrentIndex(0);
      }
      
      resetTimer();
    } catch (err) {
      console.error('Error updating thought:', err);
      showToast('Failed to update thought status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished - play notification sound
      playNotificationSound();
      setIsRunning(false);
      
      if (isBreak) {
        showToast('Break time is over! Ready to focus?', 'success');
        setIsBreak(false);
        setTimeLeft(workDuration * 60);
      } else {
        showToast('Work session complete! Time for a break.', 'success');
        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workDuration, breakDuration, isMuted]);

  // Load pending thoughts on component mount
  useEffect(() => {
    if (user) {
      fetchPendingThoughts();
    }
  }, [user]);

  // Timer controls
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update timer settings
  const updateTimerSettings = () => {
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    setIsRunning(false);
    setShowSettings(false);
    showToast('Timer settings updated!', 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your focus session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 dark:text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchPendingThoughts}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-lavender-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Timer Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={updateTimerSettings}
                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="h-8 w-8 text-primary-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Focus Mode</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {isBreak ? 'Take a break and recharge' : 'Focus on one thought at a time'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
            title="Timer Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isMuted 
                ? 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>

        {/* Main Focus Area */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mb-8 text-center">
          {/* Timer */}
          <div className="mb-8">
            <div className={`text-6xl md:text-8xl font-mono font-bold mb-4 transition-colors duration-300 ${
              isBreak ? 'text-green-500' : 'text-primary-500'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {isBreak ? '☕ Break Time' : '🎯 Focus Time'}
            </p>
            
            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                  isBreak 
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                <span>{isRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center space-x-2 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Current Thought */}
          {!isBreak && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              {currentThought ? (
                <div className="animate-fade-in">
                  {/* Task Navigation */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <button
                      onClick={goToPrevious}
                      disabled={currentIndex === 0}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300">
                          {currentThought.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Task {currentIndex + 1} of {thoughts.length}
                      </p>
                    </div>
                    
                    <button
                      onClick={goToNext}
                      disabled={currentIndex === thoughts.length - 1}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                    {currentThought.content}
                  </p>
                  
                  <button
                    onClick={markThoughtAsDone}
                    disabled={isUpdating}
                    className="flex items-center space-x-2 bg-green-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mx-auto"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>{isUpdating ? 'Updating...' : 'Mark as Done'}</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    No pending tasks to focus on right now. Great job staying on top of things!
                  </p>
                  <button
                    onClick={fetchPendingThoughts}
                    className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200"
                  >
                    Check for New Tasks
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Break Message */}
          {isBreak && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">☕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Break Time!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take a moment to stretch, hydrate, or just breathe. You've earned it!
              </p>
            </div>
          )}
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

const FocusMode: React.FC = () => {
  return (
    <ProtectedRoute>
      <FocusModeContent />
    </ProtectedRoute>
  );
};

export default FocusMode;