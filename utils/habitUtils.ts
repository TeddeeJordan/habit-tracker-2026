// Pure utility functions — no React Native deps, fully unit-testable.

const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😞',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

/** Find the longest run of consecutive calendar dates in a sorted array of YYYY-MM-DD strings. */
export function longestConsecutiveStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  let best = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff =
      (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86_400_000;
    if (diff === 1) {
      best = Math.max(best, ++current);
    } else if (diff !== 0) { // diff === 0 means duplicate date — skip without breaking streak
      current = 1;
    }
  }
  return best;
}

export function emojiForScore(score: number): string {
  return MOOD_EMOJI[score] ?? '';
}

/** Returns the emoji for Math.ceil(avg), capped at 5. Returns '' for null. */
export function emojiForAvg(avg: number | null): string {
  if (avg === null) return '';
  return emojiForScore(Math.min(5, Math.ceil(avg)));
}

/** (completed logs this week) / (sum of times_per_week targets) as a 0-100 integer. */
export function weeklyCompletionPct(
  habits: { times_per_week: number }[],
  completedCount: number,
): number {
  const target = habits.reduce((s, h) => s + h.times_per_week, 0);
  if (target === 0) return 0;
  return Math.min(100, Math.round((completedCount / target) * 100));
}
