# Tasks: workout-timer-v1

## Review Workload Forecast

| Metric | Value |
|---|---|
| Total estimated changed lines | ~960 |
| Review budget | 400 |
| **Decision needed before apply** | **No** |
| **Chained PRs recommended** | **Yes** |
| **Chain strategy** | **stacked-to-main** |
| **400-line budget risk** | **High** |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested PR Boundaries

| PR | Tasks | Description | Est. lines |
|---|---|---|---|
| PR-1 | T1–T3 | Foundation + storage + timer FSM | ~310 |
| PR-2 | T4–T5 | Audio/notifications + hooks wiring | ~230 |
| PR-3 | T6–T7 | UI screens/components + app integration | ~420 |

> PR-3 slightly exceeds budget. If needed, split T6 (screens) from T7 (App wiring + config) into PR-3a/PR-3b.

---

## Tasks

### T1 — Foundation: types and constants ✅

**Description:** Create domain types (`Routine`, `Exercise`, `TimerState`, `TimerAction`, `RootStackParamList`) and app constants (colors, `COUNTDOWN_SECONDS`, `WARNING_AT_SECONDS`).

- **Files:** `src/types/index.ts` (create), `src/constants/index.ts` (create)
- **Dependencies:** none
- **Est. lines:** ~70
- **Verify:** `tsc --noEmit`
- **Status:** [x] Complete — commit `b57a534`

### T2 — Storage: routine repository ✅

**Description:** Implement `RoutineRepository` — AsyncStorage CRUD under `@workout-timer/routines` key. `getAll`, `save` (upsert by id), `remove`.

- **Files:** `src/storage/routineRepository.ts` (create)
- **Dependencies:** T1
- **Est. lines:** ~50
- **Verify:** `tsc --noEmit`
- **Status:** [x] Complete — commit `a8b24b3`

### T3 — Business logic: timer reducer and context ✅

**Description:** Pure `timerReducer` implementing the FSM (idle → countdown → exercise ⇄ rest → done, pause/resume, CORRECT for background delta with phase-boundary crossing, rest=0 skip). `TimerContext` provider and `useTimerContext` hook.

- **Files:** `src/context/TimerContext.tsx` (create)
- **Dependencies:** T1
- **Est. lines:** ~130
- **Verify:** `tsc --noEmit`
- **Status:** [x] Complete — commit `09d5f7a`

### T4 — Audio: foreground players and notification scheduler ✅

**Description:** `useAudio` — preload two `expo-audio` players (`alert-warning.mp3`, `alert-end.mp3`), expose `playWarning()`/`playEnd()`, set `playsInSilentMode: true`. `notificationScheduler` — `schedulePhase(remainingSeconds)` (warn at −5s, end at 0), `cancelAll()`, permission request helper.

- **Files:** `src/hooks/useAudio.ts` (create), `src/audio/notificationScheduler.ts` (create), `assets/sounds/alert-warning.mp3` (create), `assets/sounds/alert-end.mp3` (create)
- **Dependencies:** T1
- **Est. lines:** ~110 (code; audio assets not counted)
- **Verify:** `tsc --noEmit` · requires device for audio playback
- **Status:** [x] Complete — commit `3d8abd7`

### T5 — Hooks: useTimer and useRoutines ✅

**Description:** `useTimer` — owns `setInterval`, AppState listener for background correction via wall-clock ref, dispatches TICK/CORRECT/ADVANCE, calls audio controller and notification scheduler on phase changes, cancels notifications on pause/stop, reschedules on resume. `useRoutines` — wraps `RoutineRepository` with loading state for screen consumption.

- **Files:** `src/hooks/useTimer.ts` (create), `src/hooks/useRoutines.ts` (create)
- **Dependencies:** T2, T3, T4
- **Est. lines:** ~140
- **Verify:** `tsc --noEmit`
- **Status:** [x] Complete — commit `6414a99`

### T6 — UI: screens and components ✅

**Description:** Four screens (`HomeScreen`, `RoutineSetupScreen`, `ActiveTimerScreen`, `CompletionScreen`) and five shared components (`ExerciseForm`, `RoutineListItem`, `CountdownDisplay`, `PhaseLabel`, `TimerControls`). Empty-routine validation prevents starting timer. Deletion with confirmation.

- **Files:** `src/screens/HomeScreen.tsx` (create), `src/screens/RoutineSetupScreen.tsx` (create), `src/screens/ActiveTimerScreen.tsx` (create), `src/screens/CompletionScreen.tsx` (create), `src/components/ExerciseForm.tsx` (create), `src/components/RoutineListItem.tsx` (create), `src/components/CountdownDisplay.tsx` (create), `src/components/PhaseLabel.tsx` (create), `src/components/TimerControls.tsx` (create)
- **Dependencies:** T1, T3, T5
- **Est. lines:** ~380
- **Verify:** `tsc --noEmit` · requires device for visual check
- **Status:** [x] Complete — commit `26dc09e`

### T7 — Integration: App wiring and config ✅

**Description:** Rewrite `App.tsx` with `NavigationContainer`, stack navigator, `TimerProvider` wrapping. Update `app.json` with `expo-audio` and `expo-notifications` plugin configs. Install deps (`@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, `@react-native-async-storage/async-storage`, `expo-audio`, `expo-notifications`).

- **Files:** `App.tsx` (modify), `app.json` (modify), `package.json` (modify via `npx expo install`)
- **Dependencies:** T6
- **Est. lines:** ~80
- **Verify:** `tsc --noEmit` · `npx expo export` (build gate)
- **Status:** [x] Complete — commit `cc44018`
