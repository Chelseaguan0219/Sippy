import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { OverviewScreen } from './components/OverviewScreen';
import { StoreScreen } from './components/StoreScreen';
import { Home, Calendar, Store } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

type Screen = 'home' | 'overview' | 'store';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [screenBg, setScreenBg] = useState<string>('linear-gradient(180deg, #fef3c722 0%, #fef3c714 55%, #fef3c710 100%)');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      {/* iPhone 15 Pro Frame */}
      <div 
        className="relative w-full max-w-[393px] h-[852px] rounded-[60px] shadow-2xl overflow-hidden border-8 border-gray-900"
        style={{ background: screenBg }}
      >
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-transparent z-50 flex items-center justify-between px-8 pt-2">
          <span className="text-sm">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 border border-gray-900 rounded-sm">
              <div className="w-2 h-2 bg-gray-900 m-0.5 rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="h-full pt-12 pb-20 overflow-y-auto bg-transparent">
          {currentScreen === 'home' && (
            <HomeScreen 
              onNavigateToStore={() => setCurrentScreen('store')}
              onBackgroundChange={(bg) => setScreenBg(bg)}
            />
          )}
          {currentScreen === 'overview' && <OverviewScreen />}
          {currentScreen === 'store' && <StoreScreen />}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-transparent border-t border-white/30 flex items-start justify-around px-4 pt-2">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              currentScreen === 'home' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <Home size={24} fill={currentScreen === 'home' ? 'currentColor' : 'none'} />
            <span className="text-xs">Today</span>
          </button>
          <button
            onClick={() => setCurrentScreen('overview')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              currentScreen === 'overview' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <Calendar size={24} fill={currentScreen === 'overview' ? 'currentColor' : 'none'} />
            <span className="text-xs">Overview</span>
          </button>
          <button
            onClick={() => setCurrentScreen('store')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              currentScreen === 'store' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <Store size={24} fill={currentScreen === 'store' ? 'currentColor' : 'none'} />
            <span className="text-xs">Store</span>
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
