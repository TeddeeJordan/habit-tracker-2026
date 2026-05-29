import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import HabitToggle from '@/components/HabitToggle';
import MoodModal from '@/components/MoodModal';
import { useHabits } from '@/context/HabitsContext';

function formatToday(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export default function TodayScreen() {
  const { habits, logs, today, toggleLog, deleteHabitAction, logMood } = useHabits();

  const [moodHabit, setMoodHabit] = useState<{ id: number; name: string; emoji: string } | null>(null);

  const currentWeekStart = getWeekStart(today);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const completed = habits.filter(
    (h) => logs.some((l) => l.habit_id === h.id && l.date === today && l.status === 'completed'),
  ).length;

  function weeklyCount(habitId: number): number {
    return logs.filter(
      (l) => l.habit_id === habitId && weekDates.includes(l.date) && l.status === 'completed',
    ).length;
  }

  async function handleToggle(habit: { id: number; name: string; emoji: string }) {
    const existing = logs.find((l) => l.habit_id === habit.id && l.date === today);
    const willComplete = !existing; // null → completed; completed → skipped; skipped → null
    await toggleLog(habit.id, today);
    if (willComplete) setMoodHabit(habit);
  }

  async function handleMoodSelect(score: number) {
    await logMood(today, score);
    setMoodHabit(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>{formatToday(today)}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/add-habit')} hitSlop={12}>
            <IconSymbol name="plus" size={22} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        {habits.length > 0 && (
          <View style={styles.progress}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round((completed / habits.length) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>{completed}/{habits.length} done</Text>
          </View>
        )}

        {/* Habit list */}
        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No habits yet.</Text>
            <Text style={styles.emptyHint}>Tap + to add your first habit.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {habits.map((h, i) => {
              const log = logs.find((l) => l.habit_id === h.id && l.date === today);
              return (
                <React.Fragment key={h.id}>
                  <HabitToggle
                    name={h.name}
                    emoji={h.emoji}
                    status={log?.status ?? null}
                    timesPerWeek={h.times_per_week}
                    weeklyCount={weeklyCount(h.id)}
                    onToggle={() => handleToggle(h)}
                    onDelete={() => deleteHabitAction(h.id)}
                  />
                  {i < habits.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>
        )}
      </ScrollView>

      <MoodModal
        visible={moodHabit !== null}
        habitName={moodHabit ? `${moodHabit.emoji} ${moodHabit.name}` : ''}
        onSelect={handleMoodSelect}
        onSkip={() => setMoodHabit(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
    fontWeight: '400',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    minWidth: 48,
    textAlign: 'right',
  },
  list: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    color: '#AAAAAA',
  },
});
