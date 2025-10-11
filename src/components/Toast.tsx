import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-center p-4 border rounded-xl shadow-lg max-w-md ${getToastStyles()}`}>
        <div className="flex items-center">
          {getIcon()}
          <span className="ml-3 text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;