import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

import { initDb } from '@/db/database';
import { HabitsProvider, useHabits } from '@/context/HabitsContext';

// Show notifications as banners even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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

// Listens for notification action button responses and routes them to context.
// Must be rendered inside HabitsProvider to access useHabits().
function NotificationHandler() {
  const { completeHabitFromNotification } = useHabits();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

      const data = response.notification.request.content.data as {
        habitId: number;
        habitName: string;
        habitEmoji: string;
      };

      completeHabitFromNotification(data.habitId, {
        id: data.habitId,
        name: data.habitName,
        emoji: data.habitEmoji,
      });
    });

    return () => subscription.remove();
  }, [completeHabitFromNotification]);

  return null;
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDb().then(() => setDbReady(true));
  }, []);

  if (!dbReady) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

  return (
    <ThemeProvider value={LightTheme}>
      <HabitsProvider>
        <NotificationHandler />
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
