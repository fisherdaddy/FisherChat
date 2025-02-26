import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white p-4 rounded-lg shadow-lg m-3 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-white flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-red-100 rounded-full p-1 hover:bg-white/10 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 