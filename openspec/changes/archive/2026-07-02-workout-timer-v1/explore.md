# Exploration: workout-timer-v1

**Date**: 2026-07-02  
**Project**: workout-timer  
**Platform**: Expo SDK 57 · React Native 0.86 · TypeScript 6 (strict)

---

## Current State

The project is a **blank Expo scaffold** — only `App.tsx` with a default "Hello" view, no routing,
no dependencies beyond the base Expo set (`expo`, `expo-status-bar`, `react`, `react-native`).

This is greenfield: every architectural decision is still open.

---

## Affected Areas

| Path | Role |
|---|---|
| `App.tsx` | Entry component — will become the navigation root |
| `app.json` | Expo config — needs `expo-audio` plugin entry for background playback |
| `package.json` | Will gain `expo-audio`, `expo-router` (or custom nav), state lib |
| `assets/` | Will hold alert sound files (`.mp3` or `.wav`) |
| `index.ts` | Already wired as entry — no changes needed |
| `openspec/specs/` | Currently empty — delta specs will land here |

---

## Domain Model

```
Routine
├── id: string
├── name: string
├── sets: number                // total rounds
└── exercises: Exercise[]

Exercise
├── id: string
├── name: string
├── durationSeconds: number     // work period
└── restSeconds: number         // rest period after this exercise

TimerSession  (runtime, not persisted)
├── routine: Routine
├── currentSetIndex: number     // 0-based
├── currentExerciseIndex: number
├── phase: 'exercise' | 'rest' | 'idle' | 'done'
├── remainingSeconds: number
└── status: 'running' | 'paused' | 'stopped'
```

**Key design decision**: a `Routine` owns `Exercise[]`; a `Set` is a full pass through all
exercises — it's an implicit concept (repeated N times), not its own entity. This keeps the model
flat and avoids over-engineering for v1.

---

## Approaches

### 1. Timer Architecture

#### Option A — `setInterval` + `AppState` timestamp correction ✅ (recommended)
- 1-second `setInterval` decrements a counter in `useReducer`.
- On `AppState` change to `background`, record `Date.now()` in a `ref`.
- On return to `foreground`, compute elapsed wall-clock time and correct the state.
- **Pros**: pure JS, no native module, works with Expo managed workflow, straightforward to test.
- **Cons**: timer pauses while backgrounded (JS thread throttled); correction on resume leaves a
  gap — acceptable for a workout timer where precision to ±1s is fine.
- **Effort**: Low

#### Option B — Scheduled local notifications as the ground truth
- Use `expo-notifications` to schedule notifications at each phase transition moment.
- JS timer is only for display; the notification fires the real alert even when backgrounded.
- **Pros**: works perfectly when app is backgrounded or screen is locked.
- **Cons**: requires notification permissions, more complex cancellation logic, notification
  sound != in-app sound, harder to style alerts.
- **Effort**: Medium

#### Option C — Native background timer (e.g. `react-native-nitro-bg-timer`)
- Drop-in replacement for `setInterval` that runs in a native thread.
- **Pros**: accurate even when backgrounded.
- **Cons**: requires ejecting from Expo managed workflow OR using a dev client build, adds a native
  dependency, overkill for a workout timer.
- **Effort**: High

**Recommendation for v1**: Option A as primary, Option B as an optional enhancement for
"background-proof" sound alerts. The two are complementary, not mutually exclusive.

---

### 2. Sound / Audio

#### expo-audio (recommended)
- `expo-av` is **deprecated** as of Expo SDK 53/54; the replacement split is `expo-audio`
  (audio) + `expo-video` (video).
- `expo-audio` ships with `useAudioPlayer` hook, works on iOS, Android, and Web.
- Supports `setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true })` for
  background audio.
- Requires the `expo-audio` config plugin in `app.json` with `enableBackgroundPlayback: true` to
  auto-configure Android foreground service + iOS `UIBackgroundModes: audio`.

**Sound strategy**:
- Two audio assets: `alert-warning.mp3` (played when ~3s remain) and `alert-end.mp3` (played on
  phase transition).
- Two `useAudioPlayer` instances, preloaded at session start, replayed on demand.
- Do NOT use background audio mode unless background timer (Option B or C) is also in use —
  enabling background audio without a running foreground task drains battery.

---

### 3. State Management

