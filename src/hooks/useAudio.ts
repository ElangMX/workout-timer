/**
 * useAudio — preloads two expo-audio players for low-latency playback.
 *
 * Exposes playWarning() (5s warning) and playEnd() (phase transition) to
 * the caller. Configures iOS silent-mode override on mount and disposes
 * both players on unmount.
 *
 * Audio asset files must exist at assets/sounds/alert-warning.mp3 and
 * assets/sounds/alert-end.mp3. If an asset is missing the play calls
 * are no-ops (graceful degradation).
 */

import { useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

export interface AudioController {
  playWarning(): void;
  playEnd(): void;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const WARNING_ASSET = require('../../assets/sounds/alert-warning.mp3') as number | null;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const END_ASSET = require('../../assets/sounds/alert-end.mp3') as number | null;

export function useAudio(): AudioController {
  const warningPlayerRef = useRef<AudioPlayer | null>(null);
  const endPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    // Configure iOS session: play even when the physical silent switch is on
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {
      // Non-fatal — Android ignores playsInSilentMode
    });

    // Preload players for low-latency playback
    try {
      if (WARNING_ASSET != null) {
        warningPlayerRef.current = createAudioPlayer(WARNING_ASSET);
      }
    } catch {
      // Asset missing or platform error — play calls will be no-ops
    }

    try {
      if (END_ASSET != null) {
        endPlayerRef.current = createAudioPlayer(END_ASSET);
      }
    } catch {
      // Asset missing or platform error — play calls will be no-ops
    }

    return () => {
      warningPlayerRef.current?.remove();
      endPlayerRef.current?.remove();
      warningPlayerRef.current = null;
      endPlayerRef.current = null;
    };
  }, []);

  function playWarning(): void {
    const player = warningPlayerRef.current;
    if (player == null) return;
    try {
      player.seekTo(0).catch(() => {});
      player.play();
    } catch {
      // No-op: asset may not have loaded yet
    }
  }

  function playEnd(): void {
    const player = endPlayerRef.current;
    if (player == null) return;
    try {
      player.seekTo(0).catch(() => {});
      player.play();
    } catch {
      // No-op: asset may not have loaded yet
    }
  }

  return { playWarning, playEnd };
}
