import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import type { TimerPhase } from '../types';

interface PhaseLabelProps {
  phase: TimerPhase;
}

const PHASE_CONFIG: Record<TimerPhase, { label: string; color: string }> = {
  idle: { label: 'Ready', color: COLORS.textSecondary },
  countdown: { label: 'Get Ready', color: COLORS.countdown },
  exercise: { label: 'Exercise', color: COLORS.exercise },
  rest: { label: 'Rest', color: COLORS.rest },
  done: { label: 'Done!', color: COLORS.done },
};

export function PhaseLabel({ phase }: PhaseLabelProps) {
  const config = PHASE_CONFIG[phase];

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '26' }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
