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
    <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-1 border border-hairline-strong rounded-xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold text-ink">Warm-Up Protocol</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-2 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* General Warm-Up Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            1. General Warm-Up (5–10 Mins)
          </h4>
          <div className="rounded-md bg-surface-2 border border-hairline divide-y divide-hairline text-xs font-mono">
            <div className="p-2.5 flex justify-between">
              <span className="text-ink-muted">Light cardio (Treadmill / Stairmaster)</span>
              <span className="text-ink font-semibold">5–10 min</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-ink-muted">Arm Swings</span>
              <span className="text-ink">10 reps / side</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-ink-muted">Arm Circles</span>
              <span className="text-ink">10 reps / side</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-ink-muted">Front-to-Back Leg Swings</span>
              <span className="text-ink">10 reps / side</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-ink-muted">Side-to-Side Leg Swings</span>
              <span className="text-ink">10 reps / side</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-ink-muted">Cable External Rotation (Optional)</span>
              <span className="text-ink">15 reps / side</span>
            </div>
          </div>
        </div>

        {/* Exercise Specific Warm-Up */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            2. Exercise-Specific Pyramid
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-md bg-surface-2 border border-hairline space-y-1">
              <span className="font-semibold text-primary-hover block">1 Warm-Up Set Listed:</span>
              <p className="text-ink-muted font-mono">~60% planned weight for 6–10 reps</p>
            </div>
            <div className="p-3 rounded-md bg-surface-2 border border-hairline space-y-1">
              <span className="font-semibold text-primary-hover block">2 Warm-Up Sets Listed (Mini Pyramid):</span>
              <p className="text-ink-muted font-mono">• Set 1: ~50% planned weight for 6–10 reps</p>
              <p className="text-ink-muted font-mono">• Set 2: ~70% planned weight for 4–6 reps</p>
            </div>
            <div className="p-3 rounded-md bg-surface-2 border border-hairline space-y-1">
              <span className="font-semibold text-primary-hover block">3 Warm-Up Sets Listed (Full Pyramid):</span>
              <p className="text-ink-muted font-mono">• Set 1: ~45% planned weight for 6–10 reps</p>
              <p className="text-ink-muted font-mono">• Set 2: ~65% planned weight for 4–6 reps</p>
              <p className="text-ink-muted font-mono">• Set 3: ~85% planned weight for 3–4 reps</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2 bg-surface-2 hover:bg-surface-3 border border-hairline text-ink rounded-md text-xs font-medium transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
