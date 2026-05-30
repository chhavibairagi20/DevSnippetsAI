import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../types/navigation';
import { initDatabase } from '../database/init';
import { initFileStorage } from '../services/fileService';
import { useAppTheme } from '../hooks/SettingsContext';
import { BottomTabs } from './BottomTabs';
import CreateSnippetScreen from '../screens/CreateSnippetScreen';
import SnippetDetailScreen from '../screens/SnippetDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const SplashScreen: React.FC = () => {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.splash, { backgroundColor: colors.background }]}>
      <MaterialCommunityIcons name="code-braces-box" size={72} color={colors.primary} />
      <Text style={[styles.splashTitle, { color: colors.text }]}>DevSnippets AI</Text>
      <Text style={[styles.splashSub, { color: colors.textSecondary }]}>
        Offline-first developer notebook
      </Text>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
    </View>
  );
};

const AppNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initDatabase();
        await initFileStorage();
      } catch (e) {
        console.error('Bootstrap failed:', e);
      } finally {
        setReady(true);
      }
    };
    bootstrap();
  }, []);

  if (!ready) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateSnippet"
        component={CreateSnippetScreen}
        options={({ route }) => ({
          title: route.params?.snippetId ? 'Edit Snippet' : 'New Snippet',
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="SnippetDetail"
        component={SnippetDetailScreen}
        options={{ title: 'Snippet' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  splashSub: {
    fontSize: 14,
    marginTop: 6,
  },
});

export default AppNavigator;
