
import React from 'react';
import { CheckCircleIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center">
        <CheckCircleIcon className="h-8 w-8 text-blue-400 mr-3" />
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Truth Tally
        </h1>
      </div>
    </header>
  );
};

export default Header;
