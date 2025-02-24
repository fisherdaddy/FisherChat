import React from 'react';
import { XMarkIcon, MinusIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    window.electron.window.minimize();
  };

  const handleMaximize = () => {
    window.electron.window.maximize();
  };

  const handleClose = () => {
    window.electron.window.close();
  };

  return (
    <div className="flex-1 flex justify-between items-center">
      <div className="text-white text-sm">FisherChat</div>
      <div className="flex space-x-4">
        <button
          onClick={handleMinimize}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          <ArrowsPointingOutIcon className="h-4 w-4" />
        </button>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar; 