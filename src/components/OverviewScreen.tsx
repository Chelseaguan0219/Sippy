import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Coffee, CircleDot, CupSoda, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { drinkStore, DrinkLog } from '../utils/drinkStore';
import { AddDrinkModal } from './AddDrinkModal';
import { coinStore } from '../utils/coinStore';

type ViewMode = 'day' | 'week' | 'month' | 'year';

export function OverviewScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const loadLogs = () => setLogs(drinkStore.getLogs());
    loadLogs();

    // Listen for storage events (e.g. added from Home screen)
    const handleStorageChange = () => loadLogs();
    window.addEventListener('storage', handleStorageChange);
    // Also re-load every time we focus (hacky but simple for single-page app nav)
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Update logs when component mounts (in case navigation happens)
  useEffect(() => {
    setLogs(drinkStore.getLogs());
  }, []);

  // Handler for day cell click
  const handleDayClick = (dayNum: number) => {
    const dateStr = drinkStore.formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum));
    setSelectedDate(dateStr);
    setIsAddModalOpen(true);
  };

  // Handler for adding drink from modal
  const handleAddDrink = (type: 'coffee' | 'bubble' | 'other', price: number, name?: string, customName?: string, date?: string) => {
    const logType = type === 'coffee' ? 'COFFEE' : type === 'bubble' ? 'BUBBLE' : 'OTHER';
    drinkStore.addLog({
      type: logType,
      amount: price,
      date: date || drinkStore.formatDate(new Date()),
      name: type !== 'other' ? name : undefined,
      customName: type === 'other' ? customName : undefined
    });
    // Add 100 coins when adding a drink
    coinStore.addCoins(100);
    toast.success("You've got 100 coins!", {
      icon: <Coins size={20} className="text-yellow-600" />,
    });
    // Refresh logs
    setLogs(drinkStore.getLogs());
    setIsAddModalOpen(false);
    setSelectedDate(null);
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  // Helper to check if a date string is in a range
  const isDateInWeek = (dateStr: string, referenceDate: Date) => {
    const d = new Date(dateStr + 'T00:00:00'); // Force local time interpretation from YYYY-MM-DD
    const ref = new Date(referenceDate);
    const day = ref.getDay(); // 0 (Sun) to 6 (Sat)

    const startOfWeek = new Date(ref);
    startOfWeek.setDate(ref.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(ref);
    endOfWeek.setDate(ref.getDate() + (6 - day));
    endOfWeek.setHours(23, 59, 59, 999);

    // We need to compare timestamps or YYYY-MM-DD strings. 
    // Construct YYYY-MM-DD for start/end is safer.
    const startStr = drinkStore.formatDate(startOfWeek);
    const endStr = drinkStore.formatDate(endOfWeek);

    return dateStr >= startStr && dateStr <= endStr;
  };

  // Filter logs based on ViewMode
  const getFilteredLogs = () => {
    const now = new Date(); // For Day/Week

    return logs.filter(log => {
      if (viewMode === 'day') {
        return log.date === drinkStore.formatDate(now);
      }
      if (viewMode === 'week') {
        return isDateInWeek(log.date, now);
      }
      if (viewMode === 'month') {
        // Use the currentMonth state
        const logDate = new Date(log.date + 'T00:00:00');
        return logDate.getMonth() === currentMonth.getMonth() &&
          logDate.getFullYear() === currentMonth.getFullYear();
      }
      if (viewMode === 'year') {
        // Use the currentMonth state's year
        const logDate = new Date(log.date + 'T00:00:00');
        return logDate.getFullYear() === currentMonth.getFullYear();
      }
      return false;
    });
  };

  const filteredLogs = getFilteredLogs();
  const totalCups = filteredLogs.length;
  const totalSpent = filteredLogs.reduce((sum, log) => sum + log.amount, 0);
  const avgPerCup = totalCups > 0 ? totalSpent / totalCups : 0;

  // Calendar Data (Always for currentMonth)
  const getCalendarData = (day: number) => {
    const dateStr = drinkStore.formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    const dayLogs = logs.filter(l => l.date === dateStr);
    return {
      hasCoffee: dayLogs.some(l => l.type === 'COFFEE'),
      hasBubble: dayLogs.some(l => l.type === 'BUBBLE' || (l as any).type === 'BOBA'), // Backward compatibility
      hasOther: dayLogs.some(l => l.type === 'OTHER'),
      count: dayLogs.length
    };
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-full flex flex-col px-4 py-4 pb-28">
      {/* Header */}
      <h1 className="text-2xl mb-4 text-center">Overview</h1>

      {/* Segmented Control */}
      <div className="flex bg-gray-100 rounded-full p-1 mb-6">
        {(['day', 'week', 'month', 'year'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-2 rounded-full transition-all capitalize text-sm ${viewMode === mode
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600'
              }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
          }
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-lg font-medium">{monthName}</h2>
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
          }
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl px-2 py-6 mb-6 shadow-sm border border-gray-100 w-full max-w-full">

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-3 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs text-gray-400 font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}


          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const { hasCoffee, hasBubble, hasOther, count } = getCalendarData(dayNum);
            const hasData = count > 0;
            const dateStr = drinkStore.formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum));
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dayNum}
                onClick={() => handleDayClick(dayNum)}
                className="aspect-square flex items-center justify-center relative focus:outline-none"
              >
                <div
                  className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 ${hasData
                    ? 'bg-gradient-to-br from-orange-100 to-pink-100 border border-orange-100'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                    } ${isSelected ? 'ring-2 ring-orange-400 ring-offset-1' : ''
                    }`}
                >
                  <span
                    className={`text-xs ${hasData ? 'mb-0.5 text-gray-800 font-medium' : ''

                      }`}
                  >
                    {dayNum}
                  </span>
                  {hasData && (() => {
                    const iconCount = (hasCoffee ? 1 : 0) + (hasBubble ? 1 : 0) + (hasOther ? 1 : 0);
                    const hasAllThree = hasCoffee && hasBubble && hasOther;
                    
                    // If all three icons, use two-row layout (Bubble on top, Coffee + Other on bottom)
                    if (hasAllThree) {
                      return (
                        <div className="flex flex-col items-center justify-center w-full -mt-0.5">
                          {/* Row 1: Bubble centered & slightly higher */}
                          <div className="-mt-0.6 mb-0.5">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                              <CircleDot size={7} className="text-white" />
                            </div>
                          </div>
                          {/* Row 2: Coffee + Other */}
                          <div className="flex items-center justify-center gap-0.5">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                              <Coffee size={7} className="text-white" />
                            </div>
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <CupSoda size={7} className="text-white" />
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // If only two icons, display them in a single row
                    return (
                      <div className="flex items-center justify-center gap-0.5 -mt-0.6">
                        {hasCoffee && (
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <Coffee size={7} className="text-white" />
                          </div>
                        )}
                        {hasBubble && (
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                            <CircleDot size={7} className="text-white" />
                          </div>
                        )}
                        {hasOther && (
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <CupSoda size={7} className="text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-6 shadow-sm border border-orange-100">
        <h3 className="text-gray-600 mb-4 font-medium capitalize">
          {viewMode === 'day' ? 'Today' : viewMode === 'week' ? 'This Week' : viewMode === 'month' ? 'This Month' : 'This Year'}
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total cups</span>
            <span className="text-orange-600 font-bold text-lg">{totalCups} <span className="text-sm font-normal text-orange-400">cups</span></span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total spending</span>
            <span className="text-orange-600 font-bold text-lg">${totalSpent.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Average per cup</span>
            <span className="text-purple-600 font-bold text-lg">${avgPerCup.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Add Drink Modal */}
      {isAddModalOpen && (
        <AddDrinkModal
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedDate(null);
          }}
          onAdd={handleAddDrink}
          initialDate={selectedDate || undefined}
        />
      )}
    </div>
  );
}
