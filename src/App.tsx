import React, { useState, useEffect } from 'react';
import { Dumbbell, TrendingUp } from 'lucide-react';
import { Header } from './components/common/Header';
import { TabSwitch } from './components/common/TabSwitch';
import { CurrentWorkoutPrompt } from './components/workout/CurrentWorkoutPrompt';
import { RestTimer } from './components/workout/RestTimer';
import { WeekOverWeekView } from './components/workout/WeekOverWeekView';
import { WarmupProtocolModal } from './components/workout/WarmupProtocolModal';
import { ExerciseSubstitutionModal } from './components/workout/ExerciseSubstitutionModal';
import { WeakPointSelectorModal } from './components/workout/WeakPointSelectorModal';
import { WeekDaySelectorModal } from './components/workout/WeekDaySelectorModal';
import { WorkoutCompleteBanner } from './components/workout/WorkoutCompleteBanner';
import { WorkoutSelectorBar } from './components/workout/WorkoutSelectorBar';
import { ExerciseStrip } from './components/workout/ExerciseStrip';
import { WORKOUT_PLAN_DATA } from './data/workoutPlan';
import { ExerciseLog, SetLog, WorkoutSessionLog } from './types/workout';
import { 
  loadWorkoutLogs, 
  saveWorkoutLog, 
  deleteWorkoutLog,
  loadCurrentProgress, 
  saveCurrentProgress,
  getTodayLocalDateString,
} from './utils/storage';
import { 
  syncSetToAws, 
  fetchAllAwsWorkouts, 
  deleteAwsSet, 
  deleteAwsExercise, 
  deleteAwsSession 
} from './utils/awsApi';
import { findPreviousExercisePerformance, matchesExercise } from './utils/exerciseMatching';
import { 
  getNextScheduledWorkout, 
  isWorkoutSessionComplete, 
  getAutoResumeWorkoutPosition, 
  reconstructSessionsFromAwsItems
} from './utils/workoutScheduler';

