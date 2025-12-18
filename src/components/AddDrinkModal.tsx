import React, { useState, useEffect } from 'react';
import { Coffee, CircleDot, CupSoda, X } from 'lucide-react';

interface AddDrinkModalProps {
  onClose: () => void;
  onAdd: (type: 'coffee' | 'bubble' | 'other', price: number, name?: string, customName?: string, date?: string) => void;
  initialDate?: string; // YYYY-MM-DD format
}

export function AddDrinkModal({ onClose, onAdd, initialDate }: AddDrinkModalProps) {
  const [drinkType, setDrinkType] = useState<'coffee' | 'bubble' | 'other'>('coffee');
  const [price, setPrice] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [customName, setCustomName] = useState('');

  // Clear custom name when switching away from Other
  useEffect(() => {
    if (drinkType !== 'other') {
      setCustomName('');
    }
  }, [drinkType]);

  const handleAdd = () => {
    const priceNum = parseFloat(price);
    if (priceNum && priceNum > 0) {
      const trimmedCustomName = drinkType === 'other' ? customName.trim() || undefined : undefined;
      onAdd(drinkType, priceNum, drinkName || undefined, trimmedCustomName, initialDate);
    }
  };

  // Format date for display
  const getTitle = () => {
    if (initialDate) {
      const date = new Date(initialDate + 'T00:00:00');
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `Log a drink — ${monthName} ${day}`;
    }
    return 'Add a drink';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Drink Type Toggle */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setDrinkType('coffee')}
              className={`flex-1 py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all border-2 ${
                drinkType === 'coffee'
                  ? 'bg-orange-50 border-orange-200 text-orange-600'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              <Coffee size={18} className={drinkType === 'coffee' ? 'text-orange-500' : 'text-gray-400'} />
              <span className="font-semibold text-xs">Coffee</span>
            </button>
            <button
              onClick={() => setDrinkType('bubble')}
              className={`flex-1 py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all border-2 ${
                drinkType === 'bubble'
                  ? 'bg-pink-50 border-pink-200 text-pink-600'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              <CircleDot size={18} className={drinkType === 'bubble' ? 'text-pink-500' : 'text-gray-400'} />
              <span className="font-semibold text-xs">Bubble Tea</span>
            </button>
            <button
              onClick={() => setDrinkType('other')}
              className={`flex-1 py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all border-2 ${
                drinkType === 'other'
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              <CupSoda size={18} className={drinkType === 'other' ? 'text-blue-500' : 'text-gray-400'} />
              <span className="font-semibold text-xs">Other</span>
            </button>
          </div>
        </div>

        {/* Price Input */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="w-full py-3 pl-8 pr-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:outline-none text-gray-800 font-semibold transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Drink Name Input (Optional) - Only for Coffee/Bubble Tea */}
        {drinkType !== 'other' && (
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Name (Optional)</label>
            <input
              type="text"
              value={drinkName}
              onChange={(e) => setDrinkName(e.target.value)}
              placeholder="e.g. Caramel Macchiato"
              className="w-full py-3 px-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:outline-none text-gray-800 transition-all placeholder:text-gray-300"
            />
          </div>
        )}

        {/* Custom Name Input (Optional) - Only for Other */}
        {drinkType === 'other' && (
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Drink name (Optional)</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Smoothie"
              className="w-full py-3 px-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-200 focus:outline-none text-gray-800 transition-all placeholder:text-gray-300"
            />
          </div>
        )}

        {/* Add Button */}
        <div>
          <button
            onClick={handleAdd}
            disabled={!price || parseFloat(price) <= 0}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed active:scale-95 transition-all hover:brightness-105"
          >
            Add Drink
          </button>
        </div>
      </div>
    </div>
  );
}
