import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  Play, 
  Dumbbell, 
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sliders,
  Zap,
} from 'lucide-react';
import { WorkoutSessionLog, SetLog } from '../../types/workout';
import { getCanonicalExerciseName } from '../../utils/exerciseMatching';
import { TabSwitch } from '../common/TabSwitch';

interface WeekOverWeekViewProps {
  logs: Record<string, WorkoutSessionLog>;
  onUpdateSet?: (
    sessionKey: string,
    exerciseId: string,
    setIndex: number,
    weight: number,
    reps: number,
    rpe: number,
    technique?: string,
    techniqueDetail?: string,
    setupNotes?: string
  ) => void;
  onDeleteSet?: (sessionKey: string, exerciseId: string, setIndex: number) => void;
  onDeleteSession?: (sessionKey: string) => void;
  onOpenSessionInRunner?: (date: string, weekNumber: number, dayId: string, cycleNumber?: number) => void;
}

interface EditingSetState {
  sessionKey: string;
  exerciseId: string;
  setIndex: number;
  weight: number;
  reps: number;
  rpe: number;
  intensityTechnique?: string;
  techniqueDetail?: string;
  setupNotes?: string;
}

export const WeekOverWeekView: React.FC<WeekOverWeekViewProps> = ({
  logs = {},
  onUpdateSet,
  onDeleteSet,
  onDeleteSession,
  onOpenSessionInRunner,
}) => {
  const [viewMode, setViewMode] = useState<'sessions' | 'exercises'>('sessions');
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<EditingSetState | null>(null);

  // Sorted session entries [key, session] with null-safety
  const sessionEntries = Object.entries(logs || {})
    .filter(([, session]) => Boolean(session && Array.isArray(session.exercises)))
    .sort(([keyA, a], [keyB, b]) => {
      const dateA = a?.date || keyA.split('_')[0] || '';
      const dateB = b?.date || keyB.split('_')[0] || '';
      return dateB.localeCompare(dateA);
    });

  const toggleSessionExpand = (key: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key], // default expanded if not set
    }));
  };

  const isSessionExpanded = (key: string) => {
    return expandedSessions[key] !== false; // default true
  };

  // Group by Canonical Exercise Name to show progressive overload progression
  const exerciseProgressMap = React.useMemo(() => {
    const map: Record<string, { cycle: number; week: number; date: string; maxWeight: number; totalVolume: number }[]> = {};
    sessionEntries.forEach(([, session]) => {
      if (!session || !Array.isArray(session.exercises)) return;
      session.exercises.forEach((ex) => {
        if (!ex || !ex.exerciseName) return;
        const validSets = Array.isArray(ex.sets) ? ex.sets.filter((s): s is SetLog => Boolean(s)) : [];
        if (validSets.length === 0) return;

        const canonicalName = getCanonicalExerciseName(ex.exerciseName);
        if (!map[canonicalName]) {
          map[canonicalName] = [];
        }
        const maxWeight = validSets.reduce((max, s) => Math.max(max, Number(s.weight) || 0), 0);
        const totalVolume = validSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        map[canonicalName].push({
          cycle: session.cycleNumber || 1,
          week: session.weekNumber || 1,
          date: session.date || '',
          maxWeight,
          totalVolume,
        });
      });
    });
    return map;
  }, [sessionEntries]);

  const handleSaveEdit = () => {
    if (!editingSet || !onUpdateSet) return;
    onUpdateSet(
      editingSet.sessionKey,
      editingSet.exerciseId,
      editingSet.setIndex,
      editingSet.weight,
      editingSet.reps,
      editingSet.rpe,
      editingSet.intensityTechnique,
      editingSet.techniqueDetail,
      editingSet.setupNotes
    );
    setEditingSet(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display uppercase tracking-wide text-white">
            Workout History & Progression
          </h2>
          <p className="text-xs text-ink-subtle mt-0.5">
            Review, edit, delete past sessions or inspect week-over-week overload
          </p>
        </div>

        {/* View Mode Toggle with TabSwitch */}
        <TabSwitch
          tabs={[
            { id: 'sessions', label: 'Past Sessions', icon: <Calendar className="w-3.5 h-3.5" />, count: sessionEntries.length },
            { id: 'exercises', label: 'Progression Map', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          ]}
          activeTab={viewMode}
          onChange={(id) => setViewMode(id as 'sessions' | 'exercises')}
          maxWidthClass="w-full sm:w-auto sm:min-w-[320px]"
        />
      </div>

      <div key={viewMode} className="animate-fade-slide-up">
        {sessionEntries.length === 0 ? (
          <div className="bg-surface-1 border border-hairline p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-2 border border-hairline mx-auto flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">No workout logs recorded yet.</p>
          <p className="text-xs text-ink-subtle">
            Complete and log your sets on the Live Workout tab to see full history and edit capabilities here!
          </p>
        </div>
      ) : viewMode === 'sessions' ? (
        /* Sessions History View */
        <div className="space-y-4">
          {sessionEntries.map(([sessionKey, session]) => {
            const isExpanded = isSessionExpanded(sessionKey);
            const exercises = Array.isArray(session.exercises) ? session.exercises.filter(Boolean) : [];
            const totalSets = exercises.reduce((sum, e) => {
              const sets = Array.isArray(e.sets) ? e.sets.filter(Boolean) : [];
              return sum + sets.length;
            }, 0);
            const totalVolume = exercises.reduce((sum, e) => {
              const sets = Array.isArray(e.sets) ? e.sets.filter(Boolean) : [];
              return sum + sets.reduce((sSum, s) => sSum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
            }, 0);

            return (
              <div
                key={sessionKey}
                className="bg-surface-1 border border-hairline overflow-hidden transition-all"
              >
                {/* Session Card Header */}
                <div className="p-4 bg-surface-2/60 flex flex-wrap items-center justify-between gap-3 border-b border-hairline">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSessionExpand(sessionKey)}
                      className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle hover:text-white flex items-center justify-center transition active:scale-95"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-display uppercase tracking-wider text-white">{session.dayName || 'Workout'}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-3 text-white border border-hairline uppercase">
                          C{session.cycleNumber || 1} · Week {session.weekNumber || 1}
                        </span>
                      </div>
                      <div className="text-xs text-ink-subtle font-mono mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="text-white">{session.date}</span>
                        <span>·</span>
                        <span>{exercises.length} Exercises</span>
                        <span>·</span>
                        <span>{totalSets} Sets</span>
                        <span>·</span>
                        <span className="text-white font-semibold">
                          Vol: {totalVolume.toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Resume & Delete */}
                  <div className="flex items-center gap-2">
                    {onOpenSessionInRunner && (
                      <button
                        type="button"
                        onClick={() => onOpenSessionInRunner(session.date, session.weekNumber || 1, session.dayId || 'w1-d1', session.cycleNumber || 1)}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                        title="Load this workout in workout runner"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Open</span>
                      </button>
                    )}

                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={() => setSessionToDelete(sessionKey)}
                        className="w-8 h-8 rounded-full bg-surface-2 hover:bg-sale-deep/40 border border-hairline hover:border-sale/40 text-ink-subtle hover:text-sale flex items-center justify-center transition active:scale-95"
                        title="Delete this entire session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Session Exercises & Sets List */}
                {isExpanded && (
                  <div className="p-4 space-y-4 divide-y divide-hairline">
                    {exercises.map((ex) => {
                      const validSets = Array.isArray(ex.sets) ? ex.sets.filter((s): s is SetLog => Boolean(s)) : [];
                      const exerciseSetupNote = ex.setupNotes || validSets.find((s) => s.setupNotes)?.setupNotes;

                      return (
                        <div key={ex.exerciseId || ex.exerciseName} className="pt-3 first:pt-0 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Dumbbell className="w-3.5 h-3.5 text-white" />
                              <span className="text-xs font-semibold uppercase tracking-wider text-white">{ex.exerciseName}</span>
                              {exerciseSetupNote && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-white border border-hairline flex items-center gap-1">
                                  <Sliders className="w-2.5 h-2.5" />
                                  <span>{exerciseSetupNote}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-ink-subtle">
                              {validSets.length} sets logged
                            </span>
                          </div>

                          {/* Sets Table */}
                          <div className="space-y-1.5">
                            {validSets.map((set, setIdx) => {
                              const isEditing =
                                editingSet?.sessionKey === sessionKey &&
                                editingSet?.exerciseId === ex.exerciseId &&
                                editingSet?.setIndex === setIdx;

                              if (isEditing) {
                                return (
                                  <div
                                    key={setIdx}
                                    className="p-3 bg-surface-2 border border-hairline-strong space-y-2 text-xs animate-in fade-in"
                                  >
                                    <div className="font-mono text-white font-bold text-[11px] uppercase tracking-wider">
                                      Set {set.setNumber || setIdx + 1}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-ink-subtle font-mono">kg:</span>
                                          <input
                                            type="number"
                                            step="0.5"
                                            value={editingSet.weight}
                                            onChange={(e) =>
                                              setEditingSet({
                                                ...editingSet,
                                                weight: parseFloat(e.target.value) || 0,
                                              })
                                            }
                                            className="w-16 px-2 py-1 rounded bg-canvas border border-hairline text-center font-mono text-xs text-white focus:border-white focus:outline-none"
                                          />
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-ink-subtle font-mono">reps:</span>
                                          <input
                                            type="number"
                                            value={editingSet.reps}
                                            onChange={(e) =>
                                              setEditingSet({
                                                ...editingSet,
                                                reps: parseInt(e.target.value) || 0,
                                              })
                                            }
                                            className="w-14 px-2 py-1 rounded bg-canvas border border-hairline text-center font-mono text-xs text-white focus:border-white focus:outline-none"
                                          />
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-ink-subtle font-mono">RPE:</span>
                                          <input
                                            type="number"
                                            step="0.5"
                                            value={editingSet.rpe}
                                            onChange={(e) =>
                                              setEditingSet({
                                                ...editingSet,
                                                rpe: parseFloat(e.target.value) || 8,
                                              })
                                            }
                                            className="w-14 px-2 py-1 rounded bg-canvas border border-hairline text-center font-mono text-xs text-white focus:border-white focus:outline-none"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={handleSaveEdit}
                                          className="px-3 py-1 rounded-full bg-white text-black font-bold uppercase text-[10px] tracking-wider transition active:scale-95"
                                          title="Save set changes"
                                        >
                                          <Check className="w-3.5 h-3.5 inline mr-1" />
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingSet(null)}
                                          className="px-3 py-1 rounded-full bg-surface-3 text-white uppercase text-[10px] tracking-wider transition active:scale-95"
                                          title="Cancel"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>

                                    {/* Technique Detail editor */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-hairline">
                                      <span className="text-[10px] text-ink-subtle font-mono uppercase">Technique:</span>
                                      <input
                                        type="text"
                                        value={editingSet.techniqueDetail || ''}
                                        onChange={(e) =>
                                          setEditingSet({
                                            ...editingSet,
                                            techniqueDetail: e.target.value,
                                          })
                                        }
                                        placeholder="e.g., +4 partials, Drop: 60kg x 6"
                                        className="flex-1 px-2.5 py-1 rounded bg-canvas border border-hairline text-xs font-mono text-white focus:border-white focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={setIdx}
                                  className="px-3 py-2 bg-surface-2/60 border border-hairline flex flex-wrap items-center justify-between gap-2 text-xs font-mono group hover:bg-surface-2 transition"
                                >
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-[10px] text-white font-bold">
                                      {set.setNumber || setIdx + 1}
                                    </span>
                                    <span className="text-white font-bold">
                                      {set.weight} <span className="text-[10px] font-normal text-ink-subtle">kg</span>
                                    </span>
                                    <span className="text-ink-tertiary">×</span>
                                    <span className="text-white font-bold">
                                      {set.reps} <span className="text-[10px] font-normal text-ink-subtle">reps</span>
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-white border border-hairline">
                                      @{set.rpe || 8.5}
                                    </span>
                                    {set.techniqueDetail && (
                                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-3 text-white border border-hairline flex items-center gap-1 font-mono">
                                        <Zap className="w-2.5 h-2.5" />
                                        <span>{set.techniqueDetail}</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                                    {onUpdateSet && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingSet({
                                            sessionKey,
                                            exerciseId: ex.exerciseId,
                                            setIndex: setIdx,
                                            weight: set.weight,
                                            reps: set.reps,
                                            rpe: set.rpe || 8.5,
                                            intensityTechnique: set.intensityTechnique,
                                            techniqueDetail: set.techniqueDetail,
                                            setupNotes: set.setupNotes,
                                          })
                                        }
                                        className="w-7 h-7 rounded-full hover:bg-surface-3 text-ink-subtle hover:text-white flex items-center justify-center transition active:scale-95"
                                        title="Edit this set"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {onDeleteSet && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteSet(sessionKey, ex.exerciseId, setIdx)}
                                        className="w-7 h-7 rounded-full hover:bg-sale-deep/40 text-ink-subtle hover:text-sale flex items-center justify-center transition active:scale-95"
                                        title="Delete this set"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Progression Map View */
        <div className="space-y-4">
          {Object.entries(exerciseProgressMap).map(([name, records]) => {
            const sortedRecords = [...records].sort(
              (a, b) =>
                ((a.cycle || 1) - (b.cycle || 1)) ||
                ((a.week || 1) - (b.week || 1)) ||
                (a.date.localeCompare(b.date))
            );
            const latest = sortedRecords[sortedRecords.length - 1];
            const earliest = sortedRecords[0];
            const weightDelta = latest ? latest.maxWeight - earliest.maxWeight : 0;

            return (
              <div
                key={name}
                className="bg-surface-1 border border-hairline p-5 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-display uppercase tracking-wide text-white">{name}</h3>
                    <div className="text-[11px] text-ink-subtle font-mono mt-0.5">
                      {sortedRecords.length} recorded sessions
                    </div>
                  </div>
                  {sortedRecords.length > 1 && (
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                        weightDelta >= 0
                          ? 'bg-success text-black border-success'
                          : 'bg-surface-2 text-ink-subtle border-hairline'
                      }`}
                    >
                      {weightDelta >= 0 ? `+${weightDelta.toFixed(1)}kg` : `${weightDelta.toFixed(1)}kg`}
                    </span>
                  )}
                </div>

                {/* Timeline / progression strips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {sortedRecords.map((r, i) => (
                    <div
                      key={i}
                      className="bg-surface-2 border border-hairline p-3 text-center"
                    >
                      <div className="text-[10px] text-ink-subtle font-mono">
                        C{r.cycle}·W{r.week} · {r.date}
                      </div>
                      <div className="text-base font-display tracking-wider text-white mt-0.5">
                        {r.maxWeight} <span className="text-[10px] font-normal text-ink-subtle font-sans">kg max</span>
                      </div>
                      <div className="text-[10px] font-mono text-ink-tertiary">
                        Vol: {r.totalVolume.toLocaleString()} kg
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Deleting Entire Session */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-1 border border-sale/40 max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-sale">
              <div className="w-9 h-9 rounded-full bg-sale-deep/50 border border-sale/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-sale" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Delete Workout Session?</h3>
            </div>

            <p className="text-xs text-ink-subtle leading-relaxed">
              Are you sure you want to permanently delete this workout session log ({sessionToDelete})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 rounded-full bg-surface-2 hover:bg-surface-3 text-white text-xs font-semibold uppercase tracking-wider transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteSession && sessionToDelete) {
                    onDeleteSession(sessionToDelete);
                  }
                  setSessionToDelete(null);
                }}
                className="px-4 py-2 rounded-full bg-sale hover:bg-sale-deep text-white text-xs font-bold uppercase tracking-wider transition shadow-lg active:scale-95"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
