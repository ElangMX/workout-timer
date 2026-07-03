import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import type { TimerStatus } from '../types';

interface TimerControlsProps {
  status: TimerStatus;
  onPlayPause(): void;
  onStop(): void;
}

export function TimerControls({ status, onPlayPause, onStop }: TimerControlsProps) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  const playPauseLabel = isRunning ? '⏸' : '▶';
  const playPauseA11y = isRunning ? 'Pause' : isPaused ? 'Resume' : 'Start';

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={onStop}
        accessibilityRole="button"
        accessibilityLabel="Stop"
      >
        <Text style={styles.stopIcon}>⏹</Text>
        <Text style={styles.stopLabel}>Stop</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.playPauseButton}
        onPress={onPlayPause}
        accessibilityRole="button"
        accessibilityLabel={playPauseA11y}
      >
        <Text style={styles.playPauseIcon}>{playPauseLabel}</Text>
        <Text style={styles.playPauseLabel}>{playPauseA11y}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseIcon: {
    fontSize: 28,
  },
  playPauseLabel: {
    fontSize: 10,
    color: COLORS.background,
    fontWeight: '600',
    marginTop: 2,
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.buttonNeutral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    fontSize: 22,
  },
  stopLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
});
