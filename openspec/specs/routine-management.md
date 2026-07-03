# Routine Management Specification

## Purpose

Defines the creation, editing, deletion, and persistence of custom workout routines with arbitrary exercises.

## Requirements

### Requirement 1: Routine Creation
The system MUST allow users to create a new routine by specifying a name and adding multiple exercises.

#### Scenario: Create routine with exercises
- GIVEN the user is on the routine creation screen
- WHEN the user inputs a name, adds exercises with hold and rest times, and saves
- THEN the system MUST save the routine and display it in the routine list

### Requirement 2: Routine Editing
The system MUST allow users to modify an existing routine's name and its list of exercises.

#### Scenario: Edit routine
- GIVEN the user has an existing routine
- WHEN the user adds new exercises, removes existing ones, or changes times, and saves
- THEN the system MUST update the saved routine with the new details

### Requirement 3: Routine Deletion
The system MUST allow users to delete a saved routine.

#### Scenario: Delete routine
- GIVEN the user has saved routines
- WHEN the user selects a routine and confirms deletion
- THEN the system MUST permanently remove the routine from storage

### Requirement 4: Routine Persistence
The system MUST persist all routines across app restarts.

#### Scenario: Persist and reload across app restarts
- GIVEN the user has saved a routine
- WHEN the app is closed and reopened
- THEN the saved routine MUST be available and load successfully from AsyncStorage

### Requirement 5: Empty Routine Validation
The system MUST NOT allow a routine without exercises to be started in the timer.

#### Scenario: Empty routine validation
- GIVEN a routine has 0 exercises
- WHEN the user attempts to start the timer for this routine
- THEN the system MUST prevent the timer from starting and display an error or warning

## Acceptance Criteria
- User can successfully perform CRUD operations on routines.
- Routines are reliably saved and loaded using AsyncStorage.
- Empty routines cannot trigger the timer engine.

## Edge Cases
- Trying to save a routine with no name (should enforce default or prompt).
- Trying to start a routine that has 0 exercises.
- Storage quota exceeded (AsyncStorage error handling).
