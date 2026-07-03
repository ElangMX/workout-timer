# Apply Progress: workout-timer-v1

## PR Scope: PR-1 (T1–T3) + PR-2 (T4–T5) + PR-3 (T6–T7) + PR-4 (critical fixes)

**Status**: ALL TASKS COMPLETE + 3 CRITICAL FIXES APPLIED — ready for sdd-verify  
**Mode**: Standard (Strict TDD not active)  
**Chain strategy**: stacked-to-main  
**Workload**: PR-1 ~310 lines · PR-2 ~250 lines · PR-3 ~420 lines (slight exception accepted) · PR-4 ~80 lines (fix commit)

---

## Completed Tasks

- [x] T1 — Foundation: types and constants
- [x] T2 — Storage: routine repository
- [x] T3 — Business logic: timer reducer and context
- [x] T4 — Audio: foreground players and notification scheduler
- [x] T5 — Hooks: useTimer and useRoutines
- [x] T6 — UI: screens and components
- [x] T7 — Integration: App wiring and config
- [x] FIX-1 — Audio: graceful missing-asset handling + haptics fallback
- [x] FIX-2 — Notifications: distinct custom sounds + descriptive content
- [x] FIX-3 — HomeScreen: reload routines on focus via useFocusEffect
- [x] FIX-WARN — Timer reducer: empty-routine guard in START action

## Remaining Tasks

None — all tasks and critical fixes complete.

---

## Files Created / Modified

| File | Action | Notes |
|---|---|---|
| `src/types/index.ts` | Created | `Routine`, `Exercise`, `TimerState`, `TimerAction`, `TimerPhase`, `TimerStatus`, `RootStackParamList` |
| `src/constants/index.ts` | Created | `COLORS` palette, `WARNING_AT_SECONDS = 5`, `COUNTDOWN_SECONDS = 3` |
| `src/storage/routineRepository.ts` | Created | `getAll`, `save` (upsert by id), `remove` — AsyncStorage under `@workout-timer/routines` |
| `src/context/TimerContext.tsx` | Created + Modified | `timerReducer`, `TimerProvider`, `useTimerContext` hook; FIX: empty-routine guard in `START` |
| `src/hooks/useAudio.ts` | Created + Modified | FIX: `require()` calls moved inside functions to prevent Metro bundle failure on missing assets; haptics fallback via `expo-haptics`; `warningAvailableRef` / `endAvailableRef` track player readiness |
| `src/audio/notificationScheduler.ts` | Created + Modified | FIX: `sound: 'alert-warning.mp3'` / `sound: 'alert-end.mp3'`; FIX: descriptive notification titles and bodies |
| `src/hooks/useTimer.ts` | Created | `setInterval` driver, `AppState` wall-clock correction, audio trigger detection, notification schedule/cancel on phase/status changes |
| `src/hooks/useRoutines.ts` | Created | `RoutineRepository` wrapper with `routines`, `loading`, `loadRoutines`, `saveRoutine`, `deleteRoutine` |
| `assets/sounds/README.md` | Created + Modified | FIX: detailed manual instructions — exact filenames, format, size, download sources, how to verify |
| `src/screens/HomeScreen.tsx` | Created + Modified | FIX: `useFocusEffect` + `loadRoutines()` on focus — guarantees fresh list after RoutineSetupScreen returns |
| `src/components/CountdownDisplay.tsx` | Created | Large circular timer display (mm:ss or s), phase-color ring, warning state |
| `src/components/PhaseLabel.tsx` | Created | Phase badge (idle/countdown/exercise/rest/done) with phase-matching color |
| `src/components/TimerControls.tsx` | Created | Play/Pause (primary) + Stop (secondary) buttons |
| `src/components/ExerciseForm.tsx` | Created | Single exercise input row (name, duration, rest) with remove button |
| `src/components/RoutineListItem.tsx` | Created | Routine card (name, exercise count, total time estimate), edit/delete actions |
| `src/screens/RoutineSetupScreen.tsx` | Created | Create/edit form: name, sets, exercise list; full validation; pre-populates on edit |
| `src/screens/ActiveTimerScreen.tsx` | Created | Live timer UI — phase label, set progress, exercise name, countdown, controls, dot-progress bar |
| `src/screens/CompletionScreen.tsx` | Created | Congratulations screen, routine name, motivational message, Done→Home |
| `App.tsx` | Modified | `NavigationContainer` + `NativeStackNavigator` (4 screens) + `TimerProvider`, dark header theme |
| `app.json` | Modified | Added `expo-notifications` plugin with sound assets config |
| `package.json` / `package-lock.json` | Modified (PR-1) | Added `@react-native-async-storage/async-storage` via `npx expo install` |
| `package.json` / `package-lock.json` | Modified (PR-2) | Added `expo-audio`, `expo-notifications` via `npx expo install` |
| `package.json` / `package-lock.json` | Modified (PR-3) | Added `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context` via `npx expo install` |
| `package.json` / `package-lock.json` | Modified (PR-4) | Added `expo-haptics` via `npx expo install` |

---

## Commits (on `main`)

