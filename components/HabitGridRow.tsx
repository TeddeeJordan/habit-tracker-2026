import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DayCell from './DayCell';
import { HabitLog } from '@/db/queries';

type Props = {
  habitId: number;
  name: string;
  weekStart: string;
  logs: HabitLog[];
  today: string;
  onToggle: (habitId: number, date: string) => void;
  onLongPress?: () => void;
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function HabitGridRow({ habitId, name, weekStart, logs, today, onToggle, onLongPress }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        const log = logs.find((l) => l.habit_id === habitId && l.date === date);
        const isFuture = date > today;
        return (
          <DayCell
            key={i}
            status={log?.status ?? null}
            onPress={() => !isFuture && onToggle(habitId, date)}
            disabled={isFuture}
          />
        );
      })}
      <TouchableOpacity onLongPress={onLongPress} style={styles.label}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  label: {
    flex: 1,
    paddingLeft: 8,
  },
  name: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '400',
  },
});
