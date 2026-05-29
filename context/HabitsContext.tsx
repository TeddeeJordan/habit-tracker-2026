import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import {
  Habit,
  HabitLog,
  MoodEntry,
  addHabit,
  addMoodEntry,
  deleteHabit,
  getHabits,
  getLogsForWeek,
  getMoodEntriesForWeek,
  upsertLog,
} from '@/db/queries';
import { formatDate, getWeekStart } from '@/utils/habitUtils';

export type State = {
  habits: Habit[];
  logs: HabitLog[];
  moodEntries: MoodEntry[];
  weekStart: string;
  loading: boolean;
};

export type Action =
  | { type: 'LOAD'; habits: Habit[]; logs: HabitLog[]; moodEntries: MoodEntry[] }
  | { type: 'SET_WEEK'; weekStart: string; logs: HabitLog[]; moodEntries: MoodEntry[] }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'DELETE_HABIT'; id: number }
  | { type: 'UPSERT_LOG'; log: HabitLog | null; habitId: number; date: string }
  | { type: 'ADD_MOOD_ENTRY'; entry: MoodEntry };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { ...state, habits: action.habits, logs: action.logs, moodEntries: action.moodEntries, loading: false };
    case 'SET_WEEK':
      return { ...state, weekStart: action.weekStart, logs: action.logs, moodEntries: action.moodEntries };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) };
    case 'UPSERT_LOG': {
      const filtered = state.logs.filter(
        (l) => !(l.habit_id === action.habitId && l.date === action.date),
      );
      return { ...state, logs: action.log ? [...filtered, action.log] : filtered };
    }
    case 'ADD_MOOD_ENTRY':
      return { ...state, moodEntries: [...state.moodEntries, action.entry] };
    default:
      return state;
  }
}

type ContextValue = State & {
  today: string;
  addHabitAction: (name: string, emoji: string, timesPerWeek: number) => Promise<void>;
  deleteHabitAction: (id: number) => Promise<void>;
  toggleLog: (habitId: number, date: string) => Promise<void>;
  logMood: (date: string, score: number) => Promise<void>;
  goToPrevWeek: () => Promise<void>;
  goToNextWeek: () => Promise<void>;
};

const HabitsContext = createContext<ContextValue | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const today = formatDate(new Date());
  const [state, dispatch] = useReducer(reducer, {
    habits: [],
    logs: [],
    moodEntries: [],
    weekStart: getWeekStart(new Date()),
    loading: true,
  });

  useEffect(() => {
    (async () => {
      const [habits, logs, moodEntries] = await Promise.all([
        getHabits(),
        getLogsForWeek(state.weekStart),
        getMoodEntriesForWeek(state.weekStart),
      ]);
      dispatch({ type: 'LOAD', habits, logs, moodEntries });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWeek = useCallback(async (weekStart: string) => {
    const [logs, moodEntries] = await Promise.all([
      getLogsForWeek(weekStart),
      getMoodEntriesForWeek(weekStart),
    ]);
    dispatch({ type: 'SET_WEEK', weekStart, logs, moodEntries });
  }, []);

  const addHabitAction = useCallback(async (name: string, emoji: string, timesPerWeek: number) => {
    const habit = await addHabit(name.trim(), emoji, timesPerWeek);
    dispatch({ type: 'ADD_HABIT', habit });
  }, []);

  const deleteHabitAction = useCallback(async (id: number) => {
    await deleteHabit(id);
    dispatch({ type: 'DELETE_HABIT', id });
  }, []);

  const toggleLog = useCallback(async (habitId: number, date: string) => {
    const existing = state.logs.find((l) => l.habit_id === habitId && l.date === date);
    let nextStatus: 'completed' | 'skipped' | null;
    if (!existing) nextStatus = 'completed';
    else if (existing.status === 'completed') nextStatus = 'skipped';
    else nextStatus = null;

    await upsertLog(habitId, date, nextStatus);

    const log: HabitLog | null =
      nextStatus ? { id: existing?.id ?? 0, habit_id: habitId, date, status: nextStatus } : null;
    dispatch({ type: 'UPSERT_LOG', log, habitId, date });
  }, [state.logs]);

  const logMood = useCallback(async (date: string, score: number) => {
    const entry = await addMoodEntry(date, score);
    dispatch({ type: 'ADD_MOOD_ENTRY', entry });
  }, []);

  const goToPrevWeek = useCallback(async () => {
    const d = new Date(state.weekStart);
    d.setDate(d.getDate() - 7);
    await loadWeek(formatDate(d));
  }, [state.weekStart, loadWeek]);

  const goToNextWeek = useCallback(async () => {
    const d = new Date(state.weekStart);
    d.setDate(d.getDate() + 7);
    await loadWeek(formatDate(d));
  }, [state.weekStart, loadWeek]);

  return (
    <HabitsContext.Provider
      value={{ ...state, today, addHabitAction, deleteHabitAction, toggleLog, logMood, goToPrevWeek, goToNextWeek }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits(): ContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used inside HabitsProvider');
  return ctx;
}
