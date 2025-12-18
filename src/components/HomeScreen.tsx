import React, { useState, useEffect } from 'react';
import { Coins, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { AddDrinkModal } from './AddDrinkModal';
import { CupSelectionModal } from './CupSelectionModal';
import { BudgetModal } from './BudgetModal';
import { drinkStore, DrinkLog } from '../utils/drinkStore';
import { coinStore } from '../utils/coinStore';
import { cupStore } from '../utils/cupStore';
import { budgetStore } from '../utils/budgetStore';
import { KawaiiCup } from './KawaiiCup';
import { cupIdToSkin } from '../utils/cupUtils';

interface HomeScreenProps {
  onNavigateToStore?: () => void;
  onBackgroundChange?: (bg: string) => void;
}

export function HomeScreen({ onNavigateToStore, onBackgroundChange }: HomeScreenProps = {}) {
  const [showModal, setShowModal] = useState(false);
  const [showCupSelection, setShowCupSelection] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [todayLogs, setTodayLogs] = useState<DrinkLog[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [currentCupId, setCurrentCupId] = useState(1);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [monthSpent, setMonthSpent] = useState(0);

  const loadData = () => {
    const today = drinkStore.formatDate(new Date());

    // Get all logs and filter for today only
    const allLogs = drinkStore.getLogs();
    const todayOnly = allLogs.filter((log) => {
      // Normalize date to YYYY-MM-DD format for comparison
      const logDate = log.date ? log.date.slice(0, 10) : '';
      return logDate === today;
    });

    setTodayLogs(todayOnly);
    setCoinBalance(coinStore.getCoins());
    setCurrentCupId(cupStore.getCurrentCup());
    setMonthlyBudget(budgetStore.getMonthlyBudget());
    setMonthSpent(drinkStore.getCurrentMonthSpent());
  };



  useEffect(() => {
    // Check for new day and reset if needed
    drinkStore.checkNewDayAndReset();
    loadData();

    // Check for new day when window regains focus
    const handleFocus = () => {
      const isNewDay = drinkStore.checkNewDayAndReset();
      // Always reload data on focus to ensure we have the latest today's logs
      loadData();
    };

    // Optional: listen for storage events to sync across tabs
    const handleStorageChange = () => loadData();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const MAX_CUPS = 3;
  const todayCount = Array.isArray(todayLogs) ? todayLogs.length : 0;
  const fillRatio = todayCount > 0 ? Math.min(todayCount / MAX_CUPS, 1) : 0;

  // Calculate mood based on todayCount
  const mood: 'happy' | 'neutral' | 'sad' =
    todayCount >= 3 ? 'sad' : todayCount === 2 ? 'neutral' : 'happy';


  // Get current cup skin
  const currentSkin = cupIdToSkin(currentCupId);

  // Update background when cup changes
  useEffect(() => {
    if (!onBackgroundChange) return;

    // Get colors from liquidGradient or fallback to safe pastel colors
    const bgFrom = currentSkin.liquidGradient?.from ?? currentSkin.colors.liquid ?? '#fef3c7';
    const bgTo = currentSkin.liquidGradient?.to ?? currentSkin.colors.glass ?? '#fef3c7';
    
    // Convert hex to rgba with alpha for soft gradient
    const hexToRgba = (hex: string, alpha: string) => {
      // Handle 3-digit hex
      let hexColor = hex;
      if (hex.length === 4) {
        hexColor = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
      }
      // Extract RGB values
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Create gradient: linear-gradient(180deg, lightTop 0%, mid 55%, bottom 100%)
    const lightTop = hexToRgba(bgTo, '0.13'); // Top lighter
    const mid = hexToRgba(bgFrom, '0.13'); // Middle
    const bottom = hexToRgba(bgFrom, '0.08'); // Bottom darker

    const gradient = `linear-gradient(180deg, ${lightTop} 0%, ${mid} 55%, ${bottom} 100%)`;
    onBackgroundChange(gradient);
  }, [currentCupId, currentSkin.id, currentSkin.liquidGradient?.from, currentSkin.liquidGradient?.to, currentSkin.colors.liquid, currentSkin.colors.glass, onBackgroundChange]);




  const handleAddDrink = (type: 'coffee' | 'bubble' | 'other', price: number, name?: string, customName?: string, date?: string) => {
    const logType = type === 'coffee' ? 'COFFEE' : type === 'bubble' ? 'BUBBLE' : 'OTHER';
    drinkStore.addLog({
      type: logType,
      amount: price,
      date: (date ? date.slice(0, 10) : drinkStore.formatDate(new Date())),
      name: type !== 'other' ? name : undefined,
      customName: type === 'other' ? customName : undefined
    });
    // Add 100 coins when adding a drink
    coinStore.addCoins(100);
    toast.success("You've got 100 coins!", {
      icon: (
        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm">
          <Coins size={12} className="text-yellow-700" />
        </div>
      ),
      duration: 1600
    });

    loadData();
    setShowModal(false);
  };

  // Calculate progress percentage
  const progressPercent = monthlyBudget && monthlyBudget > 0
    ? Math.min((monthSpent / monthlyBudget) * 100, 100)
    : 0;

  // Calculate remaining balance
  const remainingBalance = monthlyBudget && monthlyBudget > 0
    ? Math.max(0, monthlyBudget - monthSpent)
    : null;

  return (
    <div className="h-full flex flex-col px-8 py-6 relative bg-transparent">
      {/* Top Bar - Left: Total Balance */}
      <div className="absolute top-6 left-6 z-50" style={{ marginTop: 15 }}>
        <div className="flex flex-col">
          <div
            className="tracking-[0.18em] text-gray-400 font-bold uppercase"
            style={{ fontSize: '11px' }}
          >
            TOTAL BALANCE
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {remainingBalance !== null ? `$${remainingBalance.toFixed(2)}` : '0'}
          </div>
        </div>
      </div>

      {/* Top Bar - Right: Budget Display */}
      <div className="absolute top-6 right-6 z-50" style={{ marginTop: 15 }}>
        <button
          onClick={() => setShowBudgetModal(true)}
          aria-label="Set monthly budget"
          className="group flex flex-col items-end gap-1.5 transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Label Row with Pencil */}
          <div className="flex items-center gap-1">
            <div
              className="tracking-[0.18em] text-gray-400 font-bold uppercase"
              style={{ fontSize: '11px' }}
            >
              BUDGET
            </div>
            <Pencil
              size={12}
              strokeWidth={1.25}
              className="ml-1.5 text-slate-200 opacity-20 group-hover:opacity-35 transition-opacity"
            />
          </div>

          {/* Progress Bar with Numbers Overlay */}
          <div className="relative" style={{ width: 106, height: 22 }}>
            {/* Track */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.10)' }}
            />
            {/* Fill (只让 fill 裁切) */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#facc15',
                  width: `${Math.max(0, Math.min(progressPercent, 100))}%`,
                  minWidth: progressPercent > 0 ? 12 : 0,
                  borderRadius: 9999,
                  transition: 'width 300ms ease',
                }}
              />
            </div>

            {/* Text Overlay (不再被裁切) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-2">
              <span className="whitespace-nowrap font-semibold leading-none tabular-nums" style={{ fontSize: '11px' }}>
                <span className={monthlyBudget && monthlyBudget > 0 ? 'text-slate-900' : 'text-slate-400'}>
                  ${monthSpent.toFixed(2)}
                </span>
                <span className="text-gray-500 font-semibold">
                  {''} / {monthlyBudget && monthlyBudget > 0 ? `${monthlyBudget.toFixed(2)}` : '—'}
                </span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Header Title */}
      <div className="relative text-center " style={{ marginTop: 135 }}>
        <p
          className="text-gray-400 font-normal uppercase tracking-[0.18em]"
          style={{ fontSize: '13px' }}
        >
          {todayCount > 0
            ? `Log today's ${todayCount} ${todayCount === 1 ? 'drink!' : 'drinks!'}`
            : "Log today's drink!"}
        </p>
      </div>


      {/* Main Visual */}
      <div className="flex-1 flex items-center justify-center pt-2 mb-2">
        <button
          onClick={() => setShowCupSelection(true)}
          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none"
          aria-label="Select cup"
          type="button"
        >
          <KawaiiCup
            fillLevel={fillRatio}
            skin={currentSkin}
            size="lg"
            showFace={true}
            mood={mood}
          />
        </button>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto w-full mb-12 flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="w-[70%] bg-gradient-to-r from-orange-400 to-pink-500 text-white text-lg font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 active:brightness-95 active:shadow-sm transition-transform hover:brightness-105"
        >
          + Add a drink
        </button>
      </div>

      {/* Modals */}
      {showModal && <AddDrinkModal onClose={() => setShowModal(false)} onAdd={handleAddDrink} />}
      {showBudgetModal && (
        <BudgetModal
          onClose={() => setShowBudgetModal(false)}
          onSave={(budget) => {
            setMonthlyBudget(budget);
            loadData();
          }}
          currentBudget={monthlyBudget}
        />
      )}
      <CupSelectionModal
        open={showCupSelection}
        onClose={() => setShowCupSelection(false)}
        onSelect={(cupId) => {
          setCurrentCupId(cupId);
          loadData();
        }}
      />
    </div>
  );
}
