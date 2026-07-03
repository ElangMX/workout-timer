// App-wide constants for workout-timer-v1

// Timer thresholds
export const WARNING_AT_SECONDS = 5;
export const COUNTDOWN_SECONDS = 3;

// Color palette — calisthenics-appropriate dark theme
export const COLORS = {
  // Backgrounds
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#262626',

  // Brand accent
  accent: '#F5A623',       // warm amber — energy without aggression
  accentDim: '#C47F0A',

  // Phase colors
  exercise: '#4CAF50',     // green — go / effort
  rest: '#2196F3',         // blue — recovery / cool down
  countdown: '#FF9800',    // orange — get ready
  done: '#9C27B0',         // purple — complete

  // Status
  warning: '#FF5722',      // deep orange — attention

  // Text
  textPrimary: '#F5F5F5',
  textSecondary: '#9E9E9E',
  textDisabled: '#424242',

  // Interactive
  buttonPrimary: '#F5A623',
  buttonDanger: '#E53935',
  buttonNeutral: '#37474F',
} as const;
