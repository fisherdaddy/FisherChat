import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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
        className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-gray-700 text-gray-200"
      >
        <span>{selectedModel.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model)}
              className={`w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 flex items-center justify-between ${
                model.id === selectedModel.id ? 'bg-gray-700' : ''
              }`}
            >
              <span>{model.name}</span>
              {model.id === selectedModel.id && (
                <span className="text-green-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector; 