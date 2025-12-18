export interface DrinkLog {
  id: string;
  type: 'COFFEE' | 'BUBBLE' | 'OTHER';
  amount: number; // Price
  date: string; // YYYY-MM-DD
  createdAt: number; // Timestamp
  name?: string; // Optional name (for coffee/bubble)
  customName?: string; // Custom name for Other type
}

const STORAGE_KEY = 'cup_habit_logs';
const LAST_OPEN_DATE_KEY = 'cup_habit_last_open_date';

export const drinkStore = {
  getLogs(): DrinkLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (e) {
      console.error('Failed to parse logs', e);
      return [];
    }
  },

  addLog(log: Omit<DrinkLog, 'id' | 'createdAt'>) {
    const logs = this.getLogs();
    // Normalize date to YYYY-MM-DD format
    const normalizedDate = log.date 
      ? log.date.slice(0, 10) 
      : this.formatDate(new Date());
    
    const newLog: DrinkLog = {
      ...log,
      date: normalizedDate, // Ensure date is in YYYY-MM-DD format
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const updatedLogs = [...logs, newLog];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    return newLog;
  },

  clearLogs() {
    localStorage.removeItem(STORAGE_KEY);
  },

  getTodayLogs(): DrinkLog[] {
    const logs = this.getLogs();
    const today = this.formatDate(new Date()); // YYYY-MM-DD
    return logs.filter((log) => log.date === today);
  },

  getLogsByDateRange(startDate: Date, endDate: Date): DrinkLog[] {
    const logs = this.getLogs();
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);
    
    // Simple string comparison works for YYYY-MM-DD
    return logs.filter(log => log.date >= start && log.date <= end);
  },
  
  // Helper to format date as YYYY-MM-DD (local time)
  // Ensures consistent format: YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Check if it's a new day and update lastOpenDate
  // Returns true if it's a new day (or first time opening)
  checkNewDayAndReset(): boolean {
    if (typeof window === 'undefined') return false;
    
    const today = this.formatDate(new Date());
    const lastOpenDate = localStorage.getItem(LAST_OPEN_DATE_KEY);
    
    if (!lastOpenDate || lastOpenDate !== today) {
      // It's a new day (or first time opening)
      localStorage.setItem(LAST_OPEN_DATE_KEY, today);
      return true;
    }
    
    return false;
  },

  // Get total spending for current month
  getCurrentMonthSpent(): number {
    const logs = this.getLogs();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get first and last day of current month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = this.formatDate(firstDay);
    const endDate = this.formatDate(lastDay);
    
    const monthLogs = logs.filter(log => {
      const logDate = log.date ? log.date.slice(0, 10) : '';
      return logDate >= startDate && logDate <= endDate;
    });
    
    return monthLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
  }
};
