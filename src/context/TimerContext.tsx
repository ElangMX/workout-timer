import React, {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
} from 'react';
import { COUNTDOWN_SECONDS } from '../constants';
import type { Routine, TimerAction, TimerState } from '../types';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: TimerState = {
  routine: null,
  currentSetIndex: 0,
  currentExerciseIndex: 0,
  phase: 'idle',
  remainingSeconds: 0,
  status: 'stopped',
};

// ---------------------------------------------------------------------------
// Helper: resolve the next state after the current phase hits 0
// ---------------------------------------------------------------------------

/**
 * Advance the FSM by one phase boundary.
 * Returns the new partial state for the phase that follows.
 * Handles rest=0 skips, set transitions, and the terminal 'done' phase.
 */
function advancePhase(state: TimerState): TimerState {
  const { routine, phase, currentSetIndex, currentExerciseIndex } = state;

  if (!routine || phase === 'idle' || phase === 'done') {
    return state;
  }

  const exercises = routine.exercises;
  const currentExercise = exercises[currentExerciseIndex];

  if (phase === 'countdown') {
    // countdown → exercise
    return {
      ...state,
      phase: 'exercise',
      remainingSeconds: currentExercise.durationSeconds,
    };
  }

  if (phase === 'exercise') {
    // exercise → rest (or skip rest if restSeconds = 0)
    if (currentExercise.restSeconds > 0) {
      return {
        ...state,
        phase: 'rest',
        remainingSeconds: currentExercise.restSeconds,
      };
    }
    // rest is 0 — fall through to rest→next logic immediately
    return advanceFromRest(state);
  }

  if (phase === 'rest') {
    return advanceFromRest(state);
  }

  return state;
}

/**
 * Handle the 'rest phase ends' transitions:
 *   - next exercise in the same set
 *   - first exercise of next set
 *   - 'done' when the last set is complete
 */
function advanceFromRest(state: TimerState): TimerState {
  const { routine, currentSetIndex, currentExerciseIndex } = state;

  if (!routine) return state;

  const exercises = routine.exercises;
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const isLastSet = currentSetIndex === routine.sets - 1;

  if (!isLastExercise) {
    // Move to next exercise in this set
    const nextIndex = currentExerciseIndex + 1;
    return {
      ...state,
      phase: 'exercise',
      currentExerciseIndex: nextIndex,
      remainingSeconds: exercises[nextIndex].durationSeconds,
    };
  }

  // Last exercise of this set
  if (!isLastSet) {
    // Move to next set, first exercise
    const nextSet = currentSetIndex + 1;
    return {
      ...state,
      phase: 'exercise',
      currentSetIndex: nextSet,
      currentExerciseIndex: 0,
      remainingSeconds: exercises[0].durationSeconds,
    };
  }

  // Last exercise of the last set — workout complete
  return {
    ...state,
    phase: 'done',
    status: 'stopped',
    remainingSeconds: 0,
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START': {
      const routine: Routine = action.routine;
      return {
        routine,
        currentSetIndex: 0,
        currentExerciseIndex: 0,
        phase: 'countdown',
        remainingSeconds: COUNTDOWN_SECONDS,
        status: 'running',
      };
    }

    case 'TICK': {
      if (state.status !== 'running') return state;
      if (state.remainingSeconds > 1) {
        return { ...state, remainingSeconds: state.remainingSeconds - 1 };
      }
      // remainingSeconds hits 0 — advance to the next phase
      return advancePhase({ ...state, remainingSeconds: 0 });
    }

    case 'ADVANCE': {
      // Explicit advance (e.g., triggered by caller after detecting 0)
      return advancePhase(state);
    }

    case 'CORRECT': {
      // Background time correction: subtract elapsed wall-clock seconds.
      // Iterates phase advances if the elapsed time crosses phase boundaries.
      if (state.status !== 'running') return state;

      let current = state;
      let remaining = action.elapsedSeconds;

      while (remaining > 0 && current.phase !== 'done' && current.phase !== 'idle') {
        if (remaining < current.remainingSeconds) {
          // Elapsed time consumed within this phase — no boundary crossing
          current = { ...current, remainingSeconds: current.remainingSeconds - remaining };
          remaining = 0;
        } else {
          // This phase is fully consumed — advance and continue
          remaining -= current.remainingSeconds;
          current = advancePhase({ ...current, remainingSeconds: 0 });
        }
      }

      return current;
    }

    case 'PAUSE': {
      if (state.status !== 'running') return state;
      return { ...state, status: 'paused' };
    }

    case 'RESUME': {
      if (state.status !== 'paused') return state;
      return { ...state, status: 'running' };
    }

    case 'STOP': {
      return {
        ...initialState,
        status: 'stopped',
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TimerContextValue {
  state: TimerState;
  dispatch: Dispatch<TimerAction>;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface TimerProviderProps {
  children: React.ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTimerContext(): TimerContextValue {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}
