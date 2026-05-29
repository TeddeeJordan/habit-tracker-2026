import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import EmojiPicker from '@/components/EmojiPicker';
import { useHabits } from '@/context/HabitsContext';

const DEFAULT_EMOJI = '🏃';

export default function AddHabitModal() {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);
  const [timesPerWeek, setTimesPerWeek] = useState(7);
  const [saving, setSaving] = useState(false);
  const { addHabitAction } = useHabits();

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await addHabitAction(trimmed, emoji, timesPerWeek);
    router.back();
  }

  function decrement() { setTimesPerWeek((n) => Math.max(1, n - 1)); }
  function increment() { setTimesPerWeek((n) => Math.min(7, n + 1)); }

  const freqLabel = timesPerWeek === 7 ? 'Every day' : `${timesPerWeek}× per week`;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Emoji */}
          <Text style={styles.label}>Icon</Text>
          <EmojiPicker selected={emoji} onSelect={setEmoji} />

          {/* Name */}
          <Text style={[styles.label, { marginTop: 24 }]}>Habit name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Meditate, Read, Exercise…"
            placeholderTextColor="#AAAAAA"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            maxLength={60}
          />

          {/* Frequency */}
          <Text style={[styles.label, { marginTop: 24 }]}>Frequency</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={[styles.stepBtn, timesPerWeek === 1 && styles.stepBtnDisabled]}
              onPress={decrement}
              disabled={timesPerWeek === 1}
              hitSlop={8}
            >
              <Text style={[styles.stepBtnText, timesPerWeek === 1 && styles.stepBtnTextDisabled]}>−</Text>
            </TouchableOpacity>
            <Text style={styles.freqLabel}>{freqLabel}</Text>
            <TouchableOpacity
              style={[styles.stepBtn, timesPerWeek === 7 && styles.stepBtnDisabled]}
              onPress={increment}
              disabled={timesPerWeek === 7}
              hitSlop={8}
            >
              <Text style={[styles.stepBtnText, timesPerWeek === 7 && styles.stepBtnTextDisabled]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, (!name.trim() || saving) && styles.buttonDisabled]}
            onPress={handleAdd}
            disabled={!name.trim() || saving}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{emoji} Add Habit</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  container: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  input: {
    fontSize: 18,
    color: '#000000',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    paddingVertical: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  stepBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '300',
  },
  stepBtnTextDisabled: {
    color: '#AAAAAA',
  },
  freqLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    flex: 1,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 36,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
