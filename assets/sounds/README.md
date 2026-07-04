# Sound Assets

Place the following audio files in this directory before building:

- `alert_warning.mp3` — short beep played 5 seconds before a phase ends
- `alert_end.mp3` — distinct tone played when a phase transitions

Until these files are added the app falls back to **haptic feedback** (vibration)
via `expo-haptics` so users still receive physical alerts even without sound files.

---

## Required filenames (exact)

| File | Purpose | Haptic fallback |
|---|---|---|
| `alert_warning.mp3` | Warning beep at 5 s remaining | `NotificationFeedbackType.Warning` |
| `alert_end.mp3` | Phase-end tone on transition | `NotificationFeedbackType.Success` |

---

## Format requirements

- **Format**: MP3 (AAC / `.m4a` also supported by `expo-audio`)
- **Duration**: 0.5–1 s for the warning beep; 1–2 s for the phase-end tone
- **File size**: < 100 KB each (keeps the app bundle small)
- **Channels**: Mono or stereo both work
- **Sample rate**: 44 100 Hz recommended

---

## Where to download free sounds

These sites offer CC0 / royalty-free short beeps and alert tones:

- **freesound.org** — search `"short beep"` or `"notification beep"`, filter by CC0  
  Example: <https://freesound.org/search/?q=short+beep&f=license%3A%22Creative+Commons+0%22>

- **pixabay.com/sound-effects** — search `"beep"` or `"alert"`, no attribution required  
  Example: <https://pixabay.com/sound-effects/search/beep/>

- **mixkit.co/free-sound-effects** — browse the "Alerts & Notifications" category  
  Example: <https://mixkit.co/free-sound-effects/beep/>

**Suggested picks**:
- Warning (`alert-warning.mp3`): a single short beep, ~0.5 s, moderate pitch
- End (`alert-end.mp3`): a two-tone chime or a slightly longer bell, ~1–2 s

---

## How to add the files

1. Download both MP3 files from one of the sources above.
2. Rename them exactly:
   - `alert_warning.mp3`
   - `alert_end.mp3`
3. Copy them into this directory (`assets/sounds/`).
4. Verify Metro can find them:
   ```bash
   npx expo start
   ```
   Open the app on a device/simulator, start a routine, and confirm you hear
   the warning beep 5 seconds before a phase ends and the end tone on transition.

---

## Background notification sounds (iOS/Android)

`notificationScheduler.ts` references these filenames directly in the
`sound` field of each scheduled notification:

```ts
sound: 'alert_warning.mp3'   // warning notification
sound: 'alert_end.mp3'       // phase-end notification
```

On **iOS** the files must also be listed in `app.json` under the
`expo-notifications` plugin config (already done). On **Android** they are
bundled automatically by Expo.

---

## Verifying silent-mode playback (iOS)

`useAudio.ts` calls `setAudioModeAsync({ playsInSilentMode: true })` so
sounds play even when the iOS silent switch is on. Test by:

1. Enable silent mode on the device.
2. Start a routine.
3. Confirm you still hear the warning and end sounds (or feel haptics if
   assets are absent).
