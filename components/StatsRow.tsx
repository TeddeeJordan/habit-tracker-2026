import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatCardProps = {
  label: string;
  value: string;
  subtitle?: string;
};

function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

type Props = {
  habitCount: number;
  weeklyCompletionPct: number;
  bestStreak: number;
};

export default function StatsRow({ habitCount, weeklyCompletionPct, bestStreak }: Props) {
  return (
    <View style={styles.row}>
      <StatCard
        label={'ACTIVE\nHABITS'}
        value={String(habitCount)}
      />
      <StatCard
        label={'WEEKLY\nCOMPLETION'}
        value={`${weeklyCompletionPct}%`}
        subtitle="this week"
      />
      <StatCard
        label={'BEST\nSTREAK'}
        value={bestStreak === 0 ? '—' : `${bestStreak}d`}
        subtitle="all time"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AAAAAA',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 11,
    color: '#AAAAAA',
    fontWeight: '400',
  },
});
