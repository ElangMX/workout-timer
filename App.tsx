import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TimerProvider } from './src/context/TimerContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { RoutineSetupScreen } from './src/screens/RoutineSetupScreen';
import { ActiveTimerScreen } from './src/screens/ActiveTimerScreen';
import { CompletionScreen } from './src/screens/CompletionScreen';
import { COLORS } from './src/constants';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <TimerProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.surface },
            headerTintColor: COLORS.textPrimary,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'My Routines' }}
          />
          <Stack.Screen
            name="RoutineSetup"
            component={RoutineSetupScreen}
            options={({ route }) => ({
              title: route.params?.routineId ? 'Edit Routine' : 'New Routine',
            })}
          />
          <Stack.Screen
            name="ActiveTimer"
            component={ActiveTimerScreen}
            options={{
              title: 'Workout',
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Completion"
            component={CompletionScreen}
            options={{
              title: 'Complete',
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TimerProvider>
  );
}
