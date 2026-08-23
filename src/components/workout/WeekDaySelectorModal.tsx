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
      <div className="bg-surface-1 border border-hairline-strong rounded-xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-ink">Select Cycle, Week & Workout Day</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-2 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Training Cycle Switcher */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-primary-hover" />
              <span>Training Cycle (Mesocycle)</span>
            </span>
            <span className="text-[10px] font-mono text-primary-hover">
              Cycle {selectedCycleNum} Active
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {cycleOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCycleNum(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold border transition shrink-0 ${
                  selectedCycleNum === c
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink-muted'
                }`}
              >
                Cycle {c}
              </button>
            ))}
          </div>
        </div>

        {/* 10-Week Pill Switcher */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider">
            Select Training Week
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {WORKOUT_PLAN_DATA.map((w) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => setSelectedWeekNum(w.weekNumber)}
                className={`py-2 rounded text-xs font-mono font-medium border transition ${
                  selectedWeekNum === w.weekNumber
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink-muted'
                }`}
              >
                W{w.weekNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Phase Info */}
        <div className="text-xs px-3 py-1.5 rounded bg-surface-2 border border-hairline text-ink-subtle flex justify-between items-center">
          <span>{activeWeekPlan.phaseName}</span>
          {activeWeekPlan.isIntroWeek && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-primary-hover font-mono uppercase">
              Deload / Intro
            </span>
          )}
        </div>

        {/* Days List */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider">
            Workout Days in Week {selectedWeekNum}
          </span>
          <div className="space-y-1.5">
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
                  className={`w-full text-left p-3 rounded-md border transition text-xs font-medium flex items-center justify-between ${
                    d.isRestDay
                      ? 'opacity-40 bg-surface-1/50 border-hairline text-ink-tertiary cursor-not-allowed'
                      : isSelected
                      ? 'bg-surface-2 border-primary/50 text-ink ring-1 ring-primary/40'
                      : 'bg-surface-1 hover:bg-surface-2 border-hairline text-ink-muted hover:text-ink cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-surface-2 border border-hairline flex items-center justify-center text-[10px] font-mono text-ink-subtle">
                      {index + 1}
                    </span>
                    <span>{d.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
