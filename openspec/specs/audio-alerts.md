# Audio Alerts Specification

## Purpose

Defines audio alerts for phase transitions and countdown warnings, including reliable playback in background and silent modes.

## Requirements

### Requirement 1: Warning Beep
The system MUST play a warning sound exactly 5 seconds before any phase (exercise or rest) ends.

#### Scenario: Warning beep at exactly 5 seconds remaining
- GIVEN a running timer phase with more than 5 seconds duration
- WHEN the remaining time hits exactly 5 seconds
- THEN the system plays a warning beep

### Requirement 2: Phase-End Tone
The system MUST play a distinct tone when a phase reaches 0.

#### Scenario: Phase-end tone when timer hits 0
- GIVEN a running timer phase
- WHEN the remaining time reaches 0
- THEN the system plays a phase-end tone

### Requirement 3: Background Audio Delivery
The system MUST deliver audio alerts even if the app is backgrounded or the screen is locked, using scheduled local notifications.

#### Scenario: Sounds play with screen locked
- GIVEN the timer is running and the device screen is locked
- WHEN a 5s warning or phase transition occurs
- THEN the user hears the correct sound via a scheduled `expo-notifications` alert

### Requirement 4: iOS Silent Mode Playback
The system MUST play foreground audio even if the iOS physical silent switch is engaged.

#### Scenario: Sounds play with iOS silent switch OFF
- GIVEN the iOS device is set to silent mode
- WHEN the timer is in the foreground and triggers a sound
- THEN the sound plays successfully (requires `playsInSilentMode: true`)

### Requirement 5: Permission Handling
The system MUST handle missing notification permissions gracefully.

#### Scenario: Handle notification permission denied gracefully
- GIVEN the user denied notification permissions
- WHEN the timer starts
- THEN the system falls back to foreground-only UI updates and foreground audio, without crashing

### Requirement 6: Short Phase Handling
The system MUST NOT attempt to play the 5s warning if the total phase duration is too short to warrant it.

#### Scenario: No sound for exercises shorter than 5s
- GIVEN a phase is configured for less than 5 seconds
- WHEN the phase starts
- THEN the system skips the 5-second warning and only plays the phase-end tone when it reaches 0

## Acceptance Criteria
- Warning and phase-end sounds play reliably in the foreground.
- Background sounds play reliably via scheduled notifications.
- iOS silent mode does not mute foreground sounds.
- Phases under 5 seconds don't trigger broken or overlapping warnings.

## Edge Cases
- User pauses the timer (scheduled background notifications MUST be cancelled to prevent false alerts).
- User resumes the timer (scheduled notifications MUST be recalculated and re-scheduled).
- Notification permissions are requested but user ignores the prompt.
