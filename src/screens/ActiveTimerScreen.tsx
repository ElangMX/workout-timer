import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTimerContext } from '../context/TimerContext';
import { useTimer } from '../hooks/useTimer';
import { useRoutines } from '../hooks/useRoutines';
import { CountdownDisplay } from '../components/CountdownDisplay';
import { PhaseLabel } from '../components/PhaseLabel';
import { TimerControls } from '../components/TimerControls';
import { COLORS, WARNING_AT_SECONDS } from '../constants';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveTimer'>;

/** Returns the phase accent color for the active timer background tint */
function phaseColor(phase: string): string {
  switch (phase) {
    case 'exercise': return COLORS.exercise;
    case 'rest': return COLORS.rest;
    case 'countdown': return COLORS.countdown;
    case 'done': return COLORS.done;
    default: return COLORS.accent;
  }
}

export function ActiveTimerScreen({ route, navigation }: Props) {
  const { routineId } = route.params;
  const { routines } = useRoutines();
  const { state } = useTimerContext();
  const timer = useTimer();

  const routine = routines.find((r) => r.id === routineId) ?? state.routine;

  // Start the timer when we arrive on the screen (if not already running)
  useEffect(() => {
    if (routine && timer.phase === 'idle') {
      timer.start(routine);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine]);

  // Navigate to completion when done
  useEffect(() => {
    if (timer.phase === 'done' && routine) {
      navigation.replace('Completion', { routineName: routine.name });
    }
  }, [timer.phase, routine, navigation]);

  // Navigate to completion if routine is in done state from a previous session
  useEffect(() => {
    if (state.phase === 'done' && state.routine) {
      navigation.replace('Completion', { routineName: state.routine.name });
    }
  }, [state.phase, state.routine, navigation]);

  if (!routine) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Routine not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { phase, status, remainingSeconds, currentSetIndex, currentExerciseIndex } = timer;
  const currentExercise = routine.exercises[currentExerciseIndex];
  const isWarning = remainingSeconds <= WARNING_AT_SECONDS && remainingSeconds > 0
    && (phase === 'exercise' || phase === 'rest');
  const accent = isWarning ? COLORS.warning : phaseColor(phase);

  function handlePlayPause() {
    if (status === 'running') {
      timer.pause();
    } else {
      timer.resume();
    }
  }

  function handleStop() {
    timer.stop();
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Subtle tinted background overlay for phase feedback */}
      <View style={[styles.backgroundTint, { backgroundColor: accent + '10' }]} />

      <View style={styles.container}>
        {/* Phase and Set Info */}
        <View style={styles.topSection}>
          <PhaseLabel phase={phase} />
          {phase !== 'idle' && phase !== 'countdown' && (
            <Text style={styles.setProgress}>
              Set {currentSetIndex + 1} / {routine.sets}
            </Text>
          )}
        </View>

        {/* Exercise Name */}
        {currentExercise && (phase === 'exercise' || phase === 'countdown') && (
          <Text style={styles.exerciseName} numberOfLines={2}>
            {currentExercise.name}
          </Text>
        )}
        {phase === 'rest' && (
          <Text style={styles.exerciseName}>Rest</Text>
        )}
        {phase === 'countdown' && (
          <Text style={styles.upNextLabel}>
            Up next: {currentExercise?.name ?? ''}
          </Text>
        )}

        {/* Countdown */}
        <View style={styles.countdownContainer}>
          <CountdownDisplay
            seconds={remainingSeconds}
            color={accent}
            warning={isWarning}
          />
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TimerControls
            status={status}
            onPlayPause={handlePlayPause}
            onStop={handleStop}
          />
        </View>

        {/* Exercise mini-progress */}
        {routine.exercises.length > 1 && (
          <View style={styles.exerciseProgress}>
            {routine.exercises.map((ex, i) => (
              <View
                key={ex.id}
                style={[
                  styles.progressDot,
                  i === currentExerciseIndex && { backgroundColor: accent },
                  i < currentExerciseIndex && { backgroundColor: COLORS.textSecondary },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundTint: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  topSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  setProgress: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 300,
  },
  upNextLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  countdownContainer: {
    marginVertical: 32,
  },
  controlsContainer: {
    marginTop: 8,
  },
  exerciseProgress: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textDisabled,
  },
});
