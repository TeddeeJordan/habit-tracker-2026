import { getDb } from './database';
import { longestConsecutiveStreak } from '@/utils/habitUtils';

export type Habit = {
  id: number;
  name: string;
  emoji: string;
  times_per_week: number;
  created_at: string;
};

export type HabitLog = {
  id: number;
  habit_id: number;
  date: string;
  status: 'completed' | 'skipped';
};

export type MoodLog = {
  id: number;
  date: string;
  morning: number | null;
  evening: number | null;
};

export type MoodEntry = {
  id: number;
  date: string;
  score: number;
  habit_id: number | null;
  created_at: string;
};

export async function getHabits(): Promise<Habit[]> {
  return getDb().getAllAsync<Habit>('SELECT * FROM habits ORDER BY created_at ASC');
}

export async function addHabit(name: string, emoji: string, timesPerWeek: number): Promise<Habit> {
  const now = new Date().toISOString();
  const result = await getDb().runAsync(
    'INSERT INTO habits (name, emoji, times_per_week, created_at) VALUES (?, ?, ?, ?)',
    name,
    emoji,
    timesPerWeek,
    now,
  );
  return { id: result.lastInsertRowId, name, emoji, times_per_week: timesPerWeek, created_at: now };
}

export async function deleteHabit(id: number): Promise<void> {
  await getDb().runAsync('DELETE FROM habits WHERE id = ?', id);
}

export async function getLogsForWeek(weekStart: string): Promise<HabitLog[]> {
  return getDb().getAllAsync<HabitLog>(
    `SELECT * FROM habit_logs
     WHERE date >= ? AND date < date(?, '+7 days')`,
    weekStart,
    weekStart,
  );
}

export async function upsertLog(
  habitId: number,
  date: string,
  status: 'completed' | 'skipped' | null,
): Promise<void> {
  if (status === null) {
    await getDb().runAsync(
      'DELETE FROM habit_logs WHERE habit_id = ? AND date = ?',
      habitId,
      date,
    );
  } else {
    await getDb().runAsync(
      `INSERT INTO habit_logs (habit_id, date, status) VALUES (?, ?, ?)
       ON CONFLICT(habit_id, date) DO UPDATE SET status = excluded.status`,
      habitId,
      date,
      status,
    );
  }
}

export async function getMoodLogs(weekStart: string): Promise<MoodLog[]> {
  return getDb().getAllAsync<MoodLog>(
    `SELECT * FROM mood_logs
     WHERE date >= ? AND date < date(?, '+7 days')`,
    weekStart,
    weekStart,
  );
}

export async function upsertMoodLog(
  date: string,
  morning: number | null,
  evening: number | null,
): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO mood_logs (date, morning, evening) VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET morning = excluded.morning, evening = excluded.evening`,
    date,
    morning,
    evening,
  );
}

export async function getMoodEntriesForWeek(weekStart: string): Promise<MoodEntry[]> {
  return getDb().getAllAsync<MoodEntry>(
    `SELECT * FROM mood_entries
     WHERE date >= ? AND date < date(?, '+7 days')
     ORDER BY created_at ASC`,
    weekStart,
    weekStart,
  );
}

export async function addMoodEntry(date: string, score: number, habitId: number): Promise<MoodEntry> {
  const now = new Date().toISOString();
  const result = await getDb().runAsync(
    'INSERT INTO mood_entries (date, score, habit_id, created_at) VALUES (?, ?, ?, ?)',
    date,
    score,
    habitId,
    now,
  );
  return { id: result.lastInsertRowId, date, score, habit_id: habitId, created_at: now };
}

export async function deleteMoodEntriesForLog(habitId: number, date: string): Promise<void> {
  await getDb().runAsync(
    'DELETE FROM mood_entries WHERE habit_id = ? AND date = ?',
    habitId,
    date,
  );
}

export async function deleteMoodEntriesForHabit(habitId: number): Promise<void> {
  await getDb().runAsync(
    'DELETE FROM mood_entries WHERE habit_id = ?',
    habitId,
  );
}

export type ProfileRow = {
  id: number;
  name: string;
  bio: string;
  photo_uri: string | null;
};

export async function getProfile(): Promise<ProfileRow | null> {
  return getDb().getFirstAsync<ProfileRow>('SELECT * FROM profile WHERE id = 1');
}

export async function upsertProfile(
  name: string,
  bio: string,
  photoUri: string | null,
): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO profile (id, name, bio, photo_uri) VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, bio = excluded.bio, photo_uri = excluded.photo_uri`,
    name,
    bio,
    photoUri,
  );
}

export async function getBestStreak(): Promise<number> {
  const rows = await getDb().getAllAsync<{ date: string }>(
    `SELECT DISTINCT date FROM habit_logs WHERE status = 'completed' ORDER BY date ASC`,
  );
  return longestConsecutiveStreak(rows.map((r) => r.date));
}
