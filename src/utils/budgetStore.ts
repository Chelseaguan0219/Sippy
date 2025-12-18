const STORAGE_KEY = 'cup_habit_monthly_budget';

export const budgetStore = {
  getMonthlyBudget(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (!item) return null;
      const value = parseFloat(item);
      return isNaN(value) || value <= 0 ? null : value;
    } catch (e) {
      console.error('Failed to parse budget', e);
      return null;
    }
  },

  setMonthlyBudget(value: number | null): void {
    if (typeof window === 'undefined') return;
    if (value === null || value <= 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value.toString());
    }
  }
};

