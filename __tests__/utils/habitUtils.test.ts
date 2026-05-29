import {
  addDays,
  emojiForAvg,
  emojiForScore,
  formatDate,
  getWeekStart,
  longestConsecutiveStreak,
  weeklyCompletionPct,
} from '@/utils/habitUtils';

// ---------------------------------------------------------------------------
// getWeekStart
// ---------------------------------------------------------------------------
describe('getWeekStart', () => {
  it('returns the same date when given a Sunday', () => {
    expect(getWeekStart(new Date('2024-01-07'))).toBe('2024-01-07'); // Sunday
  });

  it('returns the preceding Sunday for a Wednesday', () => {
    expect(getWeekStart(new Date('2024-01-10'))).toBe('2024-01-07'); // Wed → Sun
  });

  it('returns the preceding Sunday for a Saturday', () => {
    expect(getWeekStart(new Date('2024-01-13'))).toBe('2024-01-07');
  });

  it('handles month boundaries correctly', () => {
    expect(getWeekStart(new Date('2024-02-01'))).toBe('2024-01-28'); // Thu in Feb → Sun in Jan
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(formatDate(new Date('2024-06-15'))).toBe('2024-06-15');
  });
});

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------
describe('addDays', () => {
  it('adds positive days within a month', () => {
    expect(addDays('2024-01-10', 5)).toBe('2024-01-15');
  });

  it('crosses month boundaries', () => {
    expect(addDays('2024-01-29', 5)).toBe('2024-02-03');
  });

  it('crosses year boundaries', () => {
    expect(addDays('2023-12-30', 3)).toBe('2024-01-02');
  });

  it('handles zero days', () => {
    expect(addDays('2024-03-15', 0)).toBe('2024-03-15');
  });

  it('subtracts days with negative n', () => {
    expect(addDays('2024-03-05', -3)).toBe('2024-03-02');
  });
});

// ---------------------------------------------------------------------------
// longestConsecutiveStreak
// ---------------------------------------------------------------------------
describe('longestConsecutiveStreak', () => {
  it('returns 0 for an empty array', () => {
    expect(longestConsecutiveStreak([])).toBe(0);
  });

  it('returns 1 for a single date', () => {
    expect(longestConsecutiveStreak(['2024-01-01'])).toBe(1);
  });

  it('returns the length for a fully consecutive sequence', () => {
    expect(longestConsecutiveStreak(['2024-01-01', '2024-01-02', '2024-01-03'])).toBe(3);
  });

  it('returns 1 when all dates have gaps', () => {
    expect(longestConsecutiveStreak(['2024-01-01', '2024-01-03', '2024-01-05'])).toBe(1);
  });

  it('finds the longer run when there are two separate streaks', () => {
    const dates = [
      '2024-01-01', '2024-01-02',        // streak of 2
      '2024-01-05', '2024-01-06', '2024-01-07', '2024-01-08', // streak of 4
    ];
    expect(longestConsecutiveStreak(dates)).toBe(4);
  });

  it('handles a streak crossing month boundaries', () => {
    expect(longestConsecutiveStreak(['2024-01-30', '2024-01-31', '2024-02-01'])).toBe(3);
  });

  it('skips duplicate dates and does not break a real consecutive streak', () => {
    // Jan 1 (dup) + Jan 2 = streak of 2; duplicates are transparent
    expect(longestConsecutiveStreak(['2024-01-01', '2024-01-01', '2024-01-02'])).toBe(2);
  });

  it('does not bridge a gap just because of duplicates', () => {
    // Jan 1 (dup) then Jan 3 — gap should still break streak
    expect(longestConsecutiveStreak(['2024-01-01', '2024-01-01', '2024-01-03'])).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// emojiForScore
// ---------------------------------------------------------------------------
describe('emojiForScore', () => {
  it('maps 1 to crying face', () => { expect(emojiForScore(1)).toBe('😢'); });
  it('maps 2 to frown',       () => { expect(emojiForScore(2)).toBe('😞'); });
  it('maps 3 to neutral',     () => { expect(emojiForScore(3)).toBe('😐'); });
  it('maps 4 to smile',       () => { expect(emojiForScore(4)).toBe('🙂'); });
  it('maps 5 to very happy',  () => { expect(emojiForScore(5)).toBe('😄'); });
  it('returns empty string for out-of-range score', () => {
    expect(emojiForScore(6)).toBe('');
    expect(emojiForScore(0)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// emojiForAvg
// ---------------------------------------------------------------------------
describe('emojiForAvg', () => {
  it('returns empty string for null', () => {
    expect(emojiForAvg(null)).toBe('');
  });

  it('returns exact emoji for whole numbers', () => {
    expect(emojiForAvg(1)).toBe('😢');
    expect(emojiForAvg(3)).toBe('😐');
    expect(emojiForAvg(5)).toBe('😄');
  });

  it('applies ceiling so 1.1 maps to 2', () => {
    expect(emojiForAvg(1.1)).toBe('😞');
  });

  it('applies ceiling so 3.5 maps to 4', () => {
    expect(emojiForAvg(3.5)).toBe('🙂');
  });

  it('clamps values above 5 to 5', () => {
    expect(emojiForAvg(5.9)).toBe('😄');
  });

  it('maps an average of exactly 4.0 to 4', () => {
    expect(emojiForAvg(4.0)).toBe('🙂');
  });
});

// ---------------------------------------------------------------------------
// weeklyCompletionPct
// ---------------------------------------------------------------------------
describe('weeklyCompletionPct', () => {
  it('returns 0 when there are no habits', () => {
    expect(weeklyCompletionPct([], 0)).toBe(0);
  });

  it('returns 0 when nothing is completed', () => {
    expect(weeklyCompletionPct([{ times_per_week: 7 }], 0)).toBe(0);
  });

  it('returns 100 when exactly the target is met', () => {
    expect(weeklyCompletionPct([{ times_per_week: 7 }], 7)).toBe(100);
  });

  it('caps at 100 even when completions exceed target', () => {
    expect(weeklyCompletionPct([{ times_per_week: 3 }], 5)).toBe(100);
  });

  it('calculates percentage across multiple habits', () => {
    const habits = [{ times_per_week: 7 }, { times_per_week: 3 }]; // target = 10
    expect(weeklyCompletionPct(habits, 5)).toBe(50);
  });

  it('rounds to nearest integer', () => {
    const habits = [{ times_per_week: 7 }];
    expect(weeklyCompletionPct(habits, 1)).toBe(14); // 1/7 ≈ 14.28 → 14
  });
});
