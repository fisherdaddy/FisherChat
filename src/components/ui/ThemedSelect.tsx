import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ThemedSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  label?: string;
}

const ThemedSelect: React.FC<ThemedSelectProps> = ({
  id,
  value,
  onChange,
  options,
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected option label
  const selectedOption = options.find(option => option.value === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle option selection
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center space-x-3">
        {label && (
          <label htmlFor={id} className="text-sm font-medium dark:text-slate-300 text-slate-700 whitespace-nowrap">
            {label}
          </label>
        )}
        <div className="flex-1">
          <button
            id={id}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-between w-full rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 border dark:focus:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-white text-slate-900 px-4 py-2.5 text-sm ${className}`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span>{selectedOption?.label || value}</span>
            <ChevronDownIcon className="w-4 h-4 ml-2" />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 overflow-auto rounded-md shadow-lg max-h-60 focus:outline-none">
              <ul
                className="py-1 overflow-auto text-sm dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 rounded-lg"
                role="listbox"
                aria-labelledby={id}
              >
                {options.map((option) => (
                  <li
                    key={option.value}
                    className={`cursor-pointer select-none relative py-1.5 pl-3 pr-9 hover:dark:bg-slate-700 hover:bg-slate-100 ${
                      option.value === value ? 'dark:bg-slate-700 bg-slate-100' : ''
                    }`}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleOptionClick(option.value)}
                  >
                    <span className={`block truncate dark:text-white text-slate-900 ${
                      option.value === value ? 'font-medium' : 'font-normal'
                    }`}>
                      {option.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemedSelect; 