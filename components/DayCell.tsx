import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Status = 'completed' | 'skipped' | null;

const CELL_SIZE = 40;

const bg: Record<NonNullable<Status>, string> = {
  completed: '#1A1A1A',
  skipped: '#F0F0F0',
};

const textColor: Record<NonNullable<Status>, string> = {
  completed: '#FFFFFF',
  skipped: '#AAAAAA',
};

type Props = {
  status: Status;
  onPress?: () => void;
  disabled?: boolean;
};

export default function DayCell({ status, onPress, disabled }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    scale.value = withSpring(0.85, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 150 });
    });
    onPress?.();
  }

  const bgColor = status ? bg[status] : '#E5E5E5';

  return (
    <TouchableOpacity onPress={disabled ? undefined : handlePress} disabled={disabled} activeOpacity={0.8}>
      <Animated.View style={[styles.cell, { backgroundColor: bgColor }, animStyle]}>
        {status === 'skipped' && (
          <Text style={[styles.x, { color: textColor.skipped }]}>×</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  x: {
    fontSize: 18,
    lineHeight: 20,
  },
});
