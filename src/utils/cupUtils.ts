import { CupSkin } from '../types';

// Cup data matching StoreScreen
export interface CupData {
  id: number;
  name: string;
  price: number;
  category: 'classic' | 'special' | 'limited';
  color: string;
  gradient: string;
}

export const mockCups: CupData[] = [
  { id: 1, name: 'Classic White', price: 0, category: 'classic', color: '#FFFFFF', gradient: 'from-amber-50 to-amber-100' },
  { id: 2, name: 'Minimal Glass', price: 800, category: 'classic', color: '#E0F2FE', gradient: 'from-sky-50 to-sky-100' },
  { id: 3, name: 'Peach Blush', price: 1000, category: 'classic', color: '#FECACA', gradient: 'from-orange-100 to-rose-200' },
  { id: 4, name: 'Matcha Cup', price: 1200, category: 'classic', color: '#BBF7D0', gradient: 'from-green-100 to-emerald-200' },
  { id: 5, name: 'Lavender Dream', price: 1500, category: 'special', color: '#DDD6FE', gradient: 'from-purple-100 to-violet-200' },
  { id: 6, name: 'Sunset Glow', price: 1500, category: 'special', color: '#FED7AA', gradient: 'from-yellow-100 to-orange-200' },
  { id: 7, name: 'Ocean Breeze', price: 1800, category: 'special', color: '#A5F3FC', gradient: 'from-cyan-100 to-teal-200' },
  { id: 8, name: 'Rose Gold', price: 2000, category: 'special', color: '#FBCFE8', gradient: 'from-pink-100 to-rose-200' },
  { id: 9, name: 'Holiday Special', price: 3000, category: 'limited', color: '#FCA5A5', gradient: 'from-red-200 to-green-200' },
  { id: 10, name: 'Galaxy Cup', price: 3500, category: 'limited', color: '#C4B5FD', gradient: 'from-indigo-200 to-purple-300' },
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
  'from-amber-50 to-amber-100': '#fef3c7', // amber-50
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

export function getCupById(cupId: number): CupData | undefined {
  return mockCups.find(cup => cup.id === cupId);
}

export function cupIdToSkin(cupId: number): CupSkin {
  const cup = getCupById(cupId);
  if (!cup) {
    // Default to Classic White if cup not found
    return {
      id: 'default',
      colors: {
        straw: '#fda4af',
        glass: '#fef3c7',
        liquid: '#fcd34d',
        lid: '#ffffff'
      },
      liquidGradient: {
        from: '#f59e0b',
        to: '#fde68a'
      }
    };
  }

  const liquidColor = gradientToLiquidColor[cup.gradient] || '#fcd34d';
  const glassColor = gradientToGlassColor[cup.gradient] || '#fef3c7';
  const liquidGradient = gradientToLiquidGradient[cup.gradient];

  return {
    id: `cup-${cupId}`,
    colors: {
      straw: '#fda4af', // rose-300 - same as HomeScreen
      glass: glassColor,
      liquid: liquidColor,
      lid: '#ffffff'
    },
    liquidGradient
  };
}

