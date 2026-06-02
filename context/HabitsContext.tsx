import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import {
  Habit,
  HabitLog,
  MoodEntry,
  addHabit,
  addMoodEntry,
  deleteHabit,
  deleteMoodEntriesForHabit,
  deleteMoodEntriesForLog,
  getHabits,
  getLogsForWeek,
  getMoodEntriesForWeek,
  upsertLog,
} from '@/db/queries';
import { formatDate, getWeekStart } from '@/utils/habitUtils';
import {
  cancelHabitNotification,
  requestNotificationPermissions,
  scheduleHabitNotification,
  setupNotificationCategory,
  syncHabitNotifications,
} from '@/utils/notificationService';
import { HabitWidget } from '@/widgets/HabitWidget';
import { getTodayHabits } from '@/widgets/widgetUtils';

async function syncWidget() {
  if (Platform.OS !== 'android') return;
  const { habits } = await getTodayHabits();
  await requestWidgetUpdate({
    widgetName: 'HabitWidget',
    renderWidget: () => <HabitWidget habits={habits} />,
    widgetNotFound: () => {},
  }).catch(() => {});
}

type PendingMoodHabit = { id: number; name: string; emoji: string };

export type State = {
  habits: Habit[];
  logs: HabitLog[];
  moodEntries: MoodEntry[];
  weekStart: string;
  loading: boolean;
  pendingMoodHabit: PendingMoodHabit | null;
};

export type Action =
  | { type: 'LOAD'; habits: Habit[]; logs: HabitLog[]; moodEntries: MoodEntry[] }
  | { type: 'SET_WEEK'; weekStart: string; logs: HabitLog[]; moodEntries: MoodEntry[] }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'DELETE_HABIT'; id: number }
  | { type: 'UPSERT_LOG'; log: HabitLog | null; habitId: number; date: string }
  | { type: 'ADD_MOOD_ENTRY'; entry: MoodEntry }
  | { type: 'SET_PENDING_MOOD_HABIT'; habit: PendingMoodHabit | null };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { ...state, habits: action.habits, logs: action.logs, moodEntries: action.moodEntries, loading: false };
    case 'SET_WEEK':
      return { ...state, weekStart: action.weekStart, logs: action.logs, moodEntries: action.moodEntries };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.id),
        moodEntries: state.moodEntries.filter((e) => e.habit_id !== action.id),
      };
    case 'UPSERT_LOG': {
      const oldLog = state.logs.find(
        (l) => l.habit_id === action.habitId && l.date === action.date,
      );
      const filtered = state.logs.filter(
        (l) => !(l.habit_id === action.habitId && l.date === action.date),
      );
      const newLogs = action.log ? [...filtered, action.log] : filtered;
      const wasCompleted = oldLog?.status === 'completed';
      const isNowCompleted = action.log?.status === 'completed';
      const newMoodEntries =
        wasCompleted && !isNowCompleted
          ? state.moodEntries.filter(
              (e) => !(e.habit_id === action.habitId && e.date === action.date),
            )
          : state.moodEntries;
      return { ...state, logs: newLogs, moodEntries: newMoodEntries };
    }
    case 'ADD_MOOD_ENTRY':
      return { ...state, moodEntries: [...state.moodEntries, action.entry] };
    case 'SET_PENDING_MOOD_HABIT':
      return { ...state, pendingMoodHabit: action.habit };
    default:
      return state;
  }
}