export function App() {
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [currentDayId, setCurrentDayId] = useState<string>('w1-d1');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'workout' | 'progress'>('workout');
  const [exerciseOverrides, setExerciseOverrides] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayLocalDateString());

  // Logs state
  const [logs, setLogs] = useState<Record<string, WorkoutSessionLog>>({});
  
  // Modals state
  const [isWarmupOpen, setIsWarmupOpen] = useState<boolean>(false);
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState<boolean>(false);
  const [isSubstitutionOpen, setIsSubstitutionOpen] = useState<boolean>(false);
  const [isWeakPointModalOpen, setIsWeakPointModalOpen] = useState<boolean>(false);
  const [showManualDateInput, setShowManualDateInput] = useState<boolean>(false);
  const [timerConfig, setTimerConfig] = useState<{ open: boolean; seconds: number }>({
    open: false,
    seconds: 120,
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Initialize from storage, continue from last record / next day & sync from AWS DynamoDB
  useEffect(() => {
    const savedLogs = loadWorkoutLogs();
    setLogs(savedLogs);

    const applyPosition = (pos: { cycle: number; week: number; dayId: string; exerciseIndex: number; selectedDate: string }) => {
      setCurrentCycle(pos.cycle);
      setCurrentWeek(pos.week);
      setCurrentDayId(pos.dayId);
      setActiveExerciseIndex(pos.exerciseIndex);
      setSelectedDate(pos.selectedDate);
    };

    const initialPos = getAutoResumeWorkoutPosition(savedLogs, loadCurrentProgress(), getTodayLocalDateString());
    applyPosition(initialPos);

    // Re-check on visibility change (e.g. app kept open in browser background overnight)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const nextPos = getAutoResumeWorkoutPosition(loadWorkoutLogs(), loadCurrentProgress(), getTodayLocalDateString());
        applyPosition(nextPos);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Fetch from DynamoDB if online
    fetchAllAwsWorkouts().then((remoteItems) => {
      if (remoteItems && remoteItems.length > 0) {
        setLogs((prev) => {
          const merged = reconstructSessionsFromAwsItems(remoteItems, prev);
          Object.values(merged).forEach((session) => saveWorkoutLog(session));
          applyPosition(getAutoResumeWorkoutPosition(merged, loadCurrentProgress(), getTodayLocalDateString()));
          return merged;
        });
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentWeekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === currentWeek) || WORKOUT_PLAN_DATA[0];
  const currentDay = currentWeekPlan.days.find((d) => d.id === currentDayId) || currentWeekPlan.days[0];
  const rawActiveExercise = currentDay.exercises[activeExerciseIndex];
  const activeExercise = rawActiveExercise
    ? {
        ...rawActiveExercise,
        name: exerciseOverrides[rawActiveExercise.id] || rawActiveExercise.name,
      }
    : undefined;

  // Current session log
  const sessionLogKey = `${selectedDate}_${currentDay.id}`;
  const currentSessionLog: WorkoutSessionLog =
    logs[sessionLogKey] ||
    Object.values(logs).find(
      (l) => l && l.date === selectedDate && (l.dayId === currentDay.id || l.dayName === currentDay.name)
    ) || {
      date: selectedDate,
      weekNumber: currentWeek,
      cycleNumber: currentCycle,
      dayId: currentDay.id,
      dayName: currentDay.name,
      exercises: [],
    };

  const currentExerciseLog: ExerciseLog =
    (activeExercise
      ? currentSessionLog.exercises.find((e) => matchesExercise(e, activeExercise))
      : undefined) || {
      exerciseId: activeExercise?.id || '',
      exerciseName: activeExercise?.name || '',
      sets: [],
      completed: false,
    };

  // Save progress changes
  useEffect(() => {
    saveCurrentProgress({
      currentCycle,
      currentWeek,
      currentDayId,
      activeExerciseIndex,
      activeSetIndex: currentExerciseLog.sets.length,
      lastActiveDate: selectedDate,
    });
  }, [currentCycle, currentWeek, currentDayId, activeExerciseIndex, selectedDate, currentExerciseLog.sets.length]);

  // Find previous performance log for this exercise to calculate continuous progressive overload
  const previousPerformance = React.useMemo(() => {
    if (!activeExercise) return undefined;
    return findPreviousExercisePerformance(
      activeExercise.name,
      currentWeek,
      currentCycle,
      selectedDate,
      currentDay.id,
      logs
    );
  }, [logs, currentWeek, currentCycle, activeExercise, selectedDate, currentDay.id]);

  const previousWeekSets = previousPerformance?.sets;

  const handleLogSet = async (
    setNumber: number,
    weight: number,
    reps: number,
    rpe: number,
    technique?: string,
    techniqueDetail?: string,
    setupNotes?: string
  ) => {
    if (!activeExercise) return;

    const newSet: SetLog = {
      setNumber,
      weight,
      reps,
      rpe,
      completed: true,
      timestamp: new Date().toISOString(),
      intensityTechnique: technique,
      techniqueDetail: techniqueDetail,
      setupNotes: setupNotes,
    };

    const existingExIndex = currentSessionLog.exercises.findIndex((e) =>
      matchesExercise(e, activeExercise)
    );

    let updatedExercises = [...currentSessionLog.exercises];
    if (existingExIndex >= 0) {
      const existingEx = updatedExercises[existingExIndex];
      const updatedSets = [...existingEx.sets];
      updatedSets[setNumber - 1] = newSet;
      const cleanSets = updatedSets.filter(Boolean);
      updatedExercises[existingExIndex] = {
        ...existingEx,
        exerciseId: activeExercise.id,
        exerciseName: activeExercise.name,
        setupNotes: setupNotes || existingEx.setupNotes,
        sets: cleanSets,
        completed: cleanSets.length >= activeExercise.workingSets,
      };
    } else {
      updatedExercises.push({
        exerciseId: activeExercise.id,
        exerciseName: activeExercise.name,
        sets: [newSet],
        completed: 1 >= activeExercise.workingSets,
        setupNotes: setupNotes,
      });
    }

    const updatedSession: WorkoutSessionLog = {
      ...currentSessionLog,
      exercises: updatedExercises,
    };

    saveWorkoutLog(updatedSession);
    setLogs((prev) => ({ ...prev, [sessionLogKey]: updatedSession }));

    // Sync to AWS DynamoDB
    syncSetToAws({
      Date: selectedDate,
      WorkoutName: activeExercise.name,
      Set: setNumber,
      Weight: weight,
      Reps: reps,
      RPE: rpe,
      Technique: technique,
      TechniqueDetail: techniqueDetail,
      SetupNotes: setupNotes,
      DayId: currentDay.id,
      WeekNumber: currentWeek,
      CycleNumber: currentCycle,
      DayName: currentDay.name,
      ExerciseId: activeExercise.id,
    });
  };

  const handleDeleteSet = async (setIndex: number) => {
    if (!activeExercise) return;

    const existingExIndex = currentSessionLog.exercises.findIndex((e) =>
      matchesExercise(e, activeExercise)
    );
    if (existingExIndex < 0) return;

    const existingEx = currentSessionLog.exercises[existingExIndex];
    const oldTotalSets = existingEx.sets.length;
    const updatedSets = existingEx.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
      ...s,
      setNumber: idx + 1,
    }));

    const updatedExercises = [...currentSessionLog.exercises];
    if (updatedSets.length > 0) {
      updatedExercises[existingExIndex] = {
        ...existingEx,
        sets: updatedSets,
        completed: updatedSets.length >= activeExercise.workingSets,
      };
    } else {
      updatedExercises.splice(existingExIndex, 1);
    }

    const updatedSession: WorkoutSessionLog = {
      ...currentSessionLog,
      exercises: updatedExercises,
    };

    saveWorkoutLog(updatedSession);
    setLogs((prev) => ({ ...prev, [sessionLogKey]: updatedSession }));

    if (updatedSets.length === 0) {
      // If no sets remain for this exercise, delete the entire exercise from DynamoDB
      await deleteAwsExercise(selectedDate, activeExercise.name);
    } else {
      // Delete trailing set from AWS DynamoDB & re-sync re-indexed sets
      await deleteAwsSet(selectedDate, activeExercise.name, oldTotalSets);
      for (const s of updatedSets) {
        await syncSetToAws({
          Date: selectedDate,
          WorkoutName: activeExercise.name,
          Set: s.setNumber,
          Weight: s.weight,
          Reps: s.reps,
          RPE: s.rpe,
          Technique: s.intensityTechnique,
          TechniqueDetail: s.techniqueDetail,
          SetupNotes: s.setupNotes,
          DayId: currentDay.id,
          WeekNumber: currentWeek,
          CycleNumber: currentCycle,
          DayName: currentDay.name,
          ExerciseId: activeExercise.id,
        });
      }
    }
  };

  const handleClearExerciseSets = async () => {
    if (!activeExercise) return;
    if (!window.confirm(`Reset all logged sets for "${activeExercise.name}"?`)) return;

    const updatedExercises = currentSessionLog.exercises.filter(
      (e) => !matchesExercise(e, activeExercise)
    );

    const updatedSession: WorkoutSessionLog = {
      ...currentSessionLog,
      exercises: updatedExercises,
    };

    saveWorkoutLog(updatedSession);
    setLogs((prev) => ({ ...prev, [sessionLogKey]: updatedSession }));

    // Delete all sets for this exercise from AWS DynamoDB
    await deleteAwsExercise(selectedDate, activeExercise.name);
  };

  const handleNextExercise = () => {
    if (activeExerciseIndex < currentDay.exercises.length - 1) {
      setActiveExerciseIndex((prev) => prev + 1);
    }
  };

  // Past History Actions: Update set, delete set, delete session, jump to session
  const handleUpdateHistorySet = async (
    sessionKey: string,
    exerciseId: string,
    setIndex: number,
    weight: number,
    reps: number,
    rpe: number,
    technique?: string,
    techniqueDetail?: string,
    setupNotes?: string
  ) => {
    const session = logs[sessionKey];
    if (!session) return;

    const updatedExercises = session.exercises.map((ex) => {
      if (ex.exerciseId !== exerciseId) return ex;
      const updatedSets = [...ex.sets];
      if (updatedSets[setIndex]) {
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          weight,
          reps,
          rpe,
          intensityTechnique: technique !== undefined ? technique : updatedSets[setIndex].intensityTechnique,
          techniqueDetail: techniqueDetail !== undefined ? techniqueDetail : updatedSets[setIndex].techniqueDetail,
          setupNotes: setupNotes !== undefined ? setupNotes : updatedSets[setIndex].setupNotes,
        };
      }
      return {
        ...ex,
        setupNotes: setupNotes || ex.setupNotes,
        sets: updatedSets,
      };
    });

    const updatedSession: WorkoutSessionLog = {
      ...session,
      exercises: updatedExercises,
    };

    saveWorkoutLog(updatedSession);
    setLogs((prev) => ({ ...prev, [sessionKey]: updatedSession }));

    const targetEx = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (targetEx) {
      await syncSetToAws({
        Date: session.date,
        WorkoutName: targetEx.exerciseName,
        Set: setIndex + 1,
        Weight: weight,
        Reps: reps,
        RPE: rpe,
        Technique: technique,
        TechniqueDetail: techniqueDetail,
        SetupNotes: setupNotes,
        DayId: session.dayId,
        WeekNumber: session.weekNumber,
        CycleNumber: session.cycleNumber,
        DayName: session.dayName,
        ExerciseId: targetEx.exerciseId,
      });
    }
  };

  const handleDeleteHistorySet = async (
    sessionKey: string,
    exerciseId: string,
    setIndex: number
  ) => {
    const session = logs[sessionKey];
    if (!session) return;

    const targetEx = session.exercises.find((e) => e.exerciseId === exerciseId);
    const oldTotalSets = targetEx?.sets.length || 0;
    const exName = targetEx?.exerciseName || '';

    const updatedExercises = session.exercises
      .map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        const updatedSets = ex.sets
          .filter((_, idx) => idx !== setIndex)
          .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return {
          ...ex,
          sets: updatedSets,
        };
      })
      .filter((ex) => ex.sets.length > 0);

    const updatedSession: WorkoutSessionLog = {
      ...session,
      exercises: updatedExercises,
    };

    if (updatedExercises.length === 0) {
      deleteWorkoutLog(sessionKey);
      setLogs((prev) => {
        const copy = { ...prev };
        delete copy[sessionKey];
        return copy;
      });
      await deleteAwsSession(session.date);
    } else {
      saveWorkoutLog(updatedSession);
      setLogs((prev) => ({ ...prev, [sessionKey]: updatedSession }));

      if (exName) {
        const remainingEx = updatedExercises.find((e) => e.exerciseId === exerciseId);
        if (!remainingEx) {
          // If no sets remain for this exercise, delete the entire exercise from DynamoDB
          await deleteAwsExercise(session.date, exName);
        } else {
          await deleteAwsSet(session.date, exName, oldTotalSets);
          for (const s of remainingEx.sets) {
            await syncSetToAws({
              Date: session.date,
              WorkoutName: exName,
              Set: s.setNumber,
              Weight: s.weight,
              Reps: s.reps,
              RPE: s.rpe,
              Technique: s.intensityTechnique,
              TechniqueDetail: s.techniqueDetail,
              SetupNotes: s.setupNotes,
              DayId: session.dayId,
              WeekNumber: session.weekNumber,
              CycleNumber: session.cycleNumber,
              DayName: session.dayName,
              ExerciseId: remainingEx.exerciseId,
            });
          }
        }
      }
    }
  };

  const handleDeleteSession = async (sessionKey: string) => {
    const session = logs[sessionKey];
    const sessionDate = session?.date || sessionKey.split('_')[0];

    deleteWorkoutLog(sessionKey);
    setLogs((prev) => {
      const copy = { ...prev };
      delete copy[sessionKey];
      return copy;
    });

    if (sessionDate) {
      await deleteAwsSession(sessionDate);
    }
  };

  const handleOpenSessionInRunner = (
    date: string,
    weekNumber: number,
    dayId: string,
    cycleNumber?: number
  ) => {
    setSelectedDate(date);
    if (cycleNumber) setCurrentCycle(cycleNumber);
    setCurrentWeek(weekNumber);
    setCurrentDayId(dayId);
    setActiveExerciseIndex(0);
    setActiveTab('workout');
  };

  // Direct manual switchers
  const handleSelectWeek = (weekNum: number, cycleNum?: number) => {
    if (cycleNum !== undefined) {
      setCurrentCycle(cycleNum);
    }
    setCurrentWeek(weekNum);
    const targetWeekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === weekNum) || WORKOUT_PLAN_DATA[0];
    // Keep same day name if available or pick first non-rest day
    const matchingDay = targetWeekPlan.days.find((d) => d.name === currentDay.name && !d.isRestDay);
    if (matchingDay) {
      setCurrentDayId(matchingDay.id);
    } else {
      const firstActiveDay = targetWeekPlan.days.find((d) => !d.isRestDay) || targetWeekPlan.days[0];
      setCurrentDayId(firstActiveDay.id);
    }
    setActiveExerciseIndex(0);
  };

  const handleSelectDay = (dayId: string) => {
    setCurrentDayId(dayId);
    setActiveExerciseIndex(0);
  };

  const handleStepWeek = (delta: number) => {
    const nextWeek = currentWeek + delta;
    if (nextWeek > 10) {
      // Loop to next cycle Week 1
      const nextCycle = currentCycle + 1;
      setCurrentCycle(nextCycle);
      handleSelectWeek(1, nextCycle);
    } else if (nextWeek < 1) {
      if (currentCycle > 1) {
        const prevCycle = currentCycle - 1;
        setCurrentCycle(prevCycle);
        handleSelectWeek(10, prevCycle);
      }
    } else {
      handleSelectWeek(nextWeek, currentCycle);
    }
  };

  const handleNextWorkoutDay = () => {
    const next = getNextScheduledWorkout(currentCycle, currentWeek, currentDayId);
    if (next.cycle !== currentCycle) {
      setCurrentCycle(next.cycle);
    }
    handleSelectWeek(next.week, next.cycle);
    setCurrentDayId(next.dayId);
    setActiveExerciseIndex(0);
  };

  const isWorkoutDayComplete = isWorkoutSessionComplete(currentSessionLog, currentWeek, currentDay.id);

  // Session Momentum & Habit Analytics
  const totalWorkingSetsInDay = currentDay.exercises.reduce((sum, ex) => sum + ex.workingSets, 0);
  const totalLoggedSetsInDay = currentSessionLog.exercises.reduce(
    (sum, ex) => sum + (ex.sets ? ex.sets.filter((s) => s && s.completed).length : 0),
    0
  );
  const completedExercisesCount = currentDay.exercises.filter((ex) => {
    const exName = exerciseOverrides[ex.id] || ex.name;
    const log = currentSessionLog.exercises.find((e) => matchesExercise(e, { ...ex, name: exName }));
    const setsCount = log?.sets ? log.sets.filter((s) => s && s.completed).length : 0;
    return setsCount >= ex.workingSets || Boolean(log?.completed);
  }).length;
  const sessionProgressPct = totalWorkingSetsInDay > 0
    ? Math.min(100, Math.round((totalLoggedSetsInDay / totalWorkingSetsInDay) * 100))
    : 0;

  const nextExercise = activeExerciseIndex < currentDay.exercises.length - 1
    ? currentDay.exercises[activeExerciseIndex + 1]
    : undefined;
  const nextExerciseName = nextExercise
    ? (exerciseOverrides[nextExercise.id] || nextExercise.name)
    : undefined;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-primary/30">
      {/* 56px Top Nav */}
      <Header
        currentCycle={currentCycle}
        currentWeek={currentWeek}
        selectedDayName={currentDay.name}
        isOnline={isOnline}
        onOpenWeekSelector={() => setIsWeekSelectorOpen(true)}
        onOpenWarmupGuide={() => setIsWarmupOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-24">
        {/* Navigation Tabs with Fast Sliding Pill Background */}
        <div className="flex justify-center w-full">
          <TabSwitch
            tabs={[
              { id: 'workout', label: 'Live Workout', icon: <Dumbbell className="w-3.5 h-3.5" /> },
              { id: 'progress', label: 'Progression', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'workout' | 'progress')}
            maxWidthClass="max-w-sm sm:max-w-md"
          />
        </div>

        {/* Animated View Container with Smooth Crossfade & Spring Slide */}
        <div key={activeTab} className="animate-scale-in">
          {activeTab === 'workout' ? (
            <div className="space-y-4 sm:space-y-6 animate-fade-slide-up">
              {/* Session Momentum & Progress Bar */}
              <div className="bg-surface-1 border border-hairline p-3 sm:p-4 space-y-2.5 sm:space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-pulse shrink-0" />
                  <span className="font-display tracking-wider text-base sm:text-lg text-white uppercase truncate max-w-[120px] xs:max-w-[200px] sm:max-w-none">
                    {currentDay.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-ink-subtle px-1.5 sm:px-2 py-0.5 rounded-full bg-surface-2 border border-hairline whitespace-nowrap uppercase shrink-0">
                    C{currentCycle}·W{currentWeek}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs ml-auto">
                  <span className="text-white font-bold">{sessionProgressPct}%</span>
                  <span className="text-ink-tertiary">·</span>
                  <span className="text-ink-muted whitespace-nowrap">
                    {completedExercisesCount}/{currentDay.exercises.length} <span className="hidden xs:inline">Ex</span>
                    <span className="hidden sm:inline"> ({totalLoggedSetsInDay}/{totalWorkingSetsInDay} Sets)</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-hairline">
                <div
                  className="h-full bg-white transition-all duration-500 rounded-full"
                  style={{ width: `${sessionProgressPct}%` }}
                />
              </div>
            </div>

            {/* MANUAL WORKOUT SELECTOR BAR */}
            <WorkoutSelectorBar
              currentCycle={currentCycle}
              currentWeek={currentWeek}
              currentDayId={currentDayId}
              currentWeekDays={currentWeekPlan.days}
              selectedDate={selectedDate}
              showManualDateInput={showManualDateInput}
              onStepWeek={handleStepWeek}
              onSelectWeek={handleSelectWeek}
              onSelectDay={handleSelectDay}
              onToggleManualDateInput={() => setShowManualDateInput(!showManualDateInput)}
              onOpenWeekSelector={() => setIsWeekSelectorOpen(true)}
              onSelectDate={(dStr) => setSelectedDate(dStr)}
            />

            {/* Workout Day Exercise Strip */}
            <ExerciseStrip
              dayName={currentDay.name}
              exercises={currentDay.exercises}
              activeExerciseIndex={activeExerciseIndex}
              exerciseOverrides={exerciseOverrides}
              currentSessionLog={currentSessionLog}
              completedExercisesCount={completedExercisesCount}
              onSelectExerciseIndex={(idx) => setActiveExerciseIndex(idx)}
            />

            {/* If all exercises completed, show banner */}
            {isWorkoutDayComplete ? (
              <WorkoutCompleteBanner
                sessionLog={currentSessionLog}
                currentCycle={currentCycle}
                onResetWorkout={() => setActiveExerciseIndex(0)}
                onNextWorkoutDay={handleNextWorkoutDay}
              />
            ) : activeExercise ? (
              <CurrentWorkoutPrompt
                exercise={activeExercise}
                currentWeek={currentWeek}
                currentCycle={currentCycle}
                currentSetIndex={currentExerciseLog.sets.length}
                completedSets={currentExerciseLog.sets}
                previousWeekSets={previousWeekSets}
                previousPerformance={previousPerformance}
                onLogSet={(weight, reps, rpe, indexToEdit) => {
                  const setNum = (indexToEdit !== null && indexToEdit !== undefined) ? indexToEdit + 1 : currentExerciseLog.sets.length + 1;
                  handleLogSet(setNum, weight, reps, rpe || 8.5);
                }}
                onDeleteSet={handleDeleteSet}
                onClearExerciseSets={handleClearExerciseSets}
                onSelectSubstitution={() => setIsSubstitutionOpen(true)}
                onSelectWeakPoint={
                  activeExercise.name.toLowerCase().includes('weak point') ||
                  (currentDay.name.includes('WEAK') && activeExerciseIndex <= 1)
                    ? () => setIsWeakPointModalOpen(true)
                    : undefined
                }
                onOpenRestTimer={(seconds) => setTimerConfig({ open: true, seconds })}
                onNextExercise={handleNextExercise}
                isLastExerciseInDay={activeExerciseIndex === currentDay.exercises.length - 1}
              />
            ) : (
              <div className="p-8 text-center bg-surface-1 rounded-lg border border-hairline text-ink-subtle">
                No exercises scheduled for this rest day.
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-slide-up">
            <WeekOverWeekView
              logs={logs}
              onUpdateSet={handleUpdateHistorySet}
              onDeleteSet={handleDeleteHistorySet}
              onDeleteSession={handleDeleteSession}
              onOpenSessionInRunner={handleOpenSessionInRunner}
            />
          </div>
        )}
        </div>
      </main>

      {/* Floating Rest Timer */}
      <RestTimer
        isOpen={timerConfig.open}
        initialSeconds={timerConfig.seconds}
        onClose={() => setTimerConfig({ open: false, seconds: 120 })}
        nextExerciseName={nextExerciseName}
      />

      {/* Modals */}
      <WarmupProtocolModal
        isOpen={isWarmupOpen}
        onClose={() => setIsWarmupOpen(false)}
      />

      {activeExercise && rawActiveExercise && (
        <ExerciseSubstitutionModal
          exercise={rawActiveExercise}
          currentExerciseName={activeExercise.name}
          isOpen={isSubstitutionOpen}
          onClose={() => setIsSubstitutionOpen(false)}
          onSelectAlternative={(newName) => {
            setExerciseOverrides((prev) => ({
              ...prev,
              [rawActiveExercise.id]: newName,
            }));
          }}
        />
      )}

      {activeExercise && rawActiveExercise && (
        <WeakPointSelectorModal
          isOpen={isWeakPointModalOpen}
          onClose={() => setIsWeakPointModalOpen(false)}
          exerciseSlot={activeExerciseIndex === 1 ? 'Exercise 2' : 'Exercise 1'}
          currentExerciseName={activeExercise.name}
          onSelectExercise={(newName) => {
            setExerciseOverrides((prev) => ({
              ...prev,
              [rawActiveExercise.id]: newName,
            }));
          }}
        />
      )}

      <WeekDaySelectorModal
        currentCycle={currentCycle}
        currentWeek={currentWeek}
        currentDayId={currentDayId}
        isOpen={isWeekSelectorOpen}
        onClose={() => setIsWeekSelectorOpen(false)}
        onSelect={(w, dId, c) => {
          if (c !== undefined) {
            setCurrentCycle(c);
          }
          handleSelectWeek(w, c);
          setCurrentDayId(dId);
          setActiveExerciseIndex(0);
        }}
      />
    </div>
  );
}

export default App;
