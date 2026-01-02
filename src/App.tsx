import React, { useEffect, useMemo, useState, useRef } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { OverviewScreen } from './components/OverviewScreen';
import { StoreScreen } from './components/StoreScreen';
import { Home, Calendar, Store } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

type Screen = 'home' | 'overview' | 'store';

const BOTTOM_NAV_H = 80; // h-20


function isMobileUA() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod|Android/i.test(ua);
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [screenBg, setScreenBg] = useState<string>(
    'linear-gradient(180deg, #fef3c722 0%, #fef3c714 55%, #fef3c710 100%)'
  );
  const deviceScrollRef = useRef<HTMLDivElement | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);

  // ✅ 自动判断：手机/Simulator 使用真实全屏；桌面才显示 iPhone 预览框
  const [useDeviceLayout, setUseDeviceLayout] = useState(false);

  // Reset scroll position when switching tabs
  useEffect(() => {
    if (currentScreen === 'home') return;
    
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      const el = useDeviceLayout ? deviceScrollRef.current : desktopScrollRef.current;
      if (el) {
        el.scrollTop = 0;
        el.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      // Also reset window/body scroll as a fallback
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    });
  }, [currentScreen, useDeviceLayout]);
  
  useEffect(() => {
    const decide = () => {
      // 小屏也按设备处理（桌面调窄窗口/模拟器等）
      const small = typeof window !== 'undefined' ? window.innerWidth <= 520 : false;

      // PWA standalone / iOS Safari standalone
      const isStandalone =
        (typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(display-mode: standalone)').matches) ||
        // @ts-ignore
        (typeof navigator !== 'undefined' && (navigator as any).standalone);

      setUseDeviceLayout(isMobileUA() || small || !!isStandalone);
    };

    decide();
    window.addEventListener('resize', decide);
    return () => window.removeEventListener('resize', decide);
  }, []);

  const content = (
    <>
      {currentScreen === 'home' && (
        <div className="h-full overflow-hidden">
          <HomeScreen
            onNavigateToStore={() => setCurrentScreen('store')}
            onBackgroundChange={(bg) => setScreenBg(bg)}
          />
        </div>
      )}
      {currentScreen === 'overview' && <OverviewScreen />}
      {currentScreen === 'store' && <StoreScreen />}
    </>
  );

  const bottomNav = (
    <div className="flex items-start justify-around px-4 pt-2">
      <button
        onClick={() => setCurrentScreen('home')}
        className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'home' ? 'text-orange-500' : 'text-gray-400'
          }`}
        type="button"
      >
        <Home size={24} fill={currentScreen === 'home' ? 'currentColor' : 'none'} />
        <span className="text-xs">Today</span>
      </button>

      <button
        onClick={() => setCurrentScreen('overview')}
        className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'overview' ? 'text-orange-500' : 'text-gray-400'
          }`}
        type="button"
      >
        <Calendar size={24} fill={currentScreen === 'overview' ? 'currentColor' : 'none'} />
        <span className="text-xs">Overview</span>
      </button>

      <button
        onClick={() => setCurrentScreen('store')}
        className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'store' ? 'text-orange-500' : 'text-gray-400'
          }`}
        type="button"
      >
        <Store size={24} fill={currentScreen === 'store' ? 'currentColor' : 'none'} />
        <span className="text-xs">Store</span>
      </button>
    </div>
  );

  // =========================
  // ✅ 真实设备/Simulator：全屏 + safe-area + fixed bottom nav（不会挡内容）
  // =========================
  if (useDeviceLayout) {
    return (
      <div
        className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50"
        style={{
          background: screenBg,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${BOTTOM_NAV_H}px)`,
        }}
      >
        {currentScreen === 'home' ? (
          // HomeScreen: no scroll
          <div className="h-screen overflow-hidden bg-transparent">
            {content}
          </div>
        ) : (
          // Other screens: scrollable
          <div
            ref={deviceScrollRef}
            className="min-h-screen overflow-y-auto bg-transparent hide-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {content}
          </div>

        )}

        <div
          className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200"
          style={{
            height: BOTTOM_NAV_H,
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
          }}
        >
          {bottomNav}
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

  // =========================
  // ✅ 桌面：保留 iPhone 预览框 + 假 Status Bar + 内部滚动
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      {/* iPhone 15 Pro Frame */}
      <div
        className="relative w-full max-w-[393px] h-[852px] rounded-[60px] shadow-xl overflow-hidden border-8 border-gray-900"
        style={{ background: screenBg }}
      >
        {/* Screen wrapper (inside phone frame) */}
        <div className="h-full flex flex-col bg-transparent">
          {/* Fake Status Bar (desktop preview only) */}
          <div className="relative z-50 flex-shrink-0">
            <div className="h-12 bg-white flex items-center justify-between px-8 pt-2">
              <span className="text-sm">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 border border-gray-900 rounded-sm">
                  <div className="w-2 h-2 bg-gray-900 m-0.5 rounded-[1px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          {currentScreen === 'home' ? (
            // HomeScreen: no scroll
            <div className="flex-1 overflow-hidden bg-transparent">
              {content}
            </div>
          ) : (
            // Other screens: scrollable
            <div
              ref={desktopScrollRef}
              className="flex-1 overflow-y-auto bg-transparent hide-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {content}
              <div className="h-24" />
            </div>

          )}

          {/* Bottom Navigation */}
          <div className="h-20 bg-white border-t border-gray-200">{bottomNav}</div>
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
