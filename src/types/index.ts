// Domain types for workout-timer-v1

export interface Exercise {
  id: string;
  name: string;
  durationSeconds: number;
  restSeconds: number;
}

export interface Routine {
  id: string;
  name: string;
  sets: number;
  exercises: Exercise[];
}

export type TimerPhase = 'idle' | 'countdown' | 'exercise' | 'rest' | 'done';

export type TimerStatus = 'running' | 'paused' | 'stopped';

export interface TimerState {
  routine: Routine | null;
  currentSetIndex: number;
  currentExerciseIndex: number;
  phase: TimerPhase;
  remainingSeconds: number;
  status: TimerStatus;
}

export type TimerAction =
  | { type: 'START'; routine: Routine }
  | { type: 'TICK' }
  | { type: 'CORRECT'; elapsedSeconds: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'ADVANCE' };

export type RootStackParamList = {
  Home: undefined;
  RoutineSetup: { routineId?: string };
  ActiveTimer: { routineId: string };
  Completion: { routineName: string };
};
