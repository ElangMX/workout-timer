/**
 * notificationScheduler — schedules and cancels local notifications for
 * background audio alerts.
 *
 * Background path: when the JS thread is throttled (screen locked, app in bg)
 * the setInterval inside useTimer fires unreliably. These scheduled local
 * notifications fire via the OS regardless of JS state.
 *
 * Two notifications per phase:
 *   - Warning: fires (remainingSeconds - WARNING_AT_SECONDS) from now
 *   - End:     fires remainingSeconds from now
 *
 * If the phase is <= WARNING_AT_SECONDS the warning is skipped (spec Req 6).
 *
 * All active notification IDs are tracked in a module-level array so
 * cancelAll() can purge them without needing IDs to be passed back.
 */

import * as Notifications from 'expo-notifications';
import { WARNING_AT_SECONDS } from '../constants';

// Identifiers returned by scheduleNotificationAsync — tracked for cancellation
let activeIds: string[] = [];

/**
 * Schedule a warning notification and a phase-end notification for the
 * current phase.
 *
 * @param remainingSeconds Seconds left in the current phase.
 */
export async function schedulePhase(remainingSeconds: number): Promise<void> {
  // Cancel any previously scheduled notifications before re-scheduling
  await cancelAll();

  const newIds: string[] = [];

  try {
    // Warning notification — skip if phase too short to warrant it
    if (remainingSeconds > WARNING_AT_SECONDS) {
      const warningId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Workout Timer',
          body: `${WARNING_AT_SECONDS} seconds remaining!`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: remainingSeconds - WARNING_AT_SECONDS,
        },
      });
      newIds.push(warningId);
    }

    // Phase-end notification
    const endId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Workout Timer',
        body: 'Phase complete!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: remainingSeconds,
      },
    });
    newIds.push(endId);
  } catch {
    // Permissions denied or scheduling failed — degrade gracefully.
    // Foreground audio and UI still work.
  }

  activeIds = newIds;
}

/**
 * Cancel all notifications that were scheduled by this module.
 */
export async function cancelAll(): Promise<void> {
  const toCancel = activeIds.slice();
  activeIds = [];

  await Promise.all(
    toCancel.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
}

/**
 * Request notification permissions. Safe to call multiple times; the OS
 * only prompts once. Returns whether permissions were granted.
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    const { granted } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    return granted;
  } catch {
    return false;
  }
}
