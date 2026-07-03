import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoutines } from '../hooks/useRoutines';
import { RoutineListItem } from '../components/RoutineListItem';
import { COLORS } from '../constants';
import type { RootStackParamList, Routine } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { routines, loading, loadRoutines, deleteRoutine } = useRoutines();

  // Reload routines from AsyncStorage every time this screen comes into focus.
  // This guarantees the list is fresh after returning from RoutineSetupScreen.
  useFocusEffect(
    useCallback(() => {
      loadRoutines().catch(() => {});
    }, [loadRoutines]),
  );

  const handleStartRoutine = useCallback(
    (routine: Routine) => {
      if (routine.exercises.length === 0) {
        Alert.alert(
          'Empty Routine',
          'This routine has no exercises. Add at least one exercise before starting.',
          [{ text: 'OK' }],
        );
        return;
      }
      navigation.navigate('ActiveTimer', { routineId: routine.id });
    },
    [navigation],
  );

  const handleEditRoutine = useCallback(
    (routine: Routine) => {
      navigation.navigate('RoutineSetup', { routineId: routine.id });
    },
    [navigation],
  );

  const handleDeleteRoutine = useCallback(
    (routine: Routine) => {
      Alert.alert(
        'Delete Routine',
        `Delete "${routine.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => { deleteRoutine(routine.id).catch(() => {}); },
          },
        ],
      );
    },
    [deleteRoutine],
  );

  const handleCreateRoutine = useCallback(() => {
    navigation.navigate('RoutineSetup', {});
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={routines.length === 0 ? styles.emptyContent : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No routines yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first calisthenics routine to get started.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RoutineListItem
            routine={item}
            onPress={() => handleStartRoutine(item)}
            onEdit={() => handleEditRoutine(item)}
            onDelete={() => handleDeleteRoutine(item)}
          />
        )}
      />
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateRoutine}
          accessibilityRole="button"
          accessibilityLabel="Create Routine"
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContent: {
    flex: 1,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 30,
    color: COLORS.background,
    fontWeight: '300',
    lineHeight: 34,
  },
});
