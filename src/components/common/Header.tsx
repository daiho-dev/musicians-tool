import React from 'react';
import { Music } from 'lucide-react';

const Header: React.FC = () => {
  return (
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md h-20">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8" />
            <h1 className="text-2xl font-bold tracking-tight">ミュージシャンツールキット</h1>
          </div>
        </div>
     </header>
  );
};

export default Header;