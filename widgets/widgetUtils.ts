import { ensureDb } from '@/db/database';
import { getHabits, getLogsForWeek } from '@/db/queries';
import { formatDate, getWeekStart } from '@/utils/habitUtils';

export type WidgetHabit = {
  id: number;
  name: string;
  emoji: string;
  completedToday: boolean;
  weeklyCount: number;
  timesPerWeek: number;
};

export async function getTodayHabits(): Promise<{ habits: WidgetHabit[]; todayStr: string }> {
  await ensureDb();
  const todayStr = formatDate(new Date());
  const weekStart = getWeekStart(new Date());
  const [habits, logs] = await Promise.all([getHabits(), getLogsForWeek(weekStart)]);

  const completedToday = new Set(
    logs
      .filter((l) => l.date === todayStr && l.status === 'completed')
      .map((l) => l.habit_id),
  );

  const weeklyCount: Record<number, number> = {};
  for (const log of logs) {
    if (log.status === 'completed') {
      weeklyCount[log.habit_id] = (weeklyCount[log.habit_id] ?? 0) + 1;
    }
  }

  return {
    todayStr,
    habits: habits.map((h) => ({
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      completedToday: completedToday.has(h.id),
      weeklyCount: weeklyCount[h.id] ?? 0,
      timesPerWeek: h.times_per_week,
    })),
  };
}
