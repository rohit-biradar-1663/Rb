
import React, { useState } from 'react';
import { ChevronDownIcon } from '../Icons';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring focus-visible:ring-accent focus-visible:ring-opacity-75"
      >
        <span className="text-lg font-medium text-dark">{title}</span>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-0">
          <p className="text-gray-600 leading-relaxed">{children}</p>
        </div>
      )}
    </div>
  );
};

export default AccordionItem;
