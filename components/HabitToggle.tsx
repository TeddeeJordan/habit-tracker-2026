import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { HabitLog } from '@/db/queries';

type Status = HabitLog['status'] | null;

type Props = {
  name: string;
  status: Status;
  onToggle: () => void;
};

export default function HabitToggle({ name, status, onToggle }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    scale.value = withSpring(0.9, { duration: 80 }, () => {
      scale.value = withSpring(1, { duration: 120 });
    });
    onToggle();
  }

  const isCompleted = status === 'completed';
  const isSkipped = status === 'skipped';

  return (
    <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.7}>
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
      <Text style={[styles.name, isCompleted && styles.nameCompleted]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
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
  name: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
    flex: 1,
  },
  nameCompleted: {
    color: '#AAAAAA',
    textDecorationLine: 'line-through',
  },
});
