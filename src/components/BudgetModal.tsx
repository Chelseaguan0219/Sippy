import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { budgetStore } from '../utils/budgetStore';

interface BudgetModalProps {
  onClose: () => void;
  onSave: (budget: number | null) => void;
  currentBudget: number | null;
}

export function BudgetModal({ onClose, onSave, currentBudget }: BudgetModalProps) {
  const [budget, setBudget] = useState<string>('');

  useEffect(() => {
    if (currentBudget !== null && currentBudget > 0) {
      setBudget(currentBudget.toString());
    }
  }, [currentBudget]);

  const handleSave = () => {
    const budgetNum = parseFloat(budget);
    if (budget && budgetNum > 0) {
      budgetStore.setMonthlyBudget(budgetNum);
      onSave(budgetNum);
    } else {
      budgetStore.setMonthlyBudget(null);
      onSave(null);
    }
    onClose();
  };

  const handleQuickSelect = (value: number) => {
    setBudget(value.toString());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Monthly budget</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Label */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 block mb-3">
            This month&apos;s budget is:
          </label>
          
          {/* Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
            <input
              type="number"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="w-full py-3 pl-8 pr-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-orange-200 focus:outline-none text-gray-800 font-semibold transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Quick Chips */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {[50, 100, 150, 200].map((value) => (
              <button
                key={value}
                onClick={() => handleQuickSelect(value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  budget === value.toString()
                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-200'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                ${value}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 active:scale-95 transition-all hover:brightness-105"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

