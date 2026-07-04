# Workout Timer

A calisthenics workout timer built with Expo (React Native). Create custom routines, configure exercise and rest times, and get audio + haptic alerts even with the screen locked.

## Features

- **Custom routines** — create, edit, save, and delete multiple routines with any number of exercises.
- **Configurable times** — set duration and rest period per exercise, plus number of sets per routine.
- **Audio alerts** — warning beep 5 seconds before a phase ends, distinct tone on phase transition.
- **Background support** — scheduled notifications keep alerts working with the screen locked.
- **Haptic fallback** — vibration feedback when sound files are not yet added.
- **Dark theme** — clean, focused interface designed for gym use.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on a specific platform
npm run android
npm run ios
npm run web
```

> **Note:** `expo-notifications` and `expo-audio` require a [development build](https://docs.expo.dev/develop/development-builds/introduction/). They do not work in Expo Go.

## Adding Sound Files

The app needs two audio files to play alerts. Without them, it falls back to haptic vibration.

1. Download two short MP3 files (see sources below).
2. Save them as:
   - `assets/sounds/alert_warning.mp3` — short beep (~0.5s)
   - `assets/sounds/alert_end.mp3` — distinct tone (~1–2s)
3. Restart the dev server and test on a real device.

Free sound sources (CC0 / royalty-free):

| Source | Link |
|--------|------|
| Freesound | [freesound.org](https://freesound.org/search/?q=short+beep&f=license%3A%22Creative+Commons+0%22) |
| Pixabay | [pixabay.com/sound-effects](https://pixabay.com/sound-effects/search/beep/) |
| Mixkit | [mixkit.co/free-sound-effects](https://mixkit.co/free-sound-effects/beep/) |

See [`assets/sounds/README.md`](assets/sounds/README.md) for full details on format, silent-mode testing, and background notification sounds.

## Project Structure

```
src/
  types/          # Domain types (Routine, Exercise, TimerState)
  constants/      # Colors, timing constants
  storage/        # AsyncStorage routine repository
  context/        # Timer FSM reducer and React Context
  hooks/          # useTimer, useAudio, useRoutines
  audio/          # Notification scheduler for background alerts
  screens/        # Home, RoutineSetup, ActiveTimer, Completion
  components/     # CountdownDisplay, TimerControls, ExerciseForm, etc.
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 57 |
| Runtime | React Native 0.86, React 19 |
| Language | TypeScript 6 |
| Navigation | React Navigation 7 (native stack) |
| Storage | AsyncStorage |
| Audio | expo-audio (foreground), expo-notifications (background) |
| Haptics | expo-haptics (fallback) |

## How the Timer Works

The timer is a finite state machine driven by `useReducer`:

```
idle → countdown (3s) → exercise → rest → next exercise → ... → done
```

- **Background correction**: when the app returns from background, the elapsed wall-clock time is applied across phase boundaries so the timer stays accurate.
- **rest = 0**: if an exercise has zero rest, the rest phase is skipped automatically.
- **Pause/Resume**: pausing cancels scheduled notifications; resuming reschedules them.

## Building for Device

```bash
# Create a development build
npx expo run:android
npx expo run:ios
```

## License

MIT