#### Option A — `useReducer` + React Context (recommended for v1)
- Timer state is a finite state machine: `idle → running → paused → running → done`.
- `useReducer` is the idiomatic React tool for FSM-like state transitions.
- Expose via a `TimerContext` so any screen can read state and dispatch actions.
- **Pros**: zero dependencies, fits perfectly with FSM semantics, easy to reason about.
- **Cons**: no devtools, harder to persist across app kills (but workout timers don't need that).
- **Effort**: Low

#### Option B — Zustand
- Lightweight global store, good devtools support via `zustand/middleware`.
- Better if state grows (e.g. routine history, user settings).
- **Effort**: Low (but adds a dependency)

**Recommendation**: `useReducer` + Context for timer state. Zustand if routine configuration
storage grows beyond trivial (can be introduced in v2).

---

### 4. UX Flow (Screen Architecture)

```
HomeScreen
├── [No routines] → RoutineSetupScreen (create first routine)
└── [Has routines] → list of routines → tap to start

RoutineSetupScreen
├── Routine name
├── Number of sets
└── Exercise list (add/remove/reorder)
    └── ExerciseForm (name, work duration, rest duration)

ActiveTimerScreen (full-screen, always-on)
├── Phase label (EXERCISE / REST)
├── Exercise name
├── Large countdown display
├── Set progress (e.g. "Set 2 / 4")
├── Exercise progress (e.g. "Exercise 1 / 3")
├── Pause / Resume button
└── Stop (return to home) button

CompletionScreen
└── Routine done summary → back to Home
```

Navigation: **React Navigation v7** (stack) is the standard for Expo projects without file-based
routing. Expo Router (file-based) is an option but adds complexity for a focused utility app.

---

### 5. Edge Cases

| Scenario | Risk | Mitigation |
|---|---|---|
| App backgrounded during timer | JS `setInterval` pauses → timer falls behind | AppState listener + timestamp correction on resume |
| Screen locked (iOS) | Same as background | Same mitigation; audio continues if `playsInSilentMode: true` |
| Physical silent switch (iOS) | `playsInSilentMode: false` by default → no sound | Must set `playsInSilentMode: true` in `setAudioModeAsync` |
| Audio interrupted by phone call | OS pauses audio session | Subscribe to `AudioPlayer` status events; show "paused" state |
| Routine with 0 rest time | Immediate phase transition | Guard: rest = 0 skips rest phase entirely |
| User pauses mid-exercise, locks screen | Timer correctly paused | No correction needed; paused timer stores absolute remaining time |
| Web platform | `shouldPlayInBackground` not supported | Graceful degradation: no background audio on web |

---

## Recommendation

**Recommended stack for v1:**

| Concern | Choice | Rationale |
|---|---|---|
| Audio | `expo-audio` | `expo-av` deprecated; `expo-audio` is the current API |
| Timer | `setInterval` + AppState correction | Managed workflow, no native deps, ±1s accuracy acceptable |
| State | `useReducer` + Context | Idiomatic React FSM, zero deps |
| Navigation | React Navigation v7 (stack) | Mature, well-documented, Expo-compatible |
| Routine storage | `AsyncStorage` (via `@react-native-async-storage/async-storage`) | Simple JSON persistence for routines |
| Sound alerts | Two preloaded `AudioPlayer` instances | Low latency, simple lifecycle |

**What NOT to do in v1:**
- Do not add Zustand yet (overkill for this scope).
- Do not use `expo-av` (deprecated).
- Do not attempt true background timers (Nitro modules require ejecting).
- Do not use Expo Router (file-based routing adds complexity not needed here).

---

## Risks

1. **Background timer accuracy**: `setInterval` pauses when app is backgrounded. The timestamp
   correction on resume covers ≥1s gaps cleanly, but if the OS kills the JS thread entirely
   (rare on foreground apps), the timer is lost. Acceptable for v1.

2. **iOS silent mode**: workouts are often done with the phone on a surface; iOS physical silent
   switch will mute audio unless `playsInSilentMode: true` is set. This is a config line but
   MUST be tested on a real device — simulators don't simulate the silent switch.

3. **expo-audio maturity**: `expo-audio` is newer than `expo-av`; some APIs (preloading,
   simultaneous players) are less documented. Two `useAudioPlayer` instances for warning + end
   sounds is confirmed to work but needs device testing.

4. **Expo SDK 57 compatibility**: The project uses SDK 57 (current). `expo-audio` is compatible
   from SDK 50+. No risk here, but all new packages must be installed via `npx expo install`
   (not `npm install`) to get the SDK-compatible version.

5. **No test runner configured**: `openspec/config.yaml` confirms `strict_tdd: false`. All
   verification is done via `tsc --noEmit`. Manual device testing is the only safety net.

---

## Ready for Proposal

**Yes.** The domain is well-understood, the tech choices are clear and low-risk, and the scope is
bounded. The proposal should cover the full v1 feature set:
1. Routine configuration (create, edit, delete)
2. Active timer with phase transitions and audio alerts
3. AsyncStorage persistence of routines
4. AppState-based timer correction for backgrounding

The proposal should explicitly call out the audio configuration requirements for iOS (silent mode)
and the `app.json` plugin changes needed before any native features can be tested.
