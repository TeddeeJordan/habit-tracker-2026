import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StatsRow from '@/components/StatsRow';

describe('StatsRow', () => {
  it('renders the active habit count', () => {
    render(<StatsRow habitCount={3} weeklyCompletionPct={0} bestStreak={0} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders the completion percentage with a % sign', () => {
    render(<StatsRow habitCount={0} weeklyCompletionPct={72} bestStreak={0} />);
    expect(screen.getByText('72%')).toBeTruthy();
  });

  it('renders the streak in days with a d suffix', () => {
    render(<StatsRow habitCount={0} weeklyCompletionPct={0} bestStreak={5} />);
    expect(screen.getByText('5d')).toBeTruthy();
  });

  it('renders an em-dash when best streak is 0', () => {
    render(<StatsRow habitCount={0} weeklyCompletionPct={0} bestStreak={0} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('shows "this week" subtitle for completion', () => {
    render(<StatsRow habitCount={0} weeklyCompletionPct={50} bestStreak={0} />);
    expect(screen.getByText('this week')).toBeTruthy();
  });

  it('shows "all time" subtitle for streak', () => {
    render(<StatsRow habitCount={1} weeklyCompletionPct={0} bestStreak={1} />);
    expect(screen.getByText('all time')).toBeTruthy();
  });
});
