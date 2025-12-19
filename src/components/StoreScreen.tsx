import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { KawaiiCup } from './KawaiiCup';
import { CupSkin } from '../types';
import { coinStore } from '../utils/coinStore';
import { cupStore } from '../utils/cupStore';

type CupCategory = 'classic' | 'special' | 'limited';

interface CupItem {
  id: number;
  name: string;
  price: number;
  category: CupCategory;
  color: string;
  gradient: string;
  owned: boolean;
}

const mockCups: CupItem[] = [
  { id: 1, name: 'Classic White', price: 0, category: 'classic', color: '#FFFFFF', gradient: 'from-amber-50 to-amber-100', owned: true },
  { id: 2, name: 'Minimal Glass', price: 800, category: 'classic', color: '#E0F2FE', gradient: 'from-sky-50 to-sky-100', owned: false },
  { id: 3, name: 'Peach Blush', price: 1000, category: 'classic', color: '#FECACA', gradient: 'from-orange-100 to-rose-200', owned: false },
  { id: 4, name: 'Matcha Cup', price: 1200, category: 'classic', color: '#BBF7D0', gradient: 'from-green-100 to-emerald-200', owned: false },
  { id: 5, name: 'Lavender Dream', price: 1500, category: 'special', color: '#DDD6FE', gradient: 'from-purple-100 to-violet-200', owned: false },
  { id: 6, name: 'Sunset Glow', price: 1500, category: 'special', color: '#FED7AA', gradient: 'from-yellow-100 to-orange-200', owned: false },
  { id: 7, name: 'Ocean Breeze', price: 1800, category: 'special', color: '#A5F3FC', gradient: 'from-cyan-100 to-teal-200', owned: false },
  { id: 8, name: 'Rose Gold', price: 2000, category: 'special', color: '#FBCFE8', gradient: 'from-pink-100 to-rose-200', owned: false },
  { id: 9, name: 'Holiday Special', price: 3000, category: 'limited', color: '#FCA5A5', gradient: 'from-red-200 to-green-200', owned: false },
  { id: 10, name: 'Galaxy Cup', price: 3500, category: 'limited', color: '#C4B5FD', gradient: 'from-indigo-200 to-purple-300', owned: false },
];

// Map gradient class names to liquid colors
const gradientToLiquidColor: Record<string, string> = {
  'from-amber-50 to-amber-100': '#F1E8D8', // amber-300
  'from-sky-50 to-sky-100': '#7dd3fc', // sky-300
  'from-orange-100 to-rose-200': '#fb923c', // orange-400
  'from-green-100 to-emerald-200': '#86efac', // green-300
  'from-purple-100 to-violet-200': '#c4b5fd', // violet-300
  'from-yellow-100 to-orange-200': '#fbbf24', // amber-400
  'from-cyan-100 to-teal-200': '#5eead4', // teal-300
  'from-pink-100 to-rose-200': '#f9a8d4', // pink-300
  'from-red-200 to-green-200': '#f87171', // red-400
  'from-indigo-200 to-purple-300': '#a78bfa', // violet-400
};

// Map gradient class names to glass colors
const gradientToGlassColor: Record<string, string> = {
  'from-amber-50 to-amber-100': '#fef3c7',// amber-50
  'from-sky-50 to-sky-100': '#e0f2fe', // sky-50
  'from-orange-100 to-rose-200': '#ffedd5', // orange-50
  'from-green-100 to-emerald-200': '#d1fae5', // green-50
  'from-purple-100 to-violet-200': '#f3e8ff', // purple-50
  'from-yellow-100 to-orange-200': '#fef9c3', // yellow-50
  'from-cyan-100 to-teal-200': '#cffafe', // cyan-50
  'from-pink-100 to-rose-200': '#fce7f3', // pink-50
  'from-red-200 to-green-200': '#fee2e2', // red-50
  'from-indigo-200 to-purple-300': '#e9d5ff', // purple-100
};

