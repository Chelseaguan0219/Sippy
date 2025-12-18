import React from 'react';
import { Coffee, CircleDot, CupSoda } from 'lucide-react';

export type DrinkType = 'COFFEE' | 'BUBBLE' | 'OTHER';

export interface DrinkIconProps {
  type: DrinkType;
  size?: number;
  className?: string;
}

export function DrinkIcon({ type, size = 20, className = '' }: DrinkIconProps) {
  switch (type) {
    case 'COFFEE':
      return <Coffee size={size} className={className} />;
    case 'BUBBLE':
      return <CircleDot size={size} className={className} />;
    case 'OTHER':
      return <CupSoda size={size} className={className} />;
    default:
      return null;
  }
}

export function getDrinkIconColor(type: DrinkType, isActive: boolean = true): string {
  if (!isActive) return 'text-gray-400';
  
  switch (type) {
    case 'COFFEE':
      return 'text-orange-500';
    case 'BUBBLE':
      return 'text-pink-500';
    case 'OTHER':
      return 'text-blue-500';
    default:
      return 'text-gray-400';
  }
}

export function getDrinkIconBg(type: DrinkType): string {
  switch (type) {
    case 'COFFEE':
      return 'bg-gradient-to-br from-orange-400 to-orange-600';
    case 'BUBBLE':
      return 'bg-gradient-to-br from-purple-400 to-pink-500';
    case 'OTHER':
      return 'bg-gradient-to-br from-blue-400 to-blue-600';
    default:
      return 'bg-gray-400';
  }
}

export function getDrinkTypeLabel(type: DrinkType, customName?: string): string {
  if (type === 'OTHER') {
    return customName ? `Other · ${customName}` : 'Other drink';
  }
  return type === 'COFFEE' ? 'Coffee' : 'Bubble Tea';
}

