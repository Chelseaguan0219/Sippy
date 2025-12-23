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
        className="relative w-full max-w-[393px] h-[852px] rounded-[60px] shadow-xl overflow-hidden border-8 border-gray-900"
        style={{ background: screenBg }}
      >
        {/* Screen wrapper (inside phone frame) */}
        <div className="h-full flex flex-col bg-transparent">
          {/* Fixed Top Bar (Status Bar + Safe Area) */}
          <div className="relative z-50 flex-shrink-0">
            {/* Status Bar */}
            <div className="h-12 bg-white flex items-center justify-between px-8 pt-2">
              <span className="text-sm">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 border border-gray-900 rounded-sm">
                  <div className="w-2 h-2 bg-gray-900 m-0.5 rounded-[1px]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto bg-transparent hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            {currentScreen === 'home' && (
              <HomeScreen
                onNavigateToStore={() => setCurrentScreen('store')}
                onBackgroundChange={(bg) => setScreenBg(bg)}
              />
            )}
            {currentScreen === 'overview' && <OverviewScreen />}
            {currentScreen === 'store' && <StoreScreen />}
            {/* 给最后留出空间，避免贴到底部 */}
            <div className="h-24" />
          </div>

          {/* Bottom Navigation (no overlay) */}
          <div className="h-20 bg-white border-t border-gray-200 flex items-start justify-around px-4 pt-2">
            <button
              onClick={() => setCurrentScreen('home')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'home' ? 'text-orange-500' : 'text-gray-400'
                }`}
            >
              <Home size={24} fill={currentScreen === 'home' ? 'currentColor' : 'none'} />
              <span className="text-xs">Today</span>
            </button>
            <button
              onClick={() => setCurrentScreen('overview')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'overview' ? 'text-orange-500' : 'text-gray-400'
                }`}
            >
              <Calendar size={24} fill={currentScreen === 'overview' ? 'currentColor' : 'none'} />
              <span className="text-xs">Overview</span>
            </button>
            <button
              onClick={() => setCurrentScreen('store')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'store' ? 'text-orange-500' : 'text-gray-400'
                }`}
            >
              <Store size={24} fill={currentScreen === 'store' ? 'currentColor' : 'none'} />
              <span className="text-xs">Store</span>
            </button>
          </div>
        </div>
      </div>
      <Toaster
        position="top-center"
        offset={30}
        toastOptions={{
          style: {
            maxWidth: '320px',
            marginLeft: '16px',
            marginRight: '16px',
            borderRadius: '18px',
          },
          className: 'bg-white/85 backdrop-blur border border-gray-200/60 shadow-lg',
        }}
      />
    </div>
  );
}
