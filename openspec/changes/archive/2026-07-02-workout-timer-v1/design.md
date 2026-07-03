# Design: workout-timer-v1

## Technical Approach

Layered Expo (managed) app. Domain types are pure and framework-free; a
`useReducer`-driven FSM (`timer-engine`) lives inside `TimerContext`; routines
persist through a thin `AsyncStorage` repository (`routine-management`); audio
runs on a dual path — `expo-audio` in foreground, `expo-notifications` scheduled
alerts as the background-proof fallback (`audio-alerts`). Navigation is a React
Navigation v7 stack. Maps directly to the proposal's Approach and the
exploration's recommended stack (Options A for timer/state).

## Architecture Decisions

| Concern | Choice | Rejected | Rationale |
|---|---|---|---|
| Timer | `setInterval` + AppState timestamp correction | native bg timer (eject), notifications-as-truth | Managed workflow, no native deps, ±1s ok |
| State | `useReducer` + `TimerContext` | Zustand | FSM is idiomatic reducer; zero deps for v1 |
| Bg alerts | `expo-notifications` scheduled on phase start | rely only on JS timer | JS thread throttles when locked; scheduled local notif fires reliably |
| Fg audio | two preloaded `expo-audio` players | `expo-av` | `expo-av` deprecated SDK 53+; preload = low latency |
| Storage | AsyncStorage JSON repo | SQLite/files | Trivial data volume; simplest durable option |
| Nav | React Navigation v7 stack | Expo Router | File routing adds complexity for a utility app |

## Data Flow

    UI (screens) ──dispatch──▶ timerReducer ──state──▶ TimerContext ──▶ screens
         │                          │
         │                     TICK (1s setInterval)
         │                          │
    AppState listener ──resume──▶ CORRECT (wall-clock delta via ref)
         │
    phase start ──▶ AudioController: play() + notifications.schedule(warn@-5s, end@0s)
    pause/stop  ──▶ notifications.cancelAll()   (reschedule on resume)

    RoutineRepository ◀──load/save JSON──▶ AsyncStorage   (Home/Setup screens)

## Timer FSM

State shape (mirrors `TimerSession`):

```ts
type TimerState = {
  routine: Routine | null;
  currentSetIndex: number;
  currentExerciseIndex: number;
  phase: 'idle' | 'countdown' | 'exercise' | 'rest' | 'done';
  remainingSeconds: number;
  status: 'running' | 'paused' | 'stopped';
};
type TimerAction =
  | { type: 'START'; routine: Routine }
  | { type: 'TICK' }
  | { type: 'CORRECT'; elapsedSeconds: number }  // AppState resume
  | { type: 'PAUSE' } | { type: 'RESUME' } | { type: 'STOP' }
  | { type: 'ADVANCE' };                          // remaining hit 0
```

Transitions: `idle→(START)→countdown(3s)→exercise`. On `remaining===0` reducer
emits the next phase: `exercise→rest` (skip if `restSeconds===0`), `rest→exercise`
(next exercise), last-exercise `rest→exercise@nextSet`, last-set `→done`. `PAUSE`
freezes `remainingSeconds`; `STOP→stopped` (screen exits). `CORRECT` subtracts
`elapsedSeconds`, looping `ADVANCE` if it crosses phase boundaries so state is
accurate after backgrounding. Reducer is pure; the interval and notification
side-effects live in `useTimer`.

## File Changes

| File | Action | Description |
|---|---|---|
| `App.tsx` | Modify | NavigationContainer + stack + `TimerProvider` |
| `app.json` | Modify | Add `expo-audio` (enableBackgroundPlayback) + `expo-notifications` plugins |
| `package.json` | Modify | New deps via `npx expo install` |
| `src/types/index.ts` | Create | `Routine`, `Exercise`, `TimerState`, `TimerAction` |
| `src/constants/index.ts` | Create | colors, `COUNTDOWN_SECONDS`, `WARNING_AT_SECONDS=5` |
| `src/storage/routineRepository.ts` | Create | AsyncStorage CRUD |
| `src/context/TimerContext.tsx` | Create | reducer + provider + hook |
| `src/hooks/useTimer.ts` | Create | interval, AppState correction, effects |
| `src/hooks/useAudio.ts` | Create | preload players, `playWarning`/`playEnd` |
| `src/hooks/useRoutines.ts` | Create | repository + list state |
| `src/audio/notificationScheduler.ts` | Create | schedule/cancel phase notifications |
| `src/screens/HomeScreen.tsx` | Create | routine list / empty state |
| `src/screens/RoutineSetupScreen.tsx` | Create | create/edit routine |
| `src/screens/ActiveTimerScreen.tsx` | Create | countdown UI + controls |
| `src/screens/CompletionScreen.tsx` | Create | done summary |
| `src/components/{ExerciseForm,RoutineListItem,CountdownDisplay,PhaseLabel,TimerControls}.tsx` | Create | shared UI |
| `assets/sounds/{alert-warning,alert-end}.mp3` | Create | audio assets |

## Interfaces / Contracts

```ts
// storage
interface RoutineRepository {
  getAll(): Promise<Routine[]>;
  save(r: Routine): Promise<void>;     // upsert by id
  remove(id: string): Promise<void>;
}
// AsyncStorage key schema
const ROUTINES_KEY = '@workout-timer/routines';   // JSON Routine[] under one key
// navigation
type RootStackParamList = {
  Home: undefined;
  RoutineSetup: { routineId?: string };   // undefined = create
  ActiveTimer: { routineId: string };
  Completion: { routineName: string };
};
// audio
interface AudioController { playWarning(): void; playEnd(): void; }
interface NotificationScheduler {
  schedulePhase(remainingSeconds: number): Promise<void>; // warn@-5s + end@0s
  cancelAll(): Promise<void>;
}
```

## Component Hierarchy

    App (NavigationContainer + TimerProvider)
    └─ Stack
       ├─ HomeScreen ─ RoutineListItem*
       ├─ RoutineSetupScreen ─ ExerciseForm*
       ├─ ActiveTimerScreen ─ PhaseLabel · CountdownDisplay · TimerControls
       └─ CompletionScreen

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Type | Whole codebase | `tsc --noEmit` (only configured gate) |
| Unit | timerReducer transitions, CORRECT crossing phases, rest=0 skip | Pure fn — testable if runner added later |
| Manual (device) | iOS silent switch, lock-screen audio, notif permissions, call interruption | Real device — simulators don't emulate silent switch |

No test runner installed (`strict_tdd: false`); reducer kept pure so tests drop
in later without refactor.

## Migration / Rollout

No data migration (greenfield). Rollout: install deps with `npx expo install`,
add config plugins, build a dev client (notifications/background audio need it —
not Expo Go). Rollback via git reset + revert `app.json`.

## Open Questions

- [ ] Notification denied fallback: UI-only alerts confirmed acceptable for v1?
- [ ] Provide seeded default routines, or start with empty state only?
