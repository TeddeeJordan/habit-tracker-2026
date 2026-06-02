// Mock the DB layer so expo-sqlite is never imported in the test environment
jest.mock('@/db/queries', () => ({}));
jest.mock('@/db/database', () => ({}));

import { reducer, State, Action } from '@/context/HabitsContext';
import type { Habit, HabitLog, MoodEntry } from '@/db/queries';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeHabit = (id: number, name = 'Test'): Habit => ({
  id,
  name,
  emoji: '🏃',
  times_per_week: 7,
  created_at: '2024-01-01T00:00:00.000Z',
});

const makeLog = (habitId: number, date: string, status: HabitLog['status'] = 'completed'): HabitLog => ({
  id: habitId * 100,
  habit_id: habitId,
  date,
  status,
});

const makeMoodEntry = (id: number, date: string, score = 4, habitId: number | null = null): MoodEntry => ({
  id,
  date,
  score,
  habit_id: habitId,
  created_at: '2024-01-01T00:00:00.000Z',
});

const emptyState: State = {
  habits: [],
  logs: [],
  moodEntries: [],
  weekStart: '2024-01-07',
  loading: true,
  pendingMoodHabit: null,
};

// ---------------------------------------------------------------------------
// LOAD
// ---------------------------------------------------------------------------
describe('LOAD', () => {
  it('populates habits, logs and moodEntries and clears loading', () => {
    const habits = [makeHabit(1)];
    const logs = [makeLog(1, '2024-01-07')];
    const moodEntries = [makeMoodEntry(1, '2024-01-07')];

    const state = reducer(emptyState, { type: 'LOAD', habits, logs, moodEntries });

    expect(state.habits).toEqual(habits);
    expect(state.logs).toEqual(logs);
    expect(state.moodEntries).toEqual(moodEntries);
    expect(state.loading).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SET_WEEK
// ---------------------------------------------------------------------------
describe('SET_WEEK', () => {
  it('updates weekStart, logs and moodEntries', () => {
    const logs = [makeLog(1, '2024-01-14')];
    const moodEntries = [makeMoodEntry(1, '2024-01-14')];

    const state = reducer(emptyState, { type: 'SET_WEEK', weekStart: '2024-01-14', logs, moodEntries });

    expect(state.weekStart).toBe('2024-01-14');
    expect(state.logs).toEqual(logs);
    expect(state.moodEntries).toEqual(moodEntries);
  });
});

// ---------------------------------------------------------------------------
// ADD_HABIT
// ---------------------------------------------------------------------------
describe('ADD_HABIT', () => {
  it('appends the new habit to the list', () => {
    const existing = { ...emptyState, habits: [makeHabit(1)] };
    const state = reducer(existing, { type: 'ADD_HABIT', habit: makeHabit(2, 'Meditate') });

    expect(state.habits).toHaveLength(2);
    expect(state.habits[1].name).toBe('Meditate');
  });

  it('does not mutate other state', () => {
    const state = reducer(emptyState, { type: 'ADD_HABIT', habit: makeHabit(1) });
    expect(state.logs).toBe(emptyState.logs);
  });
});

// ---------------------------------------------------------------------------
// DELETE_HABIT
// ---------------------------------------------------------------------------
describe('DELETE_HABIT', () => {
  it('removes the habit with the given id', () => {
    const existing = { ...emptyState, habits: [makeHabit(1), makeHabit(2)] };
    const state = reducer(existing, { type: 'DELETE_HABIT', id: 1 });

    expect(state.habits).toHaveLength(1);
    expect(state.habits[0].id).toBe(2);
  });

  it('does nothing if id does not exist', () => {
    const existing = { ...emptyState, habits: [makeHabit(1)] };
    const state = reducer(existing, { type: 'DELETE_HABIT', id: 99 });
    expect(state.habits).toHaveLength(1);
  });

  it('removes mood entries linked to the deleted habit', () => {
    const existing = {
      ...emptyState,
      habits: [makeHabit(1), makeHabit(2)],
      moodEntries: [makeMoodEntry(1, '2024-01-08', 4, 1), makeMoodEntry(2, '2024-01-09', 5, 2)],
    };
    const state = reducer(existing, { type: 'DELETE_HABIT', id: 1 });

    expect(state.moodEntries).toHaveLength(1);
    expect(state.moodEntries[0].habit_id).toBe(2);
  });

  it('preserves legacy mood entries with no habit_id (null)', () => {
    const existing = {
      ...emptyState,
      habits: [makeHabit(1)],
      moodEntries: [makeMoodEntry(1, '2024-01-08', 4, null)],
    };
    const state = reducer(existing, { type: 'DELETE_HABIT', id: 1 });

    expect(state.moodEntries).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// UPSERT_LOG
// ---------------------------------------------------------------------------
describe('UPSERT_LOG', () => {
  it('adds a new log when none exists for that habit+date', () => {
    const log = makeLog(1, '2024-01-08');
    const state = reducer(emptyState, { type: 'UPSERT_LOG', log, habitId: 1, date: '2024-01-08' });
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0]).toEqual(log);
  });

  it('replaces an existing log for the same habit+date', () => {
    const existing = { ...emptyState, logs: [makeLog(1, '2024-01-08', 'completed')] };
    const updated = makeLog(1, '2024-01-08', 'skipped');

    const state = reducer(existing, { type: 'UPSERT_LOG', log: updated, habitId: 1, date: '2024-01-08' });

    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].status).toBe('skipped');
  });

  it('removes the log when log is null (toggle off)', () => {
    const existing = { ...emptyState, logs: [makeLog(1, '2024-01-08')] };
    const state = reducer(existing, { type: 'UPSERT_LOG', log: null, habitId: 1, date: '2024-01-08' });
    expect(state.logs).toHaveLength(0);
  });

  it('does not affect logs for other habits on the same date', () => {
    const existing = { ...emptyState, logs: [makeLog(2, '2024-01-08')] };
    const state = reducer(existing, { type: 'UPSERT_LOG', log: null, habitId: 1, date: '2024-01-08' });
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].habit_id).toBe(2);
  });

  it('removes mood entries when a completed log is un-completed (→ skipped)', () => {
    const existing = {
      ...emptyState,
      logs: [makeLog(1, '2024-01-08', 'completed')],
      moodEntries: [makeMoodEntry(1, '2024-01-08', 4, 1)],
    };
    const skipped = makeLog(1, '2024-01-08', 'skipped');
    const state = reducer(existing, { type: 'UPSERT_LOG', log: skipped, habitId: 1, date: '2024-01-08' });

    expect(state.moodEntries).toHaveLength(0);
  });

  it('does not remove mood entries for other habits when un-completing', () => {
    const existing = {
      ...emptyState,
      logs: [makeLog(1, '2024-01-08', 'completed')],
      moodEntries: [makeMoodEntry(1, '2024-01-08', 4, 2)],
    };
    const skipped = makeLog(1, '2024-01-08', 'skipped');
    const state = reducer(existing, { type: 'UPSERT_LOG', log: skipped, habitId: 1, date: '2024-01-08' });

    expect(state.moodEntries).toHaveLength(1);
  });

  it('does not remove mood entries when a skipped log is removed', () => {
    const existing = {
      ...emptyState,
      logs: [makeLog(1, '2024-01-08', 'skipped')],
      moodEntries: [makeMoodEntry(1, '2024-01-08', 4, 1)],
    };
    const state = reducer(existing, { type: 'UPSERT_LOG', log: null, habitId: 1, date: '2024-01-08' });

    expect(state.moodEntries).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ADD_MOOD_ENTRY
// ---------------------------------------------------------------------------
describe('ADD_MOOD_ENTRY', () => {
  it('appends a new mood entry', () => {
    const entry = makeMoodEntry(1, '2024-01-08', 5);
    const state = reducer(emptyState, { type: 'ADD_MOOD_ENTRY', entry });
    expect(state.moodEntries).toHaveLength(1);
    expect(state.moodEntries[0].score).toBe(5);
  });

  it('accumulates multiple entries for the same day', () => {
    const first = { ...emptyState, moodEntries: [makeMoodEntry(1, '2024-01-08', 3)] };
    const state = reducer(first, { type: 'ADD_MOOD_ENTRY', entry: makeMoodEntry(2, '2024-01-08', 5) });
    expect(state.moodEntries).toHaveLength(2);
  });
});
