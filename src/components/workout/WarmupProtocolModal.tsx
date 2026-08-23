import React from 'react';
import { X, Flame } from 'lucide-react';

interface WarmupProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WarmupProtocolModal: React.FC<WarmupProtocolModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4 animate-backdrop-fade">
      <div className="bg-surface-1 border border-hairline-strong max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl animate-modal-pop">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-sale">
              <Flame className="w-4 h-4 text-sale" />
            </div>
            <div>
              <h3 className="text-lg font-display uppercase tracking-wider text-white">Warm-Up Protocol</h3>
              <p className="text-[11px] text-ink-subtle">Scientific Acclimation & Injury Prevention</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-subtle hover:text-white apple-press cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* General Warm-Up Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle font-mono">
            1. General Warm-Up (5–10 Mins)
          </h4>
          <div className="bg-surface-2 border border-hairline divide-y divide-hairline text-xs font-mono">
            <div className="p-3 flex justify-between">
              <span className="text-ink-muted">Light cardio (Treadmill / Stairmaster)</span>
              <span className="text-white font-bold">5–10 min</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-ink-muted">Arm Swings</span>
              <span className="text-white">10 reps / side</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-ink-muted">Arm Circles</span>
              <span className="text-white">10 reps / side</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-ink-muted">Front-to-Back Leg Swings</span>
              <span className="text-white">10 reps / side</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-ink-muted">Side-to-Side Leg Swings</span>
              <span className="text-white">10 reps / side</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-ink-muted">Cable External Rotation (Optional)</span>
              <span className="text-white">15 reps / side</span>
            </div>
          </div>
        </div>

        {/* Exercise Specific Warm-Up */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle font-mono">
            2. Exercise-Specific Pyramid
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-3.5 bg-surface-2 border border-hairline space-y-1">
              <span className="font-semibold text-white block uppercase tracking-wider">1 Warm-Up Set Listed:</span>
              <p className="text-ink-muted font-mono">~60% planned weight for 6–10 reps</p>
            </div>
            <div className="p-3.5 bg-surface-2 border border-hairline space-y-1">
              <span className="font-semibold text-white block uppercase tracking-wider">2 Warm-Up Sets Listed (Mini Pyramid):</span>
              <p className="text-ink-muted font-mono">• Set 1: ~50% planned weight for 6–10 reps</p>
              <p className="text-ink-muted font-mono">• Set 2: ~70% planned weight for 4–6 reps</p>
            </div>
            <div className="p-3.5 bg-surface-2 border border-hairline space-y-1">
              <span className="font-semibold text-white block uppercase tracking-wider">3 Warm-Up Sets Listed (Full Pyramid):</span>
              <p className="text-ink-muted font-mono">• Set 1: ~45% planned weight for 6–10 reps</p>
              <p className="text-ink-muted font-mono">• Set 2: ~65% planned weight for 4–6 reps</p>
              <p className="text-ink-muted font-mono">• Set 3: ~85% planned weight for 3–4 reps</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white hover:bg-neutral-200 text-black rounded-full text-xs font-bold uppercase tracking-wider apple-press shadow-md cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
