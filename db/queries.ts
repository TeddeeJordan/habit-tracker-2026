import { getDb } from './database';

export type Habit = {
  id: number;
  name: string;
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

export async function getHabits(): Promise<Habit[]> {
  return getDb().getAllAsync<Habit>('SELECT * FROM habits ORDER BY created_at ASC');
}

export async function addHabit(name: string): Promise<Habit> {
  const now = new Date().toISOString();
  const result = await getDb().runAsync(
    'INSERT INTO habits (name, created_at) VALUES (?, ?)',
    name,
    now,
  );
  return { id: result.lastInsertRowId, name, created_at: now };
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