type ContextValue = State & {
  today: string;
  addHabitAction: (name: string, emoji: string, timesPerWeek: number) => Promise<void>;
  deleteHabitAction: (id: number) => Promise<void>;
  toggleLog: (habitId: number, date: string) => Promise<void>;
  logMood: (date: string, score: number, habitId: number) => Promise<void>;
  goToPrevWeek: () => Promise<void>;
  goToNextWeek: () => Promise<void>;
  setPendingMoodHabit: (habit: PendingMoodHabit | null) => void;
  completeHabitFromNotification: (habitId: number, habitInfo: PendingMoodHabit) => Promise<void>;
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
    pendingMoodHabit: null,
  });

  useEffect(() => {
    (async () => {
      const currentWeekStart = getWeekStart(new Date());
      const [habits, logs, moodEntries] = await Promise.all([
        getHabits(),
        getLogsForWeek(currentWeekStart),
        getMoodEntriesForWeek(currentWeekStart),
      ]);
      dispatch({ type: 'LOAD', habits, logs, moodEntries });
      syncWidget().catch(() => {});

      // Sync notifications: schedule for habits that haven't met their weekly goal
      const granted = await requestNotificationPermissions();
      if (granted) {
        await setupNotificationCategory();
        const todayStr = formatDate(new Date());
        const completionCountByHabitId: Record<number, number> = {};
        const completedTodayIds = new Set<number>();
        for (const log of logs) {
          if (log.status === 'completed') {
            completionCountByHabitId[log.habit_id] = (completionCountByHabitId[log.habit_id] ?? 0) + 1;
            if (log.date === todayStr) completedTodayIds.add(log.habit_id);
          }
        }
        await syncHabitNotifications(habits, completionCountByHabitId, completedTodayIds);
      }
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
    await scheduleHabitNotification(habit).catch(() => {});
    syncWidget().catch(() => {});
  }, []);

  const deleteHabitAction = useCallback(async (id: number) => {
    await Promise.all([deleteHabit(id), deleteMoodEntriesForHabit(id)]);
    dispatch({ type: 'DELETE_HABIT', id });
    await cancelHabitNotification(id).catch(() => {});
    syncWidget().catch(() => {});
  }, []);

  const toggleLog = useCallback(async (habitId: number, date: string) => {
    const existing = state.logs.find((l) => l.habit_id === habitId && l.date === date);
    let nextStatus: 'completed' | 'skipped' | null;
    if (!existing) nextStatus = 'completed';
    else if (existing.status === 'completed') nextStatus = 'skipped';
    else nextStatus = null;

    const ops: Promise<unknown>[] = [upsertLog(habitId, date, nextStatus)];
    if (existing?.status === 'completed') {
      ops.push(deleteMoodEntriesForLog(habitId, date));
    }
    if (nextStatus === 'completed' && date === today) {
      ops.push(cancelHabitNotification(habitId).catch(() => {}));
    }
    await Promise.all(ops);

    const log: HabitLog | null =
      nextStatus ? { id: existing?.id ?? 0, habit_id: habitId, date, status: nextStatus } : null;
    dispatch({ type: 'UPSERT_LOG', log, habitId, date });
    syncWidget().catch(() => {});
  }, [state.logs, today]);

  const logMood = useCallback(async (date: string, score: number, habitId: number) => {
    const entry = await addMoodEntry(date, score, habitId);
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

  const setPendingMoodHabit = useCallback((habit: PendingMoodHabit | null) => {
    dispatch({ type: 'SET_PENDING_MOOD_HABIT', habit });
  }, []);

  // Called by the notification response handler when the user taps "Yes".
  // Marks the habit completed directly (does not cycle through states) and
  // cancels the daily notification if the weekly goal is now met.
  const completeHabitFromNotification = useCallback(async (
    habitId: number,
    habitInfo: PendingMoodHabit,
  ) => {
    const todayStr = formatDate(new Date());
    const weekStart = getWeekStart(new Date());

    // Query DB fresh to avoid stale state issues on cold start
    const [allHabits, weekLogs] = await Promise.all([getHabits(), getLogsForWeek(weekStart)]);

    // Prevent duplicate completions if user taps "Yes" on an old/repeated notification
    const alreadyDone = weekLogs.some(
      l => l.habit_id === habitId && l.date === todayStr && l.status === 'completed',
    );
    if (alreadyDone) return;

    await upsertLog(habitId, todayStr, 'completed');
    const log: HabitLog = { id: 0, habit_id: habitId, date: todayStr, status: 'completed' };
    dispatch({ type: 'UPSERT_LOG', log, habitId, date: todayStr });
    dispatch({ type: 'SET_PENDING_MOOD_HABIT', habit: habitInfo });
    syncWidget().catch(() => {});

    // Cancel notification if the weekly goal is now met
    const habit = allHabits.find(h => h.id === habitId);
    const completedThisWeek = weekLogs.filter(
      l => l.habit_id === habitId && l.status === 'completed',
    ).length + 1; // +1 for the completion we just added

    if (habit && completedThisWeek >= habit.times_per_week) {
      await cancelHabitNotification(habitId).catch(() => {});
    }
  }, []);

  return (
    <HabitsContext.Provider
      value={{
        ...state,
        today,
        addHabitAction,
        deleteHabitAction,
        toggleLog,
        logMood,
        goToPrevWeek,
        goToNextWeek,
        setPendingMoodHabit,
        completeHabitFromNotification,
      }}
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
