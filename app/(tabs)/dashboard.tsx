import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import WeekHeader from '@/components/WeekHeader';
import HabitGridRow from '@/components/HabitGridRow';
import MoodChart from '@/components/MoodChart';
import StatsRow from '@/components/StatsRow';
import { useHabits } from '@/context/HabitsContext';
import { getBestStreak } from '@/db/queries';

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

function currentWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

export default function DashboardScreen() {
  const { habits, logs, moodEntries, weekStart, today, toggleLog, deleteHabitAction, goToPrevWeek, goToNextWeek } = useHabits();
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    getBestStreak().then(setBestStreak);
  }, [logs]); // recompute when logs change

  const isCurrentWeek = weekStart === currentWeekStart();

  // Weekly completion %: (completed logs this view-week) / (sum of times_per_week targets)
  const weeklyTarget = habits.reduce((sum, h) => sum + h.times_per_week, 0);
  const weeklyDone = logs.filter((l) => l.status === 'completed').length;
  const weeklyPct = weeklyTarget === 0 ? 0 : Math.min(100, Math.round((weeklyDone / weeklyTarget) * 100));

  function confirmDelete(id: number, name: string) {
    Alert.alert(`Delete "${name}"?`, 'This will remove all log history for this habit.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabitAction(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity onPress={() => router.push('/add-habit')} hitSlop={12}>
            <IconSymbol name="plus" size={22} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <StatsRow
          habitCount={habits.length}
          weeklyCompletionPct={weeklyPct}
          bestStreak={bestStreak}
        />

        {/* Week navigator */}
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={goToPrevWeek} hitSlop={12}>
            <IconSymbol name="chevron.left" size={18} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.weekLabel}>{formatWeekRange(weekStart)}</Text>
          <TouchableOpacity onPress={goToNextWeek} disabled={isCurrentWeek} hitSlop={12}>
            <IconSymbol name="chevron.right" size={18} color={isCurrentWeek ? '#CCCCCC' : '#000000'} />
          </TouchableOpacity>
        </View>

        {/* Grid */}
        {habits.length === 0 ? (
          <View style={styles.emptyGrid}>
            <Text style={styles.emptyText}>No habits yet.</Text>
            <Text style={styles.emptyHint}>Tap + to add your first habit.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            <WeekHeader weekStart={weekStart} today={today} />
            {habits.map((h) => (
              <HabitGridRow
                key={h.id}
                habitId={h.id}
                name={h.name}
                emoji={h.emoji}
                weekStart={weekStart}
                logs={logs}
                today={today}
                onToggle={toggleLog}
                onLongPress={() => confirmDelete(h.id, h.name)}
              />
            ))}
          </View>
        )}

        {/* Mood section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mood score</Text>
          <IconSymbol name="chevron.right" size={16} color="#AAAAAA" />
        </View>
        <View style={styles.chartCard}>
          <MoodChart moodEntries={moodEntries} weekStart={weekStart} />
        </View>
      </ScrollView>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  weekLabel: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
  grid: {
    marginBottom: 28,
  },
  emptyGrid: {
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 28,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  chartCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
  },
});