const gradientToLiquidGradient: Record<string, { from: string; to: string }> = {
  'from-amber-50 to-amber-100': { from: '#E6D7BC', to: '#F7F1E6' },
  'from-sky-50 to-sky-100': { from: '#0ea5e9', to: '#bae6fd' },
  'from-orange-100 to-rose-200': { from: '#fb923c', to: '#fbcfe8' },
  'from-green-100 to-emerald-200': { from: '#34d399', to: '#bbf7d0' },
  'from-purple-100 to-violet-200': { from: '#a855f7', to: '#ddd6fe' },
  'from-yellow-100 to-orange-200': { from: '#facc15', to: '#fed7aa' },
  'from-cyan-100 to-teal-200': { from: '#22d3ee', to: '#5eead4' },
  'from-pink-100 to-rose-200': { from: '#fb7185', to: '#fbcfe8' },
  'from-red-200 to-green-200': { from: '#f87171', to: '#86efac' },
  'from-indigo-200 to-purple-300': { from: '#818cf8', to: '#c084fc' },
};

function StoreCup({ gradient, cupId }: { gradient: string; cupId: number }) {
  // Create skin based on gradient, but keep original liquid color
  const liquidColor = gradientToLiquidColor[gradient] || '#fcd34d';
  const glassColor = gradientToGlassColor[gradient] || '#fef3c7';
  const liquidGradient = gradientToLiquidGradient[gradient];

  const skin: CupSkin = {
    id: `store-cup-${cupId}`,
    colors: {
      straw: '#fda4af', // rose-300 - same as HomeScreen
      glass: glassColor,
      liquid: liquidColor, // Keep original liquid color from gradient
      lid: '#ffffff'
    },
    liquidGradient
  };

  return (
    <div className="relative flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
      <KawaiiCup
        fillLevel={0.65}
        skin={skin}
        size="sm"
        showFace={true}
      />
    </div>
  );
}

export function StoreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CupCategory>('classic');
  const [coinBalance, setCoinBalance] = useState(0);
  const [ownedCups, setOwnedCups] = useState<number[]>([]);

  const loadData = () => {
    setCoinBalance(coinStore.getCoins());
    setOwnedCups(cupStore.getOwnedCups());
  };

  useEffect(() => {
    loadData();

    // Listen for storage changes to sync coin balance and owned cups
    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handlePurchase = (cup: CupItem) => {
    if (coinBalance >= cup.price && !ownedCups.includes(cup.id)) {
      const success = coinStore.spendCoins(cup.price);
      if (success) {
        cupStore.addOwnedCup(cup.id);
        loadData();
      }
    }
  };

  const filteredCups = mockCups.map(cup => ({
    ...cup,
    owned: ownedCups.includes(cup.id)
  })).filter((cup) => cup.category === selectedCategory);

  return (
    <div className="h-full flex flex-col px-6 py-4">
      {/* Header with Coin Balance */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Cup Store</h1>

        <button
          className="flex items-center gap-2 bg-yellow-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-200/50 transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] hover:shadow-md active:shadow-sm"
          type="button"
        >
          <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
            <Coins size={12} className="text-yellow-700" />
          </div>
          <span className="text-yellow-700 font-bold text-sm">{coinBalance}</span>
        </button>
      </div>
      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-hidden pb-2">
        {(['classic', 'special', 'limited'] as CupCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2.5 rounded-full whitespace-nowrap transition-all capitalize font-medium flex-shrink-0 ${selectedCategory === category
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Cup Grid */}
      <div className="flex-1 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredCups.map((cup) => (
            <div
              key={cup.id}
              className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow"
            >
              {/* Cup Illustration */}
              <div className="w-full aspect-square mb-2 flex items-center justify-center bg-gray-50/50 rounded-2xl">
                <StoreCup gradient={cup.gradient} cupId={cup.id} />
              </div>

              {/* Cup Name */}
              <h3 className="text-sm font-medium text-gray-700 text-center mb-3 line-clamp-1">
                {cup.name}
              </h3>

              {/* Price / Owned Badge */}
              {cup.owned ? (
                <div className="w-full py-2 rounded-xl bg-green-50 text-green-600 text-sm font-medium text-center border border-green-100">
                  Owned
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase(cup)}
                  disabled={coinBalance < cup.price}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 ${coinBalance >= cup.price
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <Coins size={14} className={coinBalance >= cup.price ? 'text-yellow-300' : ''} />
                  <span>{cup.price}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mt-4 border border-blue-100">
        <p className="text-xs text-center text-blue-600/80 leading-relaxed font-medium">
          💡 Collect coins by logging your drinks and staying within your budget
        </p>
      </div>
    </div>
  );
}