| SHA | Message |
|---|---|
| `b57a534` | `feat(types): add domain types and constants` |
| `a8b24b3` | `feat(storage): add routine repository` |
| `09d5f7a` | `feat(timer): add timer reducer and context` |
| `3d8abd7` | `feat(audio): add audio players and notification scheduler` |
| `6414a99` | `feat(hooks): add useTimer and useRoutines hooks` |
| `26dc09e` | `feat(ui): add screens and shared components` |
| `cc44018` | `feat(app): wire navigation, providers, and config` |
| *(pending)* | `fix: resolve 3 critical verification findings` |

---

## Verification

```
npx tsc --noEmit  →  0 errors  (ALL CLEAR — original tasks and fix commit)
```

---

## Deviations from Design

**T4 (original):**
- Audio assets (`alert-warning.mp3`, `alert-end.mp3`) cannot be created as binary files by a code agent. Created `assets/sounds/README.md` documenting requirements instead. `useAudio.ts` wraps both `createAudioPlayer` calls in try/catch so missing assets degrade gracefully (play calls become no-ops) — meets Spec Req 5 (permission/asset failures must not crash).
- Used `createAudioPlayer` (non-hook variant) inside `useEffect` for lifecycle control instead of `useAudioPlayer` hook — this gives explicit `remove()` on unmount without hook ordering constraints.

**T5:**
- `useTimer` reschedules notifications on phase change (not just on status change) to keep background alerts accurate per new `remainingSeconds` on each phase start.
- `prevRemainingRef` / `prevPhaseRef` pattern used to detect exact audio trigger moments without adding those to reducer state, keeping the reducer pure.

**T6:**
- `ActiveTimerScreen` starts the timer via `useEffect` on mount when `phase === 'idle'`. This means the routine must exist in `useRoutines()` state OR in `TimerContext.state.routine`. Both paths are handled.
- `pointerEvents` on the background tint `View` is passed as a prop (not a style property) for React Native compatibility.
- `StyleSheet.absoluteFill` used (not `absoluteFillObject` — that's not in the RN typings for this SDK version).

**T7:**
- `react-native-screens` and `react-native-safe-area-context` were resolved by `npx expo install` to SDK-57-compatible versions automatically.
- `gestureEnabled: false` and `headerBackVisible: false` set on `ActiveTimer` and `Completion` screens to prevent accidental back-navigation during an active workout.

**FIX-1 (CRITICAL 1 — missing audio assets):**
- Metro resolves `require()` statically at bundle time, so a module-level `require()` of a missing file will fail before any try/catch around the player creation can help.
- Fixed by moving both `require()` calls inside wrapper functions (`tryRequireWarning()` / `tryRequireEnd()`). Metro evaluates these lazily at runtime, making the try/catch effective.
- Added `expo-haptics` as a fallback: `playWarning()` triggers `NotificationFeedbackType.Warning` and `playEnd()` triggers `NotificationFeedbackType.Success` when audio is unavailable.

**FIX-2 (CRITICAL 2 — generic notification sounds):**
- Changed `sound: true` to `sound: 'alert-warning.mp3'` and `sound: 'alert-end.mp3'` — these reference the registered asset names from `app.json`.
- Updated titles/bodies: warning → "Get Ready!" / "5 seconds remaining"; end → "Phase Complete!" / "Transitioning to next phase".

**FIX-3 (CRITICAL 3 — stale Home list):**
- Added `useFocusEffect(useCallback(() => { loadRoutines() }, [loadRoutines]))` to `HomeScreen`.
- `useRoutines()` already exposes `loadRoutines` as a stable `useCallback` ref — no extra hook changes needed.

**FIX-WARN (WARNING — empty routine in reducer):**
- Added `if (routine.exercises.length === 0) return state;` as the first statement in the `START` case.
- The UI still guards this at `HomeScreen` level; the reducer guard is defense-in-depth for corrupted storage or alternative navigation paths.

---

## Issues Found

None — all critical findings resolved.

---

## PR Boundaries

### PR-1
- **Mode**: chained PR slice (stacked-to-main)
- **Work unit**: PR-1 — Foundation + storage + timer FSM
- **Boundary**: starts after initial commit; ends at `09d5f7a`
- **Estimated review budget**: ~310 lines (within 400-line budget)

### PR-2
- **Mode**: chained PR slice (stacked-to-main)
- **Work unit**: PR-2 — Audio/notifications + hooks wiring
- **Boundary**: starts after `09d5f7a`; ends at `6414a99`
- **Estimated review budget**: ~250 lines (within 400-line budget)

### PR-3
- **Mode**: chained PR slice (stacked-to-main) — `size:exception` accepted
- **Work unit**: PR-3 — UI screens/components + App integration
- **Boundary**: starts after `6414a99`; ends at `cc44018`
- **Estimated review budget**: ~420 lines (slight overrun — exception accepted by orchestrator)

### PR-4 (fix commit)
- **Mode**: single fix commit — `fix: resolve 3 critical verification findings`
- **Work unit**: PR-4 — Critical verification fixes
- **Boundary**: starts after `cc44018`; all 4 changes in a single atomic commit
- **Estimated review budget**: ~80 lines
