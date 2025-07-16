import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">O Barateiro</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Navigation items will go here */}
        </div>
      </div>
    </header>
  );
};

export default Header;
