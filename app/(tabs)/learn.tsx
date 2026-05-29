import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LearnScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.hint}>Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 20, justifyContent: 'flex-start' },
  title: { fontSize: 28, fontWeight: '700', color: '#000000', letterSpacing: -0.5, marginBottom: 8 },
  hint: { fontSize: 14, color: '#AAAAAA' },
});
