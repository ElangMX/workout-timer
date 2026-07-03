import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoutines } from '../hooks/useRoutines';
import { ExerciseForm } from '../components/ExerciseForm';
import { COLORS } from '../constants';
import type { RootStackParamList, Exercise, Routine } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineSetup'>;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeBlankExercise(): Exercise {
  return { id: generateId(), name: '', durationSeconds: 30, restSeconds: 10 };
}

export function RoutineSetupScreen({ route, navigation }: Props) {
  const { routineId } = route.params ?? {};
  const { routines, saveRoutine } = useRoutines();

  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [exercises, setExercises] = useState<Exercise[]>([makeBlankExercise()]);
  const [saving, setSaving] = useState(false);

  // Pre-populate form if editing an existing routine
  useEffect(() => {
    if (routineId) {
      const existing = routines.find((r) => r.id === routineId);
      if (existing) {
        setName(existing.name);
        setSets(String(existing.sets));
        setExercises(existing.exercises.length > 0 ? existing.exercises : [makeBlankExercise()]);
      }
    }
  }, [routineId, routines]);

  const handleAddExercise = useCallback(() => {
    setExercises((prev) => [...prev, makeBlankExercise()]);
  }, []);

  const handleUpdateExercise = useCallback((index: number, updated: Exercise) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const handleRemoveExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please enter a name for the routine.');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise to your routine.');
      return;
    }

    const invalidExercise = exercises.find(
      (ex) => !ex.name.trim() || ex.durationSeconds <= 0,
    );
    if (invalidExercise) {
      Alert.alert(
        'Invalid Exercise',
        'Each exercise must have a name and a duration greater than 0.',
      );
      return;
    }

    const parsedSets = parseInt(sets, 10);
    if (isNaN(parsedSets) || parsedSets < 1) {
      Alert.alert('Invalid Sets', 'Number of sets must be at least 1.');
      return;
    }

    const routine: Routine = {
      id: routineId ?? generateId(),
      name: trimmedName,
      sets: parsedSets,
      exercises,
    };

    setSaving(true);
    try {
      await saveRoutine(routine);
      navigation.goBack();
    } catch {
      Alert.alert('Save Error', 'Could not save routine. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, sets, exercises, routineId, saveRoutine, navigation]);

  const isEditing = Boolean(routineId);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Routine Name */}
        <Text style={styles.sectionLabel}>Routine Name</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning Blast"
          placeholderTextColor={COLORS.textDisabled}
          returnKeyType="done"
        />

        {/* Sets */}
        <Text style={styles.sectionLabel}>Sets</Text>
        <TextInput
          style={styles.setsInput}
          value={sets}
          onChangeText={setSets}
          keyboardType="number-pad"
          returnKeyType="done"
        />

        {/* Exercises */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.sectionLabel}>Exercises</Text>
          <Text style={styles.exerciseCount}>
            {exercises.length} total
          </Text>
        </View>

        {exercises.map((ex, i) => (
          <ExerciseForm
            key={ex.id}
            exercise={ex}
            index={i}
            onChange={(updated) => handleUpdateExercise(i, updated)}
            onRemove={() => handleRemoveExercise(i)}
          />
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddExercise}
          accessibilityRole="button"
          accessibilityLabel="Add exercise"
        >
          <Text style={styles.addButtonText}>+ Add Exercise</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Save changes' : 'Create routine'}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Routine'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
  },
  setsInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    width: 80,
    textAlign: 'center',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 20,
    marginBottom: 12,
  },
  exerciseCount: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  addButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  addButtonText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: 17,
    fontWeight: '700',
  },
});
