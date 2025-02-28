import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { availableModels, setSelectedModel } from '../store/slices/modelSlice';

const ModelSelector: React.FC = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedModel = useSelector((state: RootState) => state.model.selectedModel);

  const handleModelSelect = (model: typeof availableModels[0]) => {
    dispatch(setSelectedModel(model));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-md dark:hover:bg-slate-800 hover:bg-slate-200 dark:text-slate-200 text-slate-700 dark:border-slate-700 border-slate-300 border transition-colors"
      >
        <span className="font-medium">{selectedModel.name}</span>
        <ChevronDownIcon className="h-4 w-4 dark:text-slate-400 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-48 dark:bg-slate-800 bg-white rounded-md shadow-lg z-50 dark:border-slate-700 border-slate-300 border overflow-hidden">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model)}
              className={`w-full px-4 py-2.5 text-left dark:text-slate-200 text-slate-700 dark:hover:bg-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors ${
                model.id === selectedModel.id ? 'dark:bg-slate-700/50 bg-slate-100' : ''
              }`}
            >
              <span>{model.name}</span>
              {model.id === selectedModel.id && (
                <CheckIcon className="h-4 w-4 text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector; 