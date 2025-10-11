import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Brain,
  AlertCircle,
  Tag,
  Lock,
  LayoutDashboard,
  Target,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.js';
import { categorizeThoughtWithGemini } from '../utils/geminiApi.js';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface ThoughtInputProps {
  onSubmit?: (thought: string) => void;
  placeholder?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const ThoughtInput: React.FC<ThoughtInputProps> = ({
  onSubmit,
  placeholder = "What's on your mind? Just start typing...",
}) => {
  const [thought, setThought] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<{ category: string; type: string } | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuth();

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setThought((prev) => prev + finalTranscript + ' ');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Hide message after 5 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
        setLastAnalysis(null);
        setErrorMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  const toggleSpeechRecognition = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!thought.trim() || isSubmitting) return;

    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setLastAnalysis(null);

    try {
      // Call Gemini AI to analyze the thought (category and type)
      const analysis = await categorizeThoughtWithGemini(thought.trim());

      console.log('Gemini analysis result:', analysis);

      // Determine status based on type
      const status = analysis.type === 'task' ? 'pending' : 'thought';

      // Insert thought into Supabase with AI analysis
      const { data, error } = await supabase
        .from('thoughts')
        .insert([
          {
            content: thought.trim(),
            category: analysis.category || 'random',
            status: status,
            created_at: new Date().toISOString(),
            user_id: user.id,
          },
        ])
        .select();

      if (error) {
        console.error('Error saving thought:', error);

        // Check for foreign key constraint violation (user doesn't exist in database)
        if (error.code === '23503') {
          setErrorMessage(
            'Your session appears to be invalid. Please sign out and sign back in.'
          );
        } else {
          setErrorMessage('Failed to save thought. Please try again.');
        }

        setShowMessage(true);
        return;
      }

      console.log('Thought saved successfully:', data);

      // Show success message with analysis
      setLastAnalysis(analysis);
      setShowMessage(true);

      // Clear the input
      setThought('');

      // Call the optional onSubmit callback
      if (onSubmit) {
        onSubmit(thought.trim());
      }

      // Focus back to textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrorMessage('Something went wrong! Please try again.');
      setShowMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter: Allow new line (default behavior)
        return;
      } else {
        // Enter: Submit the thought
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [thought]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Keep the thought in the input - don't clear it
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 transition-all duration-200 ${
            isFocused ? 'border-primary-300 shadow-lg' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          {/* Main Input Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-6 py-4 bg-transparent border-none outline-none resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 text-base leading-relaxed min-h-[120px] max-h-[300px] rounded-2xl"
              rows={4}
              disabled={isSubmitting}
            />

            {/* Listening indicator */}
            {isListening && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-full text-sm font-medium shadow-md">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              </div>
            )}

            {/* AI Processing indicator */}
            {isSubmitting && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-2 rounded-full text-sm font-medium shadow-md">
                  <Brain className="w-4 w-4 animate-pulse" />
                  <span>AI Analyzing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  disabled={isSubmitting}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : user
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={
                    !user
                      ? 'Sign in to use voice input'
                      : isListening
                      ? 'Stop recording'
                      : 'Start voice input'
                  }
                >
                  {!user ? (
                    <Lock className="h-4 w-4" />
                  ) : isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Brain className="h-4 w-4 mr-1 text-primary-500" />
                <span>
                  {user
                    ? 'AI will analyze • Enter to submit • Shift+Enter for new line'
                    : 'Sign in to dump thoughts'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!thought.trim() || isSubmitting}
              onClick={!user ? () => setShowAuthModal(true) : undefined}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                thought.trim() && user && !isSubmitting
                  ? 'bg-gradient-to-r from-primary-500 to-lavender-500 text-white hover:from-primary-600 hover:to-lavender-600 transform hover:scale-105 shadow-md'
                  : !user
                  ? 'bg-gradient-to-r from-primary-500 to-lavender-500 text-white cursor-pointer filter blur-[1px] hover:blur-[0.5px]'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              title={!user ? 'Sign in to dump thoughts' : undefined}
            >
              {!user ? (
                <>
                  <Send className="h-4 w-4" />
                  <span>Dump It</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Dumping...' : 'Dump It'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Success/Error Message */}
      {showMessage && (
        <div className="mt-4 animate-slide-up">
          {errorMessage ? (
            <div className="flex items-center justify-center space-x-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 max-w-fit mx-auto shadow-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          ) : lastAnalysis ? (
            <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 max-w-fit mx-auto shadow-sm">
              <Tag className="h-4 w-4" />
              <span>
                Analyzed as:{' '}
                <span className="font-medium capitalize">{lastAnalysis.category}</span>
                {' • '}
                <span className="font-medium capitalize">{lastAnalysis.type}</span>
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  );
};

export default ThoughtInput;