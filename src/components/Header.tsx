import React from 'react';
import { Shield, Key } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4 max-w-6xl">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">API Key Manager</h1>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Secured with macOS Keychain</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;