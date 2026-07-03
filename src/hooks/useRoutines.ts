/**
 * useRoutines — wraps RoutineRepository with React state for screen consumption.
 *
 * Loads all routines on mount. Exposes mutating helpers (saveRoutine,
 * deleteRoutine) that update AsyncStorage and re-sync local state so the
 * UI reflects the latest data without a full re-load.
 */

import { useState, useEffect, useCallback } from 'react';
import * as RoutineRepository from '../storage/routineRepository';
import type { Routine } from '../types';

export interface RoutinesController {
  routines: Routine[];
  loading: boolean;
  loadRoutines(): Promise<void>;
  saveRoutine(routine: Routine): Promise<void>;
  deleteRoutine(id: string): Promise<void>;
}

export function useRoutines(): RoutinesController {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRoutines = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const all = await RoutineRepository.getAll();
      setRoutines(all);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadRoutines().catch(() => {});
  }, [loadRoutines]);

  const saveRoutine = useCallback(
    async (routine: Routine): Promise<void> => {
      await RoutineRepository.save(routine);
      // Optimistically update local state without a full reload
      setRoutines((prev) => {
        const index = prev.findIndex((r) => r.id === routine.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = routine;
          return updated;
        }
        return [...prev, routine];
      });
    },
    [],
  );

  const deleteRoutine = useCallback(
    async (id: string): Promise<void> => {
      await RoutineRepository.remove(id);
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    },
    [],
  );

  return { routines, loading, loadRoutines, saveRoutine, deleteRoutine };
}
