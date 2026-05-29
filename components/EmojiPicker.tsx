import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type EmojiItem = { emoji: string; keywords: string[] };

const EMOJIS: EmojiItem[] = [
  // Fitness
  { emoji: '🏃', keywords: ['run', 'running', 'jog', 'cardio', 'exercise', 'sprint'] },
  { emoji: '💪', keywords: ['workout', 'gym', 'strong', 'strength', 'lift', 'muscle', 'exercise'] },
  { emoji: '🧘', keywords: ['meditate', 'meditation', 'yoga', 'mindfulness', 'breathe', 'calm'] },
  { emoji: '🚴', keywords: ['bike', 'cycling', 'bicycle', 'cycle', 'cardio', 'exercise'] },
  { emoji: '🏊', keywords: ['swim', 'swimming', 'pool', 'water', 'exercise'] },
  { emoji: '🏋️', keywords: ['lift', 'weights', 'gym', 'workout', 'strength', 'exercise', 'barbell'] },
  { emoji: '🤸', keywords: ['stretch', 'flexible', 'gymnastics', 'yoga', 'exercise'] },
  { emoji: '🚶', keywords: ['walk', 'walking', 'steps', 'stroll', 'hike', 'outdoors'] },
  { emoji: '🧗', keywords: ['climb', 'climbing', 'rock', 'bouldering', 'sport'] },
  { emoji: '🏄', keywords: ['surf', 'surfing', 'beach', 'water', 'ocean', 'sport'] },
  { emoji: '🎾', keywords: ['tennis', 'sport', 'exercise', 'racket', 'ball'] },
  { emoji: '⚽', keywords: ['soccer', 'football', 'sport', 'ball', 'game', 'exercise'] },
  { emoji: '🏀', keywords: ['basketball', 'sport', 'ball', 'game', 'exercise'] },
  { emoji: '🏔️', keywords: ['hike', 'hiking', 'mountain', 'climb', 'outdoors', 'nature', 'trail'] },
  { emoji: '🌊', keywords: ['swim', 'surf', 'water', 'beach', 'ocean', 'cold'] },
  // Mind & Learning
  { emoji: '📚', keywords: ['read', 'reading', 'book', 'books', 'study', 'learn'] },
  { emoji: '📖', keywords: ['read', 'reading', 'book', 'study', 'learn'] },
  { emoji: '✍️', keywords: ['write', 'writing', 'journal', 'notes', 'diary', 'sketch'] },
  { emoji: '📝', keywords: ['notes', 'write', 'journal', 'study', 'list', 'plan', 'todo'] },
  { emoji: '💻', keywords: ['code', 'coding', 'computer', 'work', 'program', 'dev', 'develop'] },
  { emoji: '🎨', keywords: ['art', 'draw', 'paint', 'creative', 'design', 'sketch'] },
  { emoji: '🎵', keywords: ['music', 'sing', 'listen', 'song', 'practice', 'instrument', 'melody'] },
  { emoji: '🎤', keywords: ['sing', 'singing', 'voice', 'music', 'karaoke', 'vocal'] },
  { emoji: '🎹', keywords: ['piano', 'music', 'instrument', 'practice', 'keys', 'keyboard'] },
  { emoji: '🎸', keywords: ['guitar', 'music', 'instrument', 'practice', 'band', 'strum'] },
  { emoji: '🧩', keywords: ['puzzle', 'game', 'brain', 'logic', 'think', 'fun'] },
  { emoji: '🧠', keywords: ['brain', 'think', 'smart', 'learn', 'study', 'memory', 'mental', 'cognition'] },
  { emoji: '💡', keywords: ['idea', 'learn', 'think', 'create', 'innovate', 'inspiration'] },
  { emoji: '🗣️', keywords: ['speak', 'language', 'talk', 'communicate', 'practice', 'social'] },
  // Health & Wellness
  { emoji: '💧', keywords: ['water', 'drink', 'hydrate', 'hydration', 'fluid'] },
  { emoji: '🥗', keywords: ['eat', 'healthy', 'diet', 'salad', 'food', 'nutrition', 'vegetable', 'greens'] },
  { emoji: '🍎', keywords: ['eat', 'healthy', 'diet', 'food', 'fruit', 'apple', 'nutrition'] },
  { emoji: '😴', keywords: ['sleep', 'rest', 'nap', 'bed', 'bedtime', 'night', 'recovery'] },
  { emoji: '💊', keywords: ['medicine', 'pill', 'vitamin', 'supplement', 'medication', 'health'] },
  { emoji: '🌿', keywords: ['health', 'green', 'tea', 'plant', 'herbs', 'organic', 'natural'] },
  { emoji: '🥤', keywords: ['drink', 'water', 'smoothie', 'hydrate', 'juice', 'shake'] },
  { emoji: '🍵', keywords: ['tea', 'green tea', 'drink', 'calm', 'relax', 'morning'] },
  { emoji: '☕', keywords: ['coffee', 'morning', 'drink', 'cafe', 'espresso', 'routine'] },
  { emoji: '🧴', keywords: ['skincare', 'moisturize', 'routine', 'beauty', 'clean', 'lotion'] },
  { emoji: '🛁', keywords: ['bath', 'shower', 'clean', 'hygiene', 'relax', 'routine', 'soak'] },
  { emoji: '🦷', keywords: ['teeth', 'brush', 'floss', 'dental', 'hygiene', 'clean'] },
  { emoji: '❤️', keywords: ['love', 'heart', 'self care', 'health', 'wellbeing', 'wellness'] },
  // Lifestyle & Productivity
  { emoji: '🎯', keywords: ['goal', 'focus', 'target', 'aim', 'productivity', 'achieve'] },
  { emoji: '📅', keywords: ['plan', 'schedule', 'calendar', 'organize', 'daily', 'planner'] },
  { emoji: '🙏', keywords: ['pray', 'gratitude', 'thankful', 'grateful', 'meditate', 'spiritual'] },
  { emoji: '🌅', keywords: ['morning', 'sunrise', 'wake', 'early', 'routine', 'dawn'] },
  { emoji: '🌙', keywords: ['night', 'sleep', 'evening', 'routine', 'bedtime', 'moon', 'wind down'] },
  { emoji: '🔥', keywords: ['streak', 'fire', 'motivation', 'energy', 'hustle', 'hot', 'intense'] },
  { emoji: '⭐', keywords: ['goal', 'star', 'excellence', 'achievement', 'good', 'reward'] },
  { emoji: '🧹', keywords: ['clean', 'cleaning', 'tidy', 'organize', 'chores', 'house', 'sweep'] },
  { emoji: '🏠', keywords: ['home', 'house', 'clean', 'organize', 'chores', 'domestic'] },
  { emoji: '💰', keywords: ['save', 'money', 'finance', 'budget', 'invest', 'wealth', 'saving'] },
  { emoji: '📞', keywords: ['call', 'phone', 'family', 'friends', 'social', 'connect', 'catch up'] },
  { emoji: '🌱', keywords: ['grow', 'plant', 'garden', 'nature', 'start', 'new', 'habit', 'seed'] },
  { emoji: '🤝', keywords: ['social', 'connect', 'network', 'meet', 'friends', 'people'] },
  { emoji: '✈️', keywords: ['travel', 'explore', 'adventure', 'trip', 'plan', 'journey'] },
];

type Props = {
  selected: string;
  onSelect: (emoji: string) => void;
};

export default function EmojiPicker({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? EMOJIS.filter(
        ({ emoji, keywords }) =>
          emoji === query ||
          keywords.some((k) => k.includes(query.toLowerCase())),
      )
    : EMOJIS;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search…"
        placeholderTextColor="#AAAAAA"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="done"
        clearButtonMode="while-editing"
      />
      <View style={styles.grid}>
        {filtered.map(({ emoji }) => (
          <TouchableOpacity
            key={emoji}
            style={[styles.cell, selected === emoji && styles.cellSelected]}
            onPress={() => onSelect(emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.empty}>No results for "{query}"</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  search: {
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  empty: {
    fontSize: 13,
    color: '#AAAAAA',
    paddingVertical: 8,
  },
});
