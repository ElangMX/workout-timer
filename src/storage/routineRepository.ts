import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Routine } from '../types';

const ROUTINES_KEY = '@workout-timer/routines';

/**
 * Load all persisted routines. Returns an empty array if none are saved
 * or if storage is empty/corrupted.
 */
export async function getAll(): Promise<Routine[]> {
  try {
    const json = await AsyncStorage.getItem(ROUTINES_KEY);
    if (json === null) return [];
    return JSON.parse(json) as Routine[];
  } catch {
    return [];
  }
}

/**
 * Upsert a routine by id. If a routine with the same id exists it is
 * replaced; otherwise the routine is appended.
 */
export async function save(routine: Routine): Promise<void> {
  const routines = await getAll();
  const index = routines.findIndex((r) => r.id === routine.id);
  if (index >= 0) {
    routines[index] = routine;
  } else {
    routines.push(routine);
  }
  await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
}

/**
 * Remove a routine by id. No-op if the id does not exist.
 */
export async function remove(id: string): Promise<void> {
  const routines = await getAll();
  const filtered = routines.filter((r) => r.id !== id);
  await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(filtered));
}
