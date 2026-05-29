import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const EMOJIS = [
  '🏃', '💪', '🧘', '🚴', '🏊', '🏋️', '🤸', '🚶',
  '📚', '✍️', '📝', '💻', '🎨', '🎵', '🎤', '🧩',
  '💧', '🥗', '🍎', '☕', '😴', '🌅', '🌙', '🧠',
  '🧹', '💊', '🌿', '🙏', '🔥', '⭐', '🎯', '❤️',
];

type Props = {
  selected: string;
  onSelect: (emoji: string) => void;
};

export default function EmojiPicker({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          style={[styles.cell, selected === emoji && styles.cellSelected]}
          onPress={() => onSelect(emoji)}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: '#000000',
  },
  emoji: {
    fontSize: 22,
  },
});
