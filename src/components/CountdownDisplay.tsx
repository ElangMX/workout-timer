import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface CountdownDisplayProps {
  seconds: number;
  /** Accent ring color — pass the phase color so the ring reflects state */
  color?: string;
  warning?: boolean;
}

function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  return String(seconds);
}

export function CountdownDisplay({ seconds, color, warning = false }: CountdownDisplayProps) {
  const ringColor = warning ? COLORS.warning : (color ?? COLORS.accent);

  return (
    <View style={[styles.circle, { borderColor: ringColor }]}>
      <Text style={[styles.time, { color: ringColor }]}>{formatTime(seconds)}</Text>
      {seconds >= 60 && <Text style={styles.unit}>min</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  time: {
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -2,
  },
  unit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: -4,
  },
});
