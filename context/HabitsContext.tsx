import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import {
  Habit,
  HabitLog,
  MoodLog,
  addHabit,
  deleteHabit,
  getHabits,
  getLogsForWeek,
  getMoodLogs,
  upsertLog,
  upsertMoodLog,
} from '@/db/queries';

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return d.toISOString().split('T')[0];
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

type State = {
  habits: Habit[];
  logs: HabitLog[];
  moodLogs: MoodLog[];
  weekStart: string;
  loading: boolean;
};

type Action =
  | { type: 'LOAD'; habits: Habit[]; logs: HabitLog[]; moodLogs: MoodLog[] }
  | { type: 'SET_WEEK'; weekStart: string; logs: HabitLog[]; moodLogs: MoodLog[] }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'DELETE_HABIT'; id: number }
  | { type: 'UPSERT_LOG'; log: HabitLog | null; habitId: number; date: string }
  | { type: 'UPSERT_MOOD'; moodLog: MoodLog };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { ...state, habits: action.habits, logs: action.logs, moodLogs: action.moodLogs, loading: false };
    case 'SET_WEEK':
      return { ...state, weekStart: action.weekStart, logs: action.logs, moodLogs: action.moodLogs };
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
    case 'UPSERT_MOOD': {
      const filtered = state.moodLogs.filter((m) => m.date !== action.moodLog.date);
      return { ...state, moodLogs: [...filtered, action.moodLog] };
    }
    default:
      return state;
  }
}

type ContextValue = State & {
  today: string;
  addHabitAction: (name: string) => Promise<void>;
  deleteHabitAction: (id: number) => Promise<void>;
  toggleLog: (habitId: number, date: string) => Promise<void>;
  setMood: (date: string, morning: number | null, evening: number | null) => Promise<void>;
  goToPrevWeek: () => Promise<void>;
  goToNextWeek: () => Promise<void>;
};

const HabitsContext = createContext<ContextValue | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const today = formatDate(new Date());
  const [state, dispatch] = useReducer(reducer, {
    habits: [],
    logs: [],
    moodLogs: [],
    weekStart: getWeekStart(new Date()),
    loading: true,
  });

  useEffect(() => {
    (async () => {
      const [habits, logs, moodLogs] = await Promise.all([
        getHabits(),
        getLogsForWeek(state.weekStart),
        getMoodLogs(state.weekStart),
      ]);
      dispatch({ type: 'LOAD', habits, logs, moodLogs });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWeek = useCallback(async (weekStart: string) => {
    const [logs, moodLogs] = await Promise.all([
      getLogsForWeek(weekStart),
      getMoodLogs(weekStart),
    ]);
    dispatch({ type: 'SET_WEEK', weekStart, logs, moodLogs });
  }, []);

  const addHabitAction = useCallback(async (name: string) => {
    const habit = await addHabit(name.trim());
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

  const setMood = useCallback(async (date: string, morning: number | null, evening: number | null) => {
    await upsertMoodLog(date, morning, evening);
    const existing = state.moodLogs.find((m) => m.date === date);
    dispatch({ type: 'UPSERT_MOOD', moodLog: { id: existing?.id ?? 0, date, morning, evening } });
  }, [state.moodLogs]);

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
      value={{ ...state, today, addHabitAction, deleteHabitAction, toggleLog, setMood, goToPrevWeek, goToNextWeek }}
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
