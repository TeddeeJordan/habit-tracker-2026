import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { HabitLog } from '@/db/queries';

type Status = HabitLog['status'] | null;

type Props = {
  name: string;
  emoji: string;
  status: Status;
  timesPerWeek: number;
  weeklyCount: number;
  onToggle: () => void;
  onDelete: () => void;
};

export default function HabitToggle({ name, emoji, status, timesPerWeek, weeklyCount, onToggle, onDelete }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    scale.value = withSpring(0.9, { duration: 80 }, () => {
      scale.value = withSpring(1, { duration: 120 });
    });
    onToggle();
  }

  function handleLongPress() {
    Alert.alert(`Delete "${name}"?`, 'All history for this habit will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  }

  const isCompleted = status === 'completed';
  const isSkipped = status === 'skipped';
  const showWeeklyBadge = timesPerWeek < 7;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <Animated.View
        style={[
          styles.check,
          isCompleted && styles.checkCompleted,
          isSkipped && styles.checkSkipped,
          animStyle,
        ]}
      >
        {isCompleted && <Text style={styles.checkMark}>✓</Text>}
        {isSkipped && <Text style={styles.skipMark}>×</Text>}
      </Animated.View>

      <Text style={styles.emojiText}>{emoji}</Text>

      <View style={styles.nameBlock}>
        <Text style={[styles.name, isCompleted && styles.nameCompleted]} numberOfLines={1}>
          {name}
        </Text>
        {showWeeklyBadge && (
          <Text style={styles.weeklyHint}>
            {weeklyCount}/{timesPerWeek} this week
          </Text>
        )}
      </View>

      {showWeeklyBadge && (
        <View style={[styles.badge, weeklyCount >= timesPerWeek && styles.badgeDone]}>
          <Text style={[styles.badgeText, weeklyCount >= timesPerWeek && styles.badgeTextDone]}>
            {weeklyCount}/{timesPerWeek}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCompleted: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkSkipped: {
    backgroundColor: '#F0F0F0',
    borderColor: '#DDDDDD',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  skipMark: {
    color: '#AAAAAA',
    fontSize: 16,
    lineHeight: 18,
  },
  emojiText: {
    fontSize: 20,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  nameCompleted: {
    color: '#AAAAAA',
    textDecorationLine: 'line-through',
  },
  weeklyHint: {
    fontSize: 11,
    color: '#AAAAAA',
  },
  badge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeDone: {
    backgroundColor: '#000000',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
  },
  badgeTextDone: {
    color: '#FFFFFF',
  },
});
