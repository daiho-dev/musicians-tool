import React from 'react';
import { Music } from 'lucide-react';

const Header: React.FC = () => {
  return (
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md h-14">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-6 w-6" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">ミュージシャンツールキット</h1>
          </div>
        </div>
     </header>
  );
};

export default Header;