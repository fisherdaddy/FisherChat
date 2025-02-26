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
        className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
      >
        <span className="font-medium">{selectedModel.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-48 bg-slate-800 rounded-md shadow-lg z-50 border border-slate-700 overflow-hidden">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model)}
              className={`w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-700 flex items-center justify-between transition-colors ${
                model.id === selectedModel.id ? 'bg-slate-700/50' : ''
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