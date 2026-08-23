import React from 'react';
import { X, Calendar, Check, Layers } from 'lucide-react';
import { WORKOUT_PLAN_DATA } from '../../data/workoutPlan';

interface WeekDaySelectorModalProps {
  currentCycle?: number;
  currentWeek: number;
  currentDayId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (week: number, dayId: string, cycle?: number) => void;
}

export const WeekDaySelectorModal: React.FC<WeekDaySelectorModalProps> = ({
  currentCycle = 1,
  currentWeek,
  currentDayId,
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedCycleNum, setSelectedCycleNum] = React.useState<number>(currentCycle);
  const [selectedWeekNum, setSelectedWeekNum] = React.useState<number>(currentWeek);

  React.useEffect(() => {
    setSelectedCycleNum(currentCycle);
    setSelectedWeekNum(currentWeek);
  }, [currentCycle, currentWeek, isOpen]);

  if (!isOpen) return null;

  const activeWeekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === selectedWeekNum) || WORKOUT_PLAN_DATA[0];

  const cycleOptions = Array.from({ length: Math.max(selectedCycleNum + 1, 3) }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-1 border border-hairline-strong max-w-lg w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-white">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-display uppercase tracking-wider text-white">Select Cycle, Week & Workout</h3>
              <p className="text-[11px] text-ink-subtle">Jump to any mesocycle or target training session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-subtle hover:text-white transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Training Cycle Switcher */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-white" />
              <span>Training Cycle (Mesocycle)</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-white uppercase">
              Cycle {selectedCycleNum} Active
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {cycleOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCycleNum(c)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider border transition shrink-0 active:scale-95 ${
                  selectedCycleNum === c
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink-muted hover:text-white'
                }`}
              >
                Cycle {c}
              </button>
            ))}
          </div>
        </div>

        {/* 10-Week Pill Switcher */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider">
            Select Training Week
          </span>
          <div className="grid grid-cols-5 gap-2">
            {WORKOUT_PLAN_DATA.map((w) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => setSelectedWeekNum(w.weekNumber)}
                className={`py-2.5 rounded-full text-xs font-mono font-bold border transition active:scale-95 ${
                  selectedWeekNum === w.weekNumber
                    ? 'bg-white text-black border-white'
                    : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink-muted hover:text-white'
                }`}
              >
                W{w.weekNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Phase Info */}
        <div className="text-xs px-3.5 py-2 bg-surface-2 border border-hairline text-ink-muted flex justify-between items-center font-mono">
          <span>{activeWeekPlan.phaseName}</span>
          {activeWeekPlan.isIntroWeek && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-white font-mono uppercase font-bold">
              Deload / Intro
            </span>
          )}
        </div>

        {/* Days List */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider">
            Workout Days in Week {selectedWeekNum}
          </span>
          <div className="space-y-2">
            {activeWeekPlan.days.map((d, index) => {
              const isSelected = selectedWeekNum === currentWeek && d.id === currentDayId;
              return (
                <button
                  key={d.id}
                  disabled={d.isRestDay}
                  onClick={() => {
                    if (!d.isRestDay) {
                      onSelect(selectedWeekNum, d.id, selectedCycleNum);
                      onClose();
                    }
                  }}
                  className={`w-full text-left p-3.5 border transition text-xs font-semibold uppercase tracking-wider flex items-center justify-between active:scale-95 ${
                    d.isRestDay
                      ? 'opacity-40 bg-surface-1/50 border-hairline text-ink-tertiary cursor-not-allowed'
                      : isSelected
                      ? 'bg-surface-2 border-white text-white'
                      : 'bg-surface-1 hover:bg-surface-2 border-hairline text-ink-muted hover:text-white cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface-3 border border-hairline flex items-center justify-center text-[10px] font-mono text-white font-bold">
                      {index + 1}
                    </span>
                    <span>{d.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
