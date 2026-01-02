import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { KawaiiCup } from './KawaiiCup';
import { cupStore } from '../utils/cupStore';
import { cupIdToSkin, mockCups } from '../utils/cupUtils';

interface CupSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (cupId: number) => void;
}

export function CupSelectionModal({ open, onClose, onSelect }: CupSelectionModalProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const ownedCups = cupStore.getOwnedCups();
  const currentCup = cupStore.getCurrentCup();

  const ownedCupData = mockCups.filter(cup => ownedCups.includes(cup.id));

  const handleSelect = (cupId: number) => {
    cupStore.setCurrentCup(cupId);
    onSelect(cupId);
    onClose();
  };

  // Handle ESC key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!open) return null;

  // Check for reduced motion preference (safe for SSR)
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      style={{
        animation: prefersReducedMotion ? 'none' : 'fadeIn 0.2s ease-out',
      }}
      aria-modal="true"
      aria-labelledby="cup-selection-title"
      role="dialog"
    >
      <div
        ref={sheetRef}
        className="fixed bottom-0 inset-x-0 w-full
                    bg-white rounded-t-[2rem] shadow-2xl flex flex-col
                    h-[92vh]
                    sm:w-[480px] sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:inset-x-auto"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          animation: prefersReducedMotion
            ? 'none'
            : 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header - Stays Visible */}
        <div className="flex justify-between items-center px-6 pb-2 flex-shrink-0">
          <h2 id="cup-selection-title" className="text-xl font-bold text-gray-800">
            Choose Your Cup
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
            aria-label="Close"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 px-6 pb-4 flex-shrink-0">
          Select a cup to display on your home screen
        </p>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
          <div className="grid grid-cols-2 gap-3">
            {ownedCupData.map((cup) => {
              const skin = cupIdToSkin(cup.id);
              const isSelected = currentCup === cup.id;

              return (
                <button
                  key={cup.id}
                  onClick={() => handleSelect(cup.id)}
                  className={`relative bg-white rounded-xl p-3 border-2 transition-all hover:shadow-md active:scale-95 ${isSelected
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-100 hover:border-gray-200'
                    }`}
                >
                  {/* Cup Preview */}
                  <div className="flex items-center justify-center mb-2">
                    <KawaiiCup
                      fillLevel={0.65}
                      skin={skin}
                      size="sm"
                      showFace={true}
                    />
                  </div>

                  {/* Cup Name */}
                  <p className="text-xs font-medium text-gray-700 text-center line-clamp-1">
                    {cup.name}
                  </p>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

