import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Plus, Minus, Minimize2, Maximize2, Sparkles } from 'lucide-react';

interface RestTimerProps {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
  nextExerciseName?: string;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 120,
  isOpen,
  onClose,
  nextExerciseName,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [totalTime, setTotalTime] = useState<number>(initialSeconds);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setTotalTime(initialSeconds);
    setIsRunning(true);
    setIsMinimized(false);
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Haptic vibration on completion (no audio)
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 300]);
        }
      } catch {
        // Haptics not supported / disabled
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const isFinished = timeLeft === 0;

  const handleAdjustTime = (delta: number) => {
    setTimeLeft((prev) => {
      const newTime = Math.max(0, prev + delta);
      if (newTime > totalTime) setTotalTime(newTime);
      return newTime;
    });
    setIsRunning(true);
  };

  const presetTimes = [60, 90, 120, 180, 240];

  // Minimized floating pill mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div
          onClick={() => setIsMinimized(false)}
          className="cursor-pointer flex items-center gap-2.5 px-3.5 py-2 rounded-pill bg-surface-1/95 border border-primary/40 shadow-2xl backdrop-blur-md hover:border-primary transition group"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isFinished ? 'bg-semantic-success animate-bounce' : isRunning ? 'bg-primary animate-pulse' : 'bg-ink-subtle'}`} />
          <span className="font-mono font-bold text-sm text-ink tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1 rounded text-ink-subtle hover:text-ink transition"
            title="Expand Timer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-surface-1/95 border border-hairline-strong rounded-xl p-4 shadow-2xl space-y-3 relative overflow-hidden backdrop-blur-xl">
        {/* Progress Bar Line */}
        <div
          className={`absolute bottom-0 left-0 h-1 transition-all duration-300 ${isFinished ? 'bg-semantic-success' : 'bg-primary'}`}
          style={{ width: `${progressPercent}%` }}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-semantic-success animate-ping' : isRunning ? 'bg-primary animate-pulse' : 'bg-ink-subtle'}`} />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-subtle font-semibold">
              {isFinished ? 'Rest Finished · Ready for Next Set' : 'Resting Interval'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-2 transition"
              title="Minimize to floating pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-2 transition"
              title="Dismiss timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Display and Steppers */}
        <div className="flex items-center justify-between gap-2">
          {/* Time digits */}
          <div className="flex items-center gap-2">
            <div className={`text-3xl sm:text-4xl font-mono font-bold tracking-tight ${isFinished ? 'text-semantic-success' : 'text-ink'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Quick +/- 15s / 30s adjustment buttons */}
            <div className="flex items-center gap-1 pl-1">
              <button
                type="button"
                onClick={() => handleAdjustTime(-15)}
                className="px-1.5 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-[10px] font-mono text-ink-subtle hover:text-ink transition flex items-center"
                title="Subtract 15s"
              >
                <Minus className="w-2.5 h-2.5 mr-0.5" /> 15s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustTime(+30)}
                className="px-1.5 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-[10px] font-mono text-primary-hover hover:text-white transition flex items-center font-bold"
                title="Add 30s"
              >
                <Plus className="w-2.5 h-2.5 mr-0.5" /> 30s
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="p-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary font-medium transition shadow-sm"
              title={isRunning ? 'Pause' : 'Resume'}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeLeft(totalTime);
                setIsRunning(true);
              }}
              className="p-2.5 rounded-md bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Next Exercise / Habit Cue Banner */}
        {nextExerciseName && (
          <div className="flex items-center gap-1.5 text-[11px] text-ink-subtle font-mono truncate px-2.5 py-1 rounded bg-surface-2/60 border border-hairline">
            <Sparkles className="w-3 h-3 text-primary-hover shrink-0" />
            <span className="text-ink-tertiary">Next:</span>
            <span className="text-ink font-semibold truncate">{nextExerciseName}</span>
          </div>
        )}

        {/* Presets */}
        <div className="flex gap-1.5 pt-0.5">
          {presetTimes.map((secs) => (
            <button
              key={secs}
              type="button"
              onClick={() => {
                setTotalTime(secs);
                setTimeLeft(secs);
                setIsRunning(true);
              }}
              className={`flex-1 py-1 rounded text-[11px] font-mono border transition ${
                totalTime === secs
                  ? 'bg-primary/20 border-primary text-primary-hover font-bold'
                  : 'bg-surface-2 border-hairline text-ink-subtle hover:text-ink'
              }`}
            >
              {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
