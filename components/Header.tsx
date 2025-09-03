import React from 'react';
import { LogoIcon, SpeakerOnIcon, SpeakerOffIcon, CurrencyDollarIcon } from './Icons';

interface HeaderProps {
    isTtsEnabled: boolean;
    onToggleTts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    isTtsEnabled,
    onToggleTts
}) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-10 w-10 text-green-400" />
            <div>
              <h1 className="text-xl font-bold text-gray-100 tracking-wider">
                PayPilot
              </h1>
              <p className="text-xs text-gray-400">Your AI Payment Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isTtsEnabled ? 'text-green-400' : 'text-gray-400'}`}>Voice</span>
                  <button
                    onClick={onToggleTts}
                    title={isTtsEnabled ? 'Disable Voice Read-Aloud' : 'Enable Voice Read-Aloud'}
                    aria-label={isTtsEnabled ? 'Disable Voice Read-Aloud' : 'Enable Voice Read-Aloud'}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 ${
                      isTtsEnabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 flex items-center justify-center text-gray-700 ${
                        isTtsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    >
                        {isTtsEnabled ? <SpeakerOnIcon className="w-3 h-3"/> : <SpeakerOffIcon className="w-3 h-3"/>}
                    </span>
                  </button>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
};
