import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { initDb } from '@/db/database';
import { HabitsProvider } from '@/context/HabitsContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    text: '#000000',
    card: '#FFFFFF',
    border: '#E5E5E5',
  },
};

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDb().then(() => setDbReady(true));
  }, []);

  if (!dbReady) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

  return (
    <ThemeProvider value={LightTheme}>
      <HabitsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-habit"
            options={{ presentation: 'modal', title: 'New Habit', headerBackTitle: 'Cancel' }}
          />
        </Stack>
        <StatusBar style="dark" />
      </HabitsProvider>
    </ThemeProvider>
  );
}
