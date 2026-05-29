import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DayCell from '@/components/DayCell';

describe('DayCell', () => {
  it('renders without any mark when status is null', () => {
    render(<DayCell status={null} />);
    expect(screen.queryByText('×')).toBeNull();
  });

  it('renders without a × mark when status is completed', () => {
    render(<DayCell status="completed" />);
    expect(screen.queryByText('×')).toBeNull();
  });

  it('renders a × mark when status is skipped', () => {
    render(<DayCell status="skipped" />);
    expect(screen.getByText('×')).toBeTruthy();
  });

  it('calls onPress when tapped and not disabled', () => {
    const onPress = jest.fn();
    render(<DayCell status={null} onPress={onPress} />);
    fireEvent.press(screen.UNSAFE_getByType(require('react-native').TouchableOpacity));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('passes disabled prop to the touchable when disabled', () => {
    render(<DayCell status={null} onPress={jest.fn()} disabled />);
    const touchable = screen.UNSAFE_getByType(require('react-native').TouchableOpacity);
    expect(touchable.props.disabled).toBe(true);
  });
});
