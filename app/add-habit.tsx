import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useHabits } from '@/context/HabitsContext';

export default function AddHabitModal() {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { addHabitAction } = useHabits();

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await addHabitAction(trimmed);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <Text style={styles.label}>Habit name</Text>
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
          <TouchableOpacity
            style={[styles.button, (!name.trim() || saving) && styles.buttonDisabled]}
            onPress={handleAdd}
            disabled={!name.trim() || saving}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Add Habit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    fontSize: 18,
    color: '#000000',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    paddingVertical: 10,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
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
