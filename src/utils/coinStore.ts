const COIN_STORAGE_KEY = 'cup_habit_coins';
const DEFAULT_COINS = 1000; // Starting coins

export const coinStore = {
  getCoins(): number {
    if (typeof window === 'undefined') return DEFAULT_COINS;
    try {
      const item = localStorage.getItem(COIN_STORAGE_KEY);
      return item ? parseInt(item, 10) : DEFAULT_COINS;
    } catch (e) {
      console.error('Failed to parse coins', e);
      return DEFAULT_COINS;
    }
  },

  addCoins(amount: number): number {
    const current = this.getCoins();
    const newTotal = current + amount;
    localStorage.setItem(COIN_STORAGE_KEY, newTotal.toString());
    return newTotal;
  },

  spendCoins(amount: number): boolean {
    const current = this.getCoins();
    if (current < amount) return false;
    localStorage.setItem(COIN_STORAGE_KEY, (current - amount).toString());
    return true;
  },

  resetCoins() {
    localStorage.setItem(COIN_STORAGE_KEY, DEFAULT_COINS.toString());
  }
};

