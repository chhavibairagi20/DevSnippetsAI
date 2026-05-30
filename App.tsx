import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SettingsProvider, useSettings } from './src/hooks/SettingsContext';

const AppContent: React.FC = () => {
  const { paperTheme, isDark } = useSettings();
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer
        theme={{
          ...navTheme,
          colors: {
            ...navTheme.colors,
            background: paperTheme.colors.background,
            card: paperTheme.colors.surface,
            primary: paperTheme.colors.primary,
            text: paperTheme.colors.onBackground,
            border: paperTheme.colors.outline,
          },
        }}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
