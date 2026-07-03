import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants';
import type { Exercise } from '../types';

interface ExerciseFormProps {
  exercise: Exercise;
  index: number;
  onChange(updated: Exercise): void;
  onRemove(): void;
}

export function ExerciseForm({ exercise, index, onChange, onRemove }: ExerciseFormProps) {
  function handleName(value: string) {
    onChange({ ...exercise, name: value });
  }

  function handleDuration(value: string) {
    const n = parseInt(value, 10);
    onChange({ ...exercise, durationSeconds: isNaN(n) ? 0 : Math.max(0, n) });
  }

  function handleRest(value: string) {
    const n = parseInt(value, 10);
    onChange({ ...exercise, restSeconds: isNaN(n) ? 0 : Math.max(0, n) });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.indexLabel}>Exercise {index + 1}</Text>
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          accessibilityRole="button"
          accessibilityLabel={`Remove exercise ${index + 1}`}
        >
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.nameInput}
        value={exercise.name}
        onChangeText={handleName}
        placeholder="Exercise name"
        placeholderTextColor={COLORS.textDisabled}
      />

      <View style={styles.row}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Duration (s)</Text>
          <TextInput
            style={styles.numberInput}
            value={exercise.durationSeconds > 0 ? String(exercise.durationSeconds) : ''}
            onChangeText={handleDuration}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={COLORS.textDisabled}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Rest (s)</Text>
          <TextInput
            style={styles.numberInput}
            value={exercise.restSeconds > 0 ? String(exercise.restSeconds) : ''}
            onChangeText={handleRest}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={COLORS.textDisabled}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  indexLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.buttonDanger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldGroup: {
    flex: 1,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  numberInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});
