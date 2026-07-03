# Proposal: workout-timer-v1

## Intent

Create a focused workout timer for calisthenics that supports free exercise management and reliably plays audio alerts for exercise transitions, even when the screen is locked or the app is backgrounded.

## Scope

### In Scope
- Create, edit, save (AsyncStorage), and delete multiple custom routines.
- Free addition and removal of exercises per routine.
- Active timer with FSM (`useReducer` + Context) displaying countdown and progress.
- 5-second warning sound and phase-end sound.
- Background execution using `expo-notifications` for scheduled sound alerts when the app is in the background or locked.

### Out of Scope
- True native background timer threads (using `react-native-nitro-bg-timer`).
- Cloud sync or user authentication.
- Detailed workout history or analytics.

## Capabilities

> This section is the CONTRACT between proposal and specs phases.
> The sdd-spec agent reads this to know exactly which spec files to create or update.
> Research `openspec/specs/` before filling this in.

### New Capabilities
- `routine-management`: Creating, editing, storing (via AsyncStorage), and deleting workout routines with arbitrary exercises.
- `timer-engine`: Timer session FSM tracking sets, exercise phases, and countdowns, with AppState correction for UI updates after backgrounding.
- `audio-alerts`: Foreground (`expo-audio`) and background (`expo-notifications`) scheduled audio alerts for 5s warnings and phase ends.

### Modified Capabilities
None

## Approach

- **State & Storage:** `useReducer` and React Context for the Timer FSM. `@react-native-async-storage/async-storage` for persisting routines.
- **Background Support:** Use `setInterval` with AppState timestamp correction for the foreground/UI timer. Use `expo-notifications` to schedule local notifications (which play sounds) for phase transitions so that audio triggers reliably even when the device is locked.
- **Audio:** `expo-audio` for foreground sounds. Must configure `playsInSilentMode: true` for iOS.
- **Navigation:** React Navigation v7 (stack navigator) for clean UX flow (Home → Setup, Home → Active Timer → Completion).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `App.tsx` | Modified | Root component, navigation provider, and context setup |
| `app.json` | Modified | Add `expo-audio` and `expo-notifications` plugin configs |
| `src/` | New | All new screens, domain models, and hooks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| iOS silent switch blocking sound | High | Set `playsInSilentMode: true` in `expo-audio` |
| Notifications delayed in background | Medium | Schedule them precisely on phase start and cancel/reschedule aggressively on pause/resume |
| Notification permissions denied | Low | Prompt clearly on first timer start; fallback to UI-only alerts if denied |

## Rollback Plan

Revert to the original blank Expo scaffold via git reset. Revert `app.json` to its base state and uninstall added dependencies (`expo-audio`, `expo-notifications`, `@react-native-async-storage/async-storage`, `@react-navigation/native`).

## Dependencies

- `@react-navigation/native` and stack navigator packages
- `@react-native-async-storage/async-storage`
- `expo-audio`
- `expo-notifications`

## Success Criteria

- [ ] Users can create and save a routine with varying hold and rest times.
- [ ] The active timer progresses through exercises and sets correctly.
- [ ] A warning sound plays exactly 5 seconds before a phase ends.
- [ ] Both warning and phase-end sounds play correctly when the screen is locked.
