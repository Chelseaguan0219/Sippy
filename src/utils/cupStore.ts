const OWNED_CUPS_STORAGE_KEY = 'cup_habit_owned_cups';
const CURRENT_CUP_STORAGE_KEY = 'cup_habit_current_cup';

export const cupStore = {
  getOwnedCups(): number[] {
    if (typeof window === 'undefined') return [1]; // Default: Classic White is owned
    try {
      const item = localStorage.getItem(OWNED_CUPS_STORAGE_KEY);
      return item ? JSON.parse(item) : [1]; // Default: Classic White (id: 1) is owned
    } catch (e) {
      console.error('Failed to parse owned cups', e);
      return [1];
    }
  },

  isOwned(cupId: number): boolean {
    const owned = this.getOwnedCups();
    return owned.includes(cupId);
  },

  addOwnedCup(cupId: number): void {
    const owned = this.getOwnedCups();
    if (!owned.includes(cupId)) {
      const updated = [...owned, cupId];
      localStorage.setItem(OWNED_CUPS_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  removeOwnedCup(cupId: number): void {
    const owned = this.getOwnedCups();
    const updated = owned.filter(id => id !== cupId);
    localStorage.setItem(OWNED_CUPS_STORAGE_KEY, JSON.stringify(updated));
  },

  resetOwnedCups(): void {
    localStorage.setItem(OWNED_CUPS_STORAGE_KEY, JSON.stringify([1])); // Reset to only Classic White
  },

  getCurrentCup(): number {
    if (typeof window === 'undefined') return 1; // Default: Classic White
    try {
      const item = localStorage.getItem(CURRENT_CUP_STORAGE_KEY);
      return item ? JSON.parse(item) : 1; // Default: Classic White (id: 1)
    } catch (e) {
      console.error('Failed to parse current cup', e);
      return 1;
    }
  },

  setCurrentCup(cupId: number): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CURRENT_CUP_STORAGE_KEY, JSON.stringify(cupId));
    } catch (e) {
      console.error('Failed to save current cup', e);
    }
  }
};

