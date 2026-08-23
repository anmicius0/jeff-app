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
      <div className="fixed bottom-5 right-5 z-50 animate-fade-slide-up duration-200">
        <div
          onClick={() => setIsMinimized(false)}
          className="cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-full bg-surface-2 border border-white/20 shadow-2xl backdrop-blur-md hover:border-white transition-all duration-200 active:scale-95 ease-spring-snappy group"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isFinished ? 'bg-success animate-bounce' : isRunning ? 'bg-white animate-pulse' : 'bg-ink-subtle'}`} />
          <span className="font-display tracking-widest text-lg text-white font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="w-7 h-7 rounded-full bg-surface-3 hover:bg-surface-4 active:bg-white active:text-black flex items-center justify-center text-ink-subtle hover:text-white transition-all duration-150 active:scale-90"
            title="Expand Timer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-fade-slide-up duration-200">
      <div className="bg-surface-1/95 border border-hairline-strong p-5 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-2xl">
        {/* Progress Bar Line */}
        <div
          className={`absolute bottom-0 left-0 h-1.5 transition-all duration-300 ease-linear ${isFinished ? 'bg-success' : 'bg-white'}`}
          style={{ width: `${progressPercent}%` }}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-success animate-ping' : isRunning ? 'bg-white animate-pulse' : 'bg-ink-subtle'}`} />
            <span className="text-xs font-mono uppercase tracking-widest text-ink-muted font-bold">
              {isFinished ? 'Rest Finished · Ready' : 'Resting Interval'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="w-7 h-7 rounded-full bg-surface-2 hover:bg-surface-3 active:bg-surface-4 flex items-center justify-center text-ink-subtle hover:text-white transition-all duration-150 active:scale-90"
              title="Minimize to floating pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-surface-2 hover:bg-surface-3 active:bg-surface-4 flex items-center justify-center text-ink-subtle hover:text-white transition-all duration-150 active:scale-90"
              title="Close Timer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Display and Steppers */}
        <div className="flex items-center justify-between gap-3">
          {/* Time digits */}
          <div className="flex items-center gap-3">
            <div className={`text-4xl sm:text-5xl font-display tracking-widest ${isFinished ? 'text-success' : 'text-white'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Quick +/- 15s / 30s adjustment buttons */}
            <div className="flex items-center gap-1 pl-1">
              <button
                type="button"
                onClick={() => handleAdjustTime(-15)}
                className="px-2 py-1 rounded-full bg-surface-2 hover:bg-surface-3 border border-hairline text-xs font-mono text-ink-subtle hover:text-white transition active:scale-95 flex items-center"
                title="Subtract 15s"
              >
                <Minus className="w-2.5 h-2.5 mr-0.5" /> 15s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustTime(+30)}
                className="px-2 py-1 rounded-full bg-surface-2 hover:bg-surface-3 border border-hairline text-xs font-mono text-white transition active:scale-95 flex items-center font-bold"
                title="Add 30s"
              >
                <Plus className="w-2.5 h-2.5 mr-0.5" /> 30s
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="w-10 h-10 rounded-full bg-white hover:bg-neutral-200 text-black font-bold flex items-center justify-center transition active:scale-90 shadow-md"
              title={isRunning ? 'Pause' : 'Resume'}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeLeft(totalTime);
                setIsRunning(true);
              }}
              className="w-10 h-10 rounded-full bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-white flex items-center justify-center transition active:scale-90"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Next Exercise / Habit Cue Banner */}
        {nextExerciseName && (
          <div className="flex items-center gap-2 text-xs text-ink-subtle font-mono truncate px-3 py-1.5 bg-surface-2 border border-hairline">
            <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="text-ink-tertiary uppercase">Next:</span>
            <span className="text-white font-semibold truncate uppercase">{nextExerciseName}</span>
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
              className={`flex-1 py-1.5 rounded-full text-xs font-mono border transition active:scale-95 ${
                totalTime === secs
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-surface-2 border-hairline text-ink-subtle hover:text-white'
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
