import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import EmojiPicker from '@/components/EmojiPicker';

describe('EmojiPicker', () => {
  it('renders the search input', () => {
    render(<EmojiPicker selected="" onSelect={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search…')).toBeTruthy();
  });

  it('renders emojis when no query is entered', () => {
    render(<EmojiPicker selected="" onSelect={jest.fn()} />);
    expect(screen.getByText('🏃')).toBeTruthy();
    expect(screen.getByText('📚')).toBeTruthy();
  });

  it('filters to relevant emojis when a keyword is typed', () => {
    render(<EmojiPicker selected="" onSelect={jest.fn()} />);
    fireEvent.changeText(screen.getByPlaceholderText('Search…'), 'run');
    // 🏃 has keyword "run"
    expect(screen.getByText('🏃')).toBeTruthy();
    // 📚 does not match "run"
    expect(screen.queryByText('📚')).toBeNull();
  });

  it('shows a no-results message when nothing matches', () => {
    render(<EmojiPicker selected="" onSelect={jest.fn()} />);
    fireEvent.changeText(screen.getByPlaceholderText('Search…'), 'xyzzy');
    expect(screen.getByText(/No results for/)).toBeTruthy();
  });

  it('calls onSelect with the tapped emoji', () => {
    const onSelect = jest.fn();
    render(<EmojiPicker selected="" onSelect={onSelect} />);
    fireEvent.press(screen.getByText('🏃'));
    expect(onSelect).toHaveBeenCalledWith('🏃');
  });

  it('shows all results again after the query is cleared', () => {
    render(<EmojiPicker selected="" onSelect={jest.fn()} />);
    const input = screen.getByPlaceholderText('Search…');
    fireEvent.changeText(input, 'run');
    expect(screen.queryByText('📚')).toBeNull();
    fireEvent.changeText(input, '');
    expect(screen.getByText('📚')).toBeTruthy();
  });
});
