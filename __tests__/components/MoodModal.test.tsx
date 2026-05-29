import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import MoodModal from '@/components/MoodModal';

describe('MoodModal', () => {
  it('does not render content when visible is false', () => {
    render(
      <MoodModal visible={false} habitName="Run" onSelect={jest.fn()} onSkip={jest.fn()} />,
    );
    expect(screen.queryByText('How are you feeling?')).toBeNull();
  });

  it('renders the title when visible', () => {
    render(
      <MoodModal visible habitName="Run" onSelect={jest.fn()} onSkip={jest.fn()} />,
    );
    expect(screen.getByText('How are you feeling?')).toBeTruthy();
  });

  it('renders the habit name in the subtitle', () => {
    render(
      <MoodModal visible habitName="🏃 Run" onSelect={jest.fn()} onSkip={jest.fn()} />,
    );
    expect(screen.getByText('After completing 🏃 Run')).toBeTruthy();
  });

  it('renders all 5 mood faces', () => {
    render(
      <MoodModal visible habitName="Run" onSelect={jest.fn()} onSkip={jest.fn()} />,
    );
    expect(screen.getByText('😢')).toBeTruthy();
    expect(screen.getByText('😞')).toBeTruthy();
    expect(screen.getByText('😐')).toBeTruthy();
    expect(screen.getByText('🙂')).toBeTruthy();
    expect(screen.getByText('😄')).toBeTruthy();
  });

  it('calls onSelect with score 1 when the crying face is tapped', () => {
    const onSelect = jest.fn();
    render(<MoodModal visible habitName="Run" onSelect={onSelect} onSkip={jest.fn()} />);
    fireEvent.press(screen.getByText('😢'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('calls onSelect with score 5 when the happy face is tapped', () => {
    const onSelect = jest.fn();
    render(<MoodModal visible habitName="Run" onSelect={onSelect} onSkip={jest.fn()} />);
    fireEvent.press(screen.getByText('😄'));
    expect(onSelect).toHaveBeenCalledWith(5);
  });

  it('calls onSkip when the Skip button is pressed', () => {
    const onSkip = jest.fn();
    render(<MoodModal visible habitName="Run" onSelect={jest.fn()} onSkip={onSkip} />);
    fireEvent.press(screen.getByText('Skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
