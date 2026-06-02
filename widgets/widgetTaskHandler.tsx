'use no memo';

import React from 'react';
import type { WidgetTaskHandler } from 'react-native-android-widget';

import { ensureDb } from '@/db/database';
import { upsertLog } from '@/db/queries';
import { formatDate } from '@/utils/habitUtils';
import { HabitWidget } from './HabitWidget';
import { getTodayHabits } from './widgetUtils';

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetAction,
  clickAction,
  clickActionData,
  renderWidget,
}) => {
  if (widgetAction === 'WIDGET_DELETED') return;

  await ensureDb();

  if (widgetAction === 'WIDGET_CLICK' && clickAction === 'TOGGLE_HABIT') {
    const { habitId } = clickActionData as { habitId: number };
    const today = formatDate(new Date());
    await upsertLog(habitId, today, 'completed');
  }

  const { habits } = await getTodayHabits();
  renderWidget(<HabitWidget habits={habits} />);
};
