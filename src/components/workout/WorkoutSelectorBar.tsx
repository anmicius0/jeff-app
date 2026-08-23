import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { WORKOUT_PLAN_DATA } from '../../data/workoutPlan';
import { WorkoutDay } from '../../types/workout';
import { getTodayLocalDateString } from '../../utils/storage';

interface WorkoutSelectorBarProps {
  currentCycle: number;
  currentWeek: number;
  currentDayId: string;
  currentWeekDays: WorkoutDay[];
  selectedDate: string;
  showManualDateInput: boolean;
  onStepWeek: (delta: number) => void;
  onSelectWeek: (week: number, cycle: number) => void;
  onSelectDay: (dayId: string) => void;
  onToggleManualDateInput: () => void;
  onOpenWeekSelector: () => void;
  onSelectDate: (dateStr: string) => void;
}

export const WorkoutSelectorBar: React.FC<WorkoutSelectorBarProps> = ({
  currentCycle,
  currentWeek,
  currentDayId,
  currentWeekDays,
  selectedDate,
  showManualDateInput,
  onStepWeek,
  onSelectWeek,
  onSelectDay,
  onToggleManualDateInput,
  onOpenWeekSelector,
  onSelectDate,
}) => {
  return (
    <div className="bg-surface-1 border border-hairline p-3 sm:p-4 space-y-3">
      {/* Week Stepper & Direct 1-10 Pills */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onStepWeek(-1)}
            disabled={currentWeek <= 1 && currentCycle <= 1}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-2 hover:bg-surface-3 disabled:opacity-30 border border-hairline text-white apple-press flex items-center justify-center cursor-pointer select-none"
            title="Previous Week"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenWeekSelector}
            className="text-[11px] sm:text-xs font-mono font-bold px-2.5 sm:px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-hairline text-white whitespace-nowrap apple-press cursor-pointer uppercase tracking-wider select-none"
            title="Change Cycle or Week"
          >
            C{currentCycle}·W{currentWeek}
          </button>
          <button
            type="button"
            onClick={() => onStepWeek(+1)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-2 hover:bg-surface-3 disabled:opacity-30 border border-hairline text-white apple-press flex items-center justify-center cursor-pointer select-none"
            title="Next Week"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* 10-Week Quick Selector Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5 min-w-0 flex-1 px-1">
          {WORKOUT_PLAN_DATA.map((w) => (
            <button
              key={w.weekNumber}
              type="button"
              onClick={() => onSelectWeek(w.weekNumber, currentCycle)}
              className={`px-3 py-1 rounded-full text-xs font-mono border apple-press shrink-0 cursor-pointer select-none ${
                currentWeek === w.weekNumber
                  ? 'bg-white text-black border-white font-bold shadow-sm'
                  : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink-subtle hover:text-white'
              }`}
            >
              W{w.weekNumber}
            </button>
          ))}
        </div>

        {/* Date manual switch button */}
        <button
          type="button"
          onClick={onToggleManualDateInput}
          className={`w-8 h-8 rounded-full border apple-press shrink-0 flex items-center justify-center cursor-pointer select-none ${
            showManualDateInput
              ? 'bg-white text-black border-white shadow-sm'
              : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink-subtle hover:text-white'
          }`}
          title="Manual Workout Date"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optional Date Selector Row */}
      {showManualDateInput && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-surface-2 border border-hairline text-xs font-mono animate-in fade-in">
          <span className="text-ink-subtle flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white" /> Session Date:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-surface-3 border border-hairline-strong text-white rounded-md px-2.5 py-1 text-xs outline-none apple-focus-ring"
            />
            <button
              type="button"
              onClick={() => onSelectDate(getTodayLocalDateString())}
              className="px-3 py-1 rounded-full bg-surface-3 hover:bg-surface-4 text-white text-xs font-medium uppercase tracking-wider apple-press cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {/* Day Selector Buttons for Active Week (Filter chips) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-hairline py-0.5">
        {currentWeekDays.map((d) => {
          const isSelected = d.id === currentDayId;
          return (
            <button
              key={d.id}
              disabled={d.isRestDay}
              type="button"
              onClick={() => onSelectDay(d.id)}
              className={`min-h-[38px] shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border select-none ${
                d.isRestDay
                  ? 'opacity-40 bg-surface-1 border-hairline text-ink-tertiary cursor-not-allowed'
                  : isSelected
                  ? 'bg-white text-black border-white shadow-sm font-bold apple-press'
                  : 'bg-surface-2 hover:bg-surface-3 active:bg-surface-4 border-hairline text-ink-muted hover:text-white cursor-pointer apple-press'
              }`}
            >
              {d.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
