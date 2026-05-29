import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export const MOOD_FACES: { score: number; emoji: string; label: string }[] = [
  { score: 1, emoji: '😢', label: 'Rough' },
  { score: 2, emoji: '😞', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
];

type Props = {
  visible: boolean;
  habitName: string;
  onSelect: (score: number) => void;
  onSkip: () => void;
};

export default function MoodModal({ visible, habitName, onSelect, onSkip }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onSkip}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>After completing {habitName}</Text>

        <View style={styles.faces}>
          {MOOD_FACES.map(({ score, emoji, label }) => (
            <TouchableOpacity
              key={score}
              style={styles.faceBtn}
              onPress={() => onSelect(score)}
              activeOpacity={0.7}
            >
              <Text style={styles.faceEmoji}>{emoji}</Text>
              <Text style={styles.faceLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={onSkip} style={styles.skipBtn} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 28,
  },
  faces: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
  },
  faceBtn: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  faceEmoji: {
    fontSize: 36,
  },
  faceLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#AAAAAA',
    fontWeight: '500',
  },
});
