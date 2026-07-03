import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Completion'>;

export function CompletionScreen({ route, navigation }: Props) {
  const { routineName } = route.params;

  function handleDone() {
    navigation.navigate('Home');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.trophy}>🏆</Text>

        <Text style={styles.title}>Workout Complete!</Text>

        <Text style={styles.routineName}>{routineName}</Text>

        <Text style={styles.message}>
          Outstanding work. Every rep counts — you just proved it.
        </Text>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.doneButtonText}>Done</Text>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  trophy: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    color: COLORS.done,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  routineName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  doneButton: {
    backgroundColor: COLORS.done,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 64,
  },
  doneButtonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});
