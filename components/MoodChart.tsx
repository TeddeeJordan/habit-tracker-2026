import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MoodEntry } from '@/db/queries';
import { MOOD_FACES } from './MoodModal';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function dailyAverage(entries: MoodEntry[], date: string): number | null {
  const day = entries.filter((e) => e.date === date);
  if (day.length === 0) return null;
  return day.reduce((s, e) => s + e.score, 0) / day.length;
}

function emojiForAvg(avg: number | null): string {
  if (avg === null) return '';
  const score = Math.min(5, Math.ceil(avg));
  return MOOD_FACES.find((f) => f.score === score)?.emoji ?? '';
}

type Props = {
  moodEntries: MoodEntry[];
  weekStart: string;
};

export default function MoodChart({ moodEntries, weekStart }: Props) {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const values = dates.map((d) => dailyAverage(moodEntries, d));

  return (
    <View style={styles.row}>
      {values.map((v, i) => (
        <View key={i} style={styles.pane}>
          <Text style={styles.emoji}>{emojiForAvg(v)}</Text>
          <Text style={styles.dayLabel}>{DAY_LABELS[i]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  pane: {
    flex: 1,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 28,
  },
  dayLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    fontWeight: '500',
  },
});
