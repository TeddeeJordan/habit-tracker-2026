# Habit Tracker

A minimal habit tracking app built with Expo and React Native. Track daily habits, log your mood, and review progress over time — with push notifications and an Android home screen widget.

## Features

- **Today view** — check off habits with a progress bar showing daily completion
- **Dashboard** — weekly grid view, best streak, weekly completion %, and mood chart
- **Mood logging** — rate your mood after completing each habit (1–5 scale)
- **Push notifications** — daily reminders at 12:00 PM, automatically cancelled once a habit is completed or its weekly goal is met
- **Android widget** — "Today's Habits" home screen widget to check off habits without opening the app
- **Profile** — name, bio, and avatar with photo picker

## Tech stack

- [Expo](https://expo.dev) SDK 54 with the New Architecture enabled
- [Expo Router](https://docs.expo.dev/router/introduction/) v6 for file-based navigation
- [expo-sqlite](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/) for local persistence
- [expo-notifications](https://docs.expo.dev/versions/v54.0.0/sdk/notifications/) for daily habit reminders
- [react-native-android-widget](https://github.com/sAleksovski/react-native-android-widget) for the Android home screen widget
- React 19 + TypeScript

## Project structure

```
app/
  (tabs)/
    index.tsx       # Today screen
    dashboard.tsx   # Weekly stats + mood chart
    profile.tsx     # User profile
  add-habit.tsx     # Add habit modal
components/         # Shared UI components
context/            # HabitsContext (global state + reducer)
db/                 # SQLite schema, queries
utils/              # Habit utilities, notification service
widgets/            # Android widget components + task handler
__tests__/          # Jest unit tests
```

## Getting started

```bash
npm install
npx expo start
```

Open in an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/), or [Expo Go](https://expo.dev/go).

Push notifications and the Android widget require a [development build](https://docs.expo.dev/develop/development-builds/introduction/) — they are not supported in Expo Go.

## Running tests

```bash
npm test
```
