# Sound Assets

Place the following audio files in this directory before building:

- `alert-warning.mp3` — short beep played 5 seconds before a phase ends
- `alert-end.mp3` — distinct tone played when a phase transitions

## Requirements

- Format: MP3 (AAC also supported by expo-audio)
- Duration: < 1 second recommended (0.2–0.5s ideal)
- Both files must be present; useAudio.ts will catch missing assets gracefully

## Free sources

- https://freesound.org (CC0 license)
- https://mixkit.co/free-sound-effects/
