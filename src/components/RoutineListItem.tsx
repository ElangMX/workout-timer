import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import type { Routine } from '../types';

interface RoutineListItemProps {
  routine: Routine;
  onPress(): void;
  onEdit(): void;
  onDelete(): void;
}

/** Returns estimated total workout duration in seconds */
function calcTotalSeconds(routine: Routine): number {
  const perSet = routine.exercises.reduce(
    (acc, ex) => acc + ex.durationSeconds + ex.restSeconds,
    0,
  );
  return perSet * routine.sets;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export function RoutineListItem({ routine, onPress, onEdit, onDelete }: RoutineListItemProps) {
  const totalSeconds = calcTotalSeconds(routine);
  const exerciseCount = routine.exercises.length;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Start ${routine.name}`}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{routine.name}</Text>
        <Text style={styles.meta}>
          {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} · {routine.sets} set{routine.sets !== 1 ? 's' : ''} · {formatDuration(totalSeconds)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onEdit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${routine.name}`}
        >
          <Text style={styles.iconText}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${routine.name}`}
        >
          <Text style={styles.iconText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    fontSize: 18,
  },
});
