import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Coffee, CircleDot, CupSoda, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { drinkStore, DrinkLog } from '../utils/drinkStore';
import { AddDrinkModal } from './AddDrinkModal';
import { coinStore } from '../utils/coinStore';
import { budgetStore } from '../utils/budgetStore';

type ViewMode = 'day' | 'week' | 'month' | 'year';

export function OverviewScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [monthSpent, setMonthSpent] = useState(0);

  useEffect(() => {
    // Check for new month (monthly spending will reset automatically via getCurrentMonthSpent)
    drinkStore.checkNewMonth();
    
    const loadLogs = () => {
      setLogs(drinkStore.getLogs());
      setMonthlyBudget(budgetStore.getMonthlyBudget());
      setMonthSpent(drinkStore.getCurrentMonthSpent());
    };
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
    // Check for new month
    drinkStore.checkNewMonth();
    setLogs(drinkStore.getLogs());
    setMonthlyBudget(budgetStore.getMonthlyBudget());
    setMonthSpent(drinkStore.getCurrentMonthSpent());
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
    
    // Calculate total spending after adding this drink
    const totalSpendingAfter = monthSpent + price;
    const isOverBudget = monthlyBudget && monthlyBudget > 0 && totalSpendingAfter > monthlyBudget;
    
    // Determine coin reward: 20 if over budget, 100 if within budget
    const coinReward = isOverBudget ? 20 : 100;
    
    drinkStore.addLog({
      type: logType,
      amount: price,
      date: date || drinkStore.formatDate(new Date()),
      name: type !== 'other' ? name : undefined,
      customName: type === 'other' ? customName : undefined
    });
    
    // Add coins based on budget status
    coinStore.addCoins(coinReward);
    
    // Show toast with appropriate message
    toast.success(`You've got ${coinReward} coins!`, {
      icon: <Coins size={20} className={isOverBudget ? 'text-orange-600' : 'text-yellow-600'} />,
    });
    
    // Refresh logs and budget data
    setLogs(drinkStore.getLogs());
    setMonthlyBudget(budgetStore.getMonthlyBudget());
    setMonthSpent(drinkStore.getCurrentMonthSpent());
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

  // Compute Top 3 categories based on filteredLogs (respects viewMode)
  const topCategories = useMemo(() => {
    if (filteredLogs.length === 0) {
      return [];
    }

    // Count by category (type)
    const categoryCounts = new Map<'COFFEE' | 'BUBBLE' | 'OTHER', number>();
    filteredLogs.forEach(log => {
      const existing = categoryCounts.get(log.type) || 0;
      categoryCounts.set(log.type, existing + 1);
    });

    const typeLabels = {
      'COFFEE': 'Coffee',
      'BUBBLE': 'Bubble Tea',
      'OTHER': 'Other',
    };

    // Convert to array, sort by count desc, take top 3
    return Array.from(categoryCounts.entries())
      .map(([type, count]) => ({
        type,
        label: typeLabels[type],
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [filteredLogs]);

  const maxCount = Math.max(...topCategories.map(c => Number(c.count) || 0), 1);

  // Compute top names by category based on filteredLogs (respects viewMode, only logs with name/customName)
  const topNamesByType = useMemo(() => {
    const result = new Map<'COFFEE' | 'BUBBLE' | 'OTHER', Array<{ name: string; count: number }>>();
    result.set('COFFEE', []);
    result.set('BUBBLE', []);
    result.set('OTHER', []);

    // Helper to get name from log (only if user provided)
    const getName = (log: DrinkLog): string | null => {
      if (log.name && log.name.trim()) return log.name.trim();
      if (log.customName && log.customName.trim()) return log.customName.trim();
      return null;
    };

    // Group by type and normalized name (lowercase for grouping, preserve original casing)
    const grouped = new Map<string, Map<string, { count: number; originalName: string }>>();

    filteredLogs.forEach(log => {
      const name = getName(log);
      if (!name) return; // Skip logs without name/customName

      if (!grouped.has(log.type)) {
        grouped.set(log.type, new Map());
      }
      const typeMap = grouped.get(log.type)!;
      const normalizedKey = name.toLowerCase();
      const existing = typeMap.get(normalizedKey);

      if (existing) {
        existing.count += 1;
      } else {
        typeMap.set(normalizedKey, { count: 1, originalName: name });
      }
    });

    // Convert to arrays, sort and take top 3 for each type
    grouped.forEach((nameMap, type) => {
      const names = Array.from(nameMap.values())
        .map(({ originalName, count }) => ({ name: originalName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      result.set(type as 'COFFEE' | 'BUBBLE' | 'OTHER', names);
    });

    return result;
  }, [filteredLogs]);

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
  const [expandedType, setExpandedType] = useState<'COFFEE' | 'BUBBLE' | 'OTHER' | null>(null);

  // Auto-collapse expanded category if it has no names in current filteredLogs
  useEffect(() => {
    if (expandedType) {
      const topNames = topNamesByType.get(expandedType) || [];
      if (topNames.length === 0) {
        setExpandedType(null);
      }
    }
  }, [expandedType, topNamesByType]);



  return (
    <div className="flex flex-col px-4 py-4 min-h-full">
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
      <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-6 shadow-sm border border-orange-100 mb-6">
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

      {/* Top 3 Card */}
      <div className="rounded-3xl bg-white/70 border border-white/60 shadow-sm backdrop-blur-sm mb-6 overflow-hidden">
        {/* Content */}
        {topCategories.length === 0 ? (
          <div className="px-6 pb-6">
            <p className="text-gray-400 text-sm text-center py-8">
              No drinks logged {viewMode === 'day' ? 'today' : viewMode === 'week' ? 'this week' : viewMode === 'month' ? 'this month' : 'this year'} yet
            </p>
          </div>
        ) : (
          <div>
            {topCategories.map((category, index) => {
              const raw = (Number(category.count) || 0) / maxCount;
              const progress = Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0;
              const topNames = topNamesByType.get(category.type) || [];
              const hasNamesToExpand = topNames.length > 0;

              // Get icon based on type (matching AddDrinkModal)
              const getIcon = () => {
                if (category.type === 'COFFEE') {
                  return <Coffee size={20} className="text-orange-500" />;
                } else if (category.type === 'BUBBLE') {
                  return <CircleDot size={20} className="text-pink-500" />;
                } else {
                  return <CupSoda size={20} className="text-blue-500" />;
                }
              };

              const isExpanded = expandedType === category.type;

              return (
                <div key={category.type}>
                  <button
                    type="button"
                    onClick={() => {
                      if (hasNamesToExpand) {
                        setExpandedType(isExpanded ? null : category.type);
                      }
                    }}
                    disabled={!hasNamesToExpand}
                    className={`w-full p-0 bg-transparent flex items-center justify-start gap-3 py-4 px-6 !text-left ${
                      hasNamesToExpand ? '' : 'cursor-default'
                    }`}
                    style={{ textAlign: 'left' }}
                  >
                    {/* Left: Icon */}
                    <div className="flex-shrink-0 mt-[2px]">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
                        {getIcon()}
                      </div>
                    </div>

                    {/* Middle: Name + Progress bar */}
                    <div className="flex-1 min-w-0 !text-left">
                      <div className="text-[17px] font-semibold text-gray-900 truncate leading-none">
                        {category.label}
                      </div>

                      {/* Progress (colored bar only) */}
                      <div className="mt-3">
                        <div
                          style={{
                            height: 5,
                            width: `${progress * 100}%`,
                            minWidth: progress > 0 ? 14 : 0,
                            background:
                              category.type === 'COFFEE'
                                ? '#F97316'
                                : category.type === 'BUBBLE'
                                  ? '#EC4899'
                                  : '#3B82F6',
                            borderRadius: 9999,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Right: Count + Chevron (always shown) */}
                    <div className="flex items-center gap-2 flex-shrink-0 mt-[1px]">
                      <span className="text-sm text-gray-400 whitespace-nowrap">
                        {category.count} {category.count === 1 ? 'cup' : 'cups'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && hasNamesToExpand && (() => {
                    const namesMaxCount = Math.max(...topNames.map(n => n.count), 1);
                    const progressColor = category.type === 'COFFEE' ? '#F97316' : category.type === 'BUBBLE' ? '#EC4899' : '#3B82F6';

                    return (
                      <div className="bg-white/40">
                        {topNames.map((nameItem, nameIndex) => {
                          const nameProgress = nameItem.count / namesMaxCount;
                          return (
                            <div key={`${category.type}-${nameItem.name}-${nameIndex}`}>
                              <div className="flex items-center gap-3 py-2.5 px-6">
                                {/* Spacer to align with Name text (icon width 40px + gap 12px = 52px) */}
                                <div className="flex-shrink-0" style={{ width: 40 }}></div>
                                {/* Name + Progress */}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-700 truncate leading-none">
                                    {nameItem.name.charAt(0).toUpperCase() + nameItem.name.slice(1)}
                                  </div>
                                  {/* Optional: thin progress bar (colored bar only) */}
                                  <div className="mt-1.5">
                                    <div
                                      style={{
                                        height: 3,
                                        width: `${nameProgress * 100}%`,
                                        minWidth: nameProgress > 0 ? 8 : 0,
                                        background: progressColor,
                                        borderRadius: 9999,
                                      }}
                                    />
                                  </div>
                                </div>
                                {/* Count */}
                                <div className="flex-shrink-0">
                                  <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {nameItem.count} {nameItem.count === 1 ? 'cup' : 'cups'}
                                  </span>
                                </div>
                              </div>
                              {nameIndex < topNames.length - 1 && (
                                <div className="border-t border-gray-200/40" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {index < topCategories.length - 1 && <div className="border-t border-gray-200/60" />}
                </div>

              );

            })}
          </div>
        )
        }
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
