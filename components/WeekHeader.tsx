import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const CELL_SIZE = 40;

type Props = {
  weekStart: string; // YYYY-MM-DD (Sunday)
  today: string;     // YYYY-MM-DD
};

function addDays(dateStr: string, days: number): Date {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

export default function WeekHeader({ weekStart, today }: Props) {
  return (
    <View style={styles.row}>
      {DAYS.map((day, i) => {
        const date = addDays(weekStart, i);
        const dateNum = date.getDate();
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === today;

        return (
          <View key={i} style={styles.cell}>
            <Text style={styles.dayLabel}>{day}</Text>
            <Text style={[styles.dateNum, isToday && styles.todayNum]}>{dateNum}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateNum: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
  },
  todayNum: {
    color: '#000000',
    textDecorationLine: 'underline',
  },
});
