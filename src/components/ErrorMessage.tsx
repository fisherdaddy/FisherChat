import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="flex items-center justify-between bg-red-500 text-white p-3 rounded-lg">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-red-100"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 