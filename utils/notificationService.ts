import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Habit } from '@/db/queries';

const NOTIFICATION_HOUR = 20; // 8 PM

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function setupNotificationCategory(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export function habitNotificationId(habitId: number): string {
  return `habit-${habitId}`;
}

export async function scheduleHabitNotification(habit: Habit): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(habitNotificationId(habit.id)).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: habitNotificationId(habit.id),
    content: {
      title: `${habit.emoji} ${habit.name}`,
      body: 'Did you complete this habit today?',
      data: { habitId: habit.id, habitName: habit.name, habitEmoji: habit.emoji },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: NOTIFICATION_HOUR,
      minute: 0,
    },
  });
}

export async function cancelHabitNotification(habitId: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(habitNotificationId(habitId)).catch(() => {});
}

// Schedules notifications for habits that haven't met their weekly goal,
// cancels for those that have. Call on app load and when habits change.
export async function syncHabitNotifications(
  habits: Habit[],
  completionCountByHabitId: Record<number, number>,
): Promise<void> {
  for (const habit of habits) {
    const count = completionCountByHabitId[habit.id] ?? 0;
    if (count >= habit.times_per_week) {
      await cancelHabitNotification(habit.id);
    } else {
      await scheduleHabitNotification(habit);
    }
  }
}
