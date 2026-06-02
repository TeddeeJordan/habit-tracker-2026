'use no memo';

import React from 'react';
import { FlexWidget, ListWidget, TextWidget } from 'react-native-android-widget';

import type { WidgetHabit } from './widgetUtils';

function HabitRow({ habit }: { habit: WidgetHabit }) {
  return (
    <FlexWidget
      clickAction="TOGGLE_HABIT"
      clickActionData={{ habitId: habit.id }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: 'match_parent',
        height: 72,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
      }}
    >
      {/* Checkbox */}
      <FlexWidget
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: habit.completedToday ? '#000000' : 'rgba(0, 0, 0, 0)',
          borderWidth: habit.completedToday ? 0 : 2,
          borderColor: '#CCCCCC',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 14,
        }}
      >
        {habit.completedToday ? (
          <TextWidget
            text="✓"
            style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}
          />
        ) : null}
      </FlexWidget>

      {/* Emoji */}
      <TextWidget
        text={habit.emoji}
        style={{ fontSize: 26, marginRight: 10 }}
      />

      {/* Name + weekly subtitle */}
      <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        <TextWidget
          text={habit.name}
          style={{
            fontSize: 16,
            color: habit.completedToday ? '#AAAAAA' : '#000000',
          }}
        />
        {habit.timesPerWeek < 7 ? (
          <TextWidget
            text={`${habit.weeklyCount}/${habit.timesPerWeek} this week`}
            style={{ fontSize: 12, color: '#AAAAAA', marginTop: 2 }}
          />
        ) : null}
      </FlexWidget>

      {/* Weekly count badge for non-daily habits */}
      {habit.timesPerWeek < 7 ? (
        <FlexWidget
          style={{
            backgroundColor: '#F2F2F2',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginLeft: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text={`${habit.weeklyCount}/${habit.timesPerWeek}`}
            style={{ fontSize: 13, color: '#555555' }}
          />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}

export interface HabitWidgetProps {
  habits: WidgetHabit[];
}

export function HabitWidget({ habits }: HabitWidgetProps) {
  const completedCount = habits.filter((h) => h.completedToday).length;

  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: '#E5E5E5',
        }}
      >
        <TextWidget
          text="Today's Habits"
          style={{ fontSize: 15, fontWeight: 'bold', color: '#000000' }}
        />
        <TextWidget
          text={`${completedCount}/${habits.length}`}
          style={{ fontSize: 14, color: '#888888' }}
        />
      </FlexWidget>

      {/* Scrollable habits list */}
      <ListWidget style={{ height: 'match_parent', width: 'match_parent' }}>
        {habits.map((habit) => (
          <HabitRow key={habit.id} habit={habit} />
        ))}
      </ListWidget>
    </FlexWidget>
  );
}
