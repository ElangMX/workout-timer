# Timer Engine Specification

## Purpose

Defines the timer state machine (FSM), tracking sets, exercise phases, countdowns, and AppState background correction.

## Requirements

### Requirement 1: Timer Initialization and Start
The system MUST initialize the timer with the selected routine and begin counting down the first exercise phase when started.

#### Scenario: Start timer
- GIVEN the timer is loaded with a valid routine and is in the 'idle' state
- WHEN the user presses start
- THEN the timer transitions to the 'running' state and starts counting down the first exercise

### Requirement 2: Phase Transitions
The system MUST automatically transition between exercise and rest phases.

#### Scenario: Exercise ends
- GIVEN the timer is counting down an exercise
- WHEN the countdown reaches 0
- THEN the system transitions to the 'rest' phase and begins the rest countdown

#### Scenario: Rest ends
- GIVEN the timer is counting down a rest phase
- WHEN the countdown reaches 0
- THEN the system transitions to the next exercise phase

### Requirement 3: Set and Completion Transitions
The system MUST track sets and transition to completion when all sets are finished.

#### Scenario: Last exercise of set
- GIVEN the timer finishes the rest phase of the last exercise in a set
- WHEN there are remaining sets
- THEN the system transitions to the first exercise of the next set

#### Scenario: Last exercise of last set
- GIVEN the timer finishes the final phase of the last exercise in the final set
- WHEN the countdown reaches 0
- THEN the system transitions to the 'done' state and stops the timer

### Requirement 4: Pause and Resume
The system MUST allow the active timer to be paused and resumed.

#### Scenario: Pause/Resume timer
- GIVEN the timer is 'running'
- WHEN the user presses pause
- THEN the timer transitions to 'paused' and stops counting
- AND WHEN the user presses resume
- THEN the timer transitions back to 'running' and continues from the exact remaining time

### Requirement 5: Background AppState Correction
The system MUST correct the timer countdown based on elapsed time when returning from the background.

#### Scenario: Timer accuracy after app backgrounds and returns to foreground
- GIVEN the timer is 'running'
- WHEN the app goes to the background for N seconds and then returns to the foreground
- THEN the system MUST subtract N seconds from the remaining time and update the UI accordingly

## Acceptance Criteria
- Timer accurately follows the FSM: idle -> running <-> paused -> done.
- Transitions between exercises, rests, and sets are fully automatic.
- Time remaining is accurate upon returning from background.

## Edge Cases
- App goes to background and the timer phase finishes while in background (must advance to the correct next phase or 'done' state upon foregrounding based on total elapsed time).
- Pausing exactly as a phase transition occurs.
