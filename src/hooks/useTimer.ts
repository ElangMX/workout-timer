/**
 * useTimer — owns the interval, AppState listener, and all audio/notification
 * side-effects for the timer FSM.
 *
 * Responsibilities:
 *  - Drive TICK every second while status is 'running'
 *  - Detect phase changes and fire foreground audio (warning at 5s, end at 0)
 *  - Schedule / cancel background notifications on start, pause, resume, stop
 *  - Correct the timer on foreground resume using a wall-clock timestamp ref
 *    (AppState 'active' → dispatch CORRECT with elapsed seconds)
 *
 * The pure FSM lives in TimerContext (timerReducer). This hook is the
 * impure side-effect shell around it.
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useTimerContext } from '../context/TimerContext';
import { useAudio } from './useAudio';
import * as notificationScheduler from '../audio/notificationScheduler';
import type { Routine, TimerPhase, TimerStatus } from '../types';
import { WARNING_AT_SECONDS } from '../constants';

export interface TimerController {
  start(routine: Routine): void;
  pause(): void;
  resume(): void;
  stop(): void;
  phase: TimerPhase;
  status: TimerStatus;
  remainingSeconds: number;
  currentSetIndex: number;
  currentExerciseIndex: number;
  routine: Routine | null;
}

export function useTimer(): TimerController {
  const { state, dispatch } = useTimerContext();
  const audio = useAudio();

  // Wall-clock ref: set when app backgrounds, used to compute elapsed on resume
  const backgroundedAtRef = useRef<number | null>(null);

  // Track previous remainingSeconds and phase to detect audio trigger moments
  const prevRemainingRef = useRef<number>(state.remainingSeconds);
  const prevPhaseRef = useRef<TimerPhase>(state.phase);

  // -------------------------------------------------------------------------
  // Side-effect: interval
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (state.status !== 'running') return;

    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(id);
  }, [state.status, dispatch]);

  // -------------------------------------------------------------------------
  // Side-effect: audio triggers on state changes
  // -------------------------------------------------------------------------

  useEffect(() => {
    const prevRemaining = prevRemainingRef.current;
    const prevPhase = prevPhaseRef.current;
    const { remainingSeconds, phase, status } = state;

    if (status === 'running') {
      // Warning beep: hit exactly WARNING_AT_SECONDS during a timed phase
      const inTimedPhase = phase === 'exercise' || phase === 'rest';
      if (
        inTimedPhase &&
        prevRemaining > WARNING_AT_SECONDS &&
        remainingSeconds === WARNING_AT_SECONDS
      ) {
        audio.playWarning();
      }

      // Phase-end tone: remaining hits 0 (phase transition moment)
      // The reducer advances phase immediately, so detect by phase change
      if (
        prevPhase !== 'idle' &&
        prevPhase !== 'done' &&
        prevPhase !== phase &&
        (phase === 'exercise' || phase === 'rest' || phase === 'done')
      ) {
        audio.playEnd();
      }
    }

    prevRemainingRef.current = remainingSeconds;
    prevPhaseRef.current = phase;
  }, [state, audio]);

  // -------------------------------------------------------------------------
  // Side-effect: notification scheduling
  // -------------------------------------------------------------------------

  // Schedule notifications when the timer starts or resumes
  useEffect(() => {
    const { status, phase, remainingSeconds } = state;
    const inTimedPhase =
      phase === 'exercise' || phase === 'rest' || phase === 'countdown';

    if (status === 'running' && inTimedPhase && remainingSeconds > 0) {
      notificationScheduler.schedulePhase(remainingSeconds).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]); // re-run only when status changes (start/resume)

  // Cancel notifications when paused or stopped
  useEffect(() => {
    if (state.status === 'paused' || state.status === 'stopped') {
      notificationScheduler.cancelAll().catch(() => {});
    }
  }, [state.status]);

  // Reschedule when a new phase begins (remainingSeconds resets)
  const prevPhaseForNotifRef = useRef<TimerPhase>(state.phase);
  useEffect(() => {
    const { status, phase, remainingSeconds } = state;
    const inTimedPhase =
      phase === 'exercise' || phase === 'rest';

    if (
      status === 'running' &&
      inTimedPhase &&
      phase !== prevPhaseForNotifRef.current &&
      remainingSeconds > 0
    ) {
      notificationScheduler.schedulePhase(remainingSeconds).catch(() => {});
    }
    prevPhaseForNotifRef.current = phase;
  }, [state]);

  // -------------------------------------------------------------------------
  // Side-effect: AppState background correction
  // -------------------------------------------------------------------------

  useEffect(() => {
    function handleAppStateChange(nextState: AppStateStatus): void {
      if (nextState === 'background' || nextState === 'inactive') {
        // Record when we left foreground
        if (state.status === 'running') {
          backgroundedAtRef.current = Date.now();
        }
      } else if (nextState === 'active') {
        // Returned to foreground
        if (state.status === 'running' && backgroundedAtRef.current !== null) {
          const elapsedMs = Date.now() - backgroundedAtRef.current;
          const elapsedSeconds = Math.floor(elapsedMs / 1000);
          backgroundedAtRef.current = null;

          if (elapsedSeconds > 0) {
            dispatch({ type: 'CORRECT', elapsedSeconds });
          }
        } else {
          backgroundedAtRef.current = null;
        }
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [state.status, dispatch]);

  // -------------------------------------------------------------------------
  // Public controls
  // -------------------------------------------------------------------------

  const start = useCallback(
    (routine: Routine): void => {
      // Request notification permissions on first start (non-blocking)
      notificationScheduler.requestPermissions().catch(() => {});
      dispatch({ type: 'START', routine });
    },
    [dispatch],
  );

  const pause = useCallback((): void => {
    dispatch({ type: 'PAUSE' });
    // cancelAll is handled by the status effect above
  }, [dispatch]);

  const resume = useCallback((): void => {
    dispatch({ type: 'RESUME' });
    // schedulePhase is handled by the status effect above
  }, [dispatch]);

  const stop = useCallback((): void => {
    dispatch({ type: 'STOP' });
    // cancelAll is handled by the status effect above
  }, [dispatch]);

  return {
    start,
    pause,
    resume,
    stop,
    phase: state.phase,
    status: state.status,
    remainingSeconds: state.remainingSeconds,
    currentSetIndex: state.currentSetIndex,
    currentExerciseIndex: state.currentExerciseIndex,
    routine: state.routine,
  };
}
