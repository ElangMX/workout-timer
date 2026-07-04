/**
 * useAudio — preloads two expo-audio players for low-latency playback.
 *
 * Exposes playWarning() (5s warning) and playEnd() (phase transition) to
 * the caller. Configures iOS silent-mode override on mount and disposes
 * both players on unmount.
 *
 * Audio asset files must exist at assets/sounds/alert_warning.mp3 and
 * assets/sounds/alert_end.mp3. If an asset is missing, the play calls
 * fall back to expo-haptics vibration so the user still gets physical
 * feedback even without the sound files.
 *
 * NOTE: require() calls are wrapped in try/catch at the call site (not at
 * module level) so Metro does not fail the bundle when the files are absent.
 */

import { useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import type { AudioPlayer } from 'expo-audio';

export interface AudioController {
  playWarning(): void;
  playEnd(): void;
}

/**
 * Safely require an audio asset. Returns the asset module number if found,
 * or null if Metro cannot resolve the file (missing asset).
 * Wrapping the require() inside a function body prevents Metro from
 * hard-failing the bundle on a missing static require target at module load.
 */
function tryRequireWarning(): number | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../assets/sounds/alert_warning.mp3') as number;
  } catch {
    return null;
  }
}

function tryRequireEnd(): number | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../assets/sounds/alert_end.mp3') as number;
  } catch {
    return null;
  }
}

export function useAudio(): AudioController {
  const warningPlayerRef = useRef<AudioPlayer | null>(null);
  const endPlayerRef = useRef<AudioPlayer | null>(null);
  const warningAvailableRef = useRef<boolean>(false);
  const endAvailableRef = useRef<boolean>(false);

  useEffect(() => {
    // Configure iOS session: play even when the physical silent switch is on
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {
      // Non-fatal — Android ignores playsInSilentMode
    });

    // Preload players for low-latency playback
    const warningAsset = tryRequireWarning();
    if (warningAsset != null) {
      try {
        warningPlayerRef.current = createAudioPlayer(warningAsset);
        warningAvailableRef.current = true;
      } catch {
        // Asset exists but player creation failed — haptics fallback will be used
      }
    }

    const endAsset = tryRequireEnd();
    if (endAsset != null) {
      try {
        endPlayerRef.current = createAudioPlayer(endAsset);
        endAvailableRef.current = true;
      } catch {
        // Asset exists but player creation failed — haptics fallback will be used
      }
    }

    return () => {
      warningPlayerRef.current?.remove();
      endPlayerRef.current?.remove();
      warningPlayerRef.current = null;
      endPlayerRef.current = null;
      warningAvailableRef.current = false;
      endAvailableRef.current = false;
    };
  }, []);

  function playWarning(): void {
    if (warningAvailableRef.current) {
      const player = warningPlayerRef.current;
      if (player != null) {
        try {
          player.seekTo(0).catch(() => {});
          player.play();
          return;
        } catch {
          // Fall through to haptics
        }
      }
    }
    // Haptics fallback: light notification tap when audio asset is unavailable
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }

  function playEnd(): void {
    if (endAvailableRef.current) {
      const player = endPlayerRef.current;
      if (player != null) {
        try {
          player.seekTo(0).catch(() => {});
          player.play();
          return;
        } catch {
          // Fall through to haptics
        }
      }
    }
    // Haptics fallback: success notification tap when audio asset is unavailable
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  return { playWarning, playEnd };
}
