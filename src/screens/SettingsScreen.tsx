import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Divider,
  List,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarHeight } from '../constants/layout';
import type { MainTabScreenProps } from '../types/navigation';
import type { FontSize, ThemeMode } from '../types/settings';
import { useSettings } from '../hooks/SettingsContext';
import {
  deleteOpenRouterApiKey,
  getOpenRouterApiKey,
  saveOpenRouterApiKey,
} from '../storage/secureStorage';
import { testOpenRouterConnection } from '../services/aiService';
import { isMaskedKey, normalizeApiKey, validateOpenRouterApiKey } from '../utils/apiKey';

type KeyField = {
  value: string;
  saved: boolean;
  editing: boolean;
};

const emptyField = (): KeyField => ({ value: '', saved: false, editing: false });

const SettingsScreen: React.FC<MainTabScreenProps<'Settings'>> = () => {
  const { settings, updateSettings, colors, fontSizes } = useSettings();
  const insets = useSafeAreaInsets();
  const tabBarHeight = getTabBarHeight(insets.bottom);

  const [openRouter, setOpenRouter] = useState<KeyField>(emptyField());
  const [testing, setTesting] = useState(false);

  const loadKeys = useCallback(async () => {
    const key = await getOpenRouterApiKey();
    if (key) setOpenRouter({ value: '', saved: true, editing: false });
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const startEdit = () => {
    setOpenRouter({ value: '', saved: false, editing: true });
  };

  const saveKey = async () => {
    const field = openRouter;
    if (field.saved && !field.editing) {
      Alert.alert('Already saved', 'Tap "Replace key" to enter a new key.');
      return;
    }
    if (isMaskedKey(field.value)) return;

    const normalized = normalizeApiKey(field.value);
    const validationError = validateOpenRouterApiKey(normalized);
    if (validationError) {
      Alert.alert('Invalid key', validationError);
      return;
    }

    try {
      await saveOpenRouterApiKey(normalized);
      setOpenRouter({ value: '', saved: true, editing: false });
      Alert.alert(
        'Saved',
        'OpenRouter API key stored. You can now use "Explain with AI".'
      );
    } catch {
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const removeKey = () => {
    Alert.alert('Remove API key?', 'Delete saved OpenRouter key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteOpenRouterApiKey();
          setOpenRouter(emptyField());
        },
      },
    ]);
  };

  const runTest = async () => {
    const field = openRouter;
    setTesting(true);
    try {
      if (field.editing && field.value && !isMaskedKey(field.value)) {
        const err = validateOpenRouterApiKey(field.value);
        if (err) {
          Alert.alert('Invalid key', err);
          return;
        }
        await testOpenRouterConnection(normalizeApiKey(field.value));
      } else {
        await testOpenRouterConnection();
      }
      Alert.alert('Success', 'OpenRouter is working. You can use "Explain with AI" now.');
    } catch (e) {
      Alert.alert('Connection failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  const renderKeySection = (
    label: string,
    field: KeyField,
    setField: React.Dispatch<React.SetStateAction<KeyField>>
  ) => (
    <View style={styles.keyBlock}>
      <View style={styles.keyHeader}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
        {field.saved && !field.editing ? (
          <Chip compact icon="check" style={{ backgroundColor: colors.surfaceElevated }}>
            Saved
          </Chip>
        ) : null}
      </View>

      {field.saved && !field.editing ? (
        <View style={styles.keyActions}>
          <Button mode="outlined" onPress={() => startEdit()} compact>
            Replace key
          </Button>
          <Button mode="text" onPress={() => removeKey()} compact textColor={colors.error}>
            Remove
          </Button>
        </View>
      ) : (
        <TextInput
          label={`${label} API Key`}
          value={field.value}
          onChangeText={(v) => setField((prev) => ({ ...prev, value: v }))}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          placeholder="sk-or-v1-..."
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}

      <View style={styles.keyActions}>
        {(field.editing || !field.saved) && (
          <Button
            mode="contained"
            icon="content-save"
            onPress={() => saveKey()}
            compact
            style={{ backgroundColor: colors.primary }}
          >
            Save
          </Button>
        )}
        <Button
          mode="outlined"
          icon="connection"
          onPress={() => runTest()}
          loading={testing}
          disabled={testing}
          compact
        >
          Test
        </Button>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSizes.title + 2 }]}>
          Settings
        </Text>

        <List.Section>
          <List.Subheader style={{ color: colors.textSecondary }}>Appearance</List.Subheader>
          <SegmentedButtons
            value={settings.theme}
            onValueChange={(v) => updateSettings({ theme: v as ThemeMode })}
            buttons={[
              { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
              { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
              { value: 'system', label: 'System', icon: 'cellphone' },
            ]}
            style={styles.segment}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Font Size</Text>
          <SegmentedButtons
            value={settings.fontSize}
            onValueChange={(v) => updateSettings({ fontSize: v as FontSize })}
            buttons={[
              { value: 'small', label: 'S' },
              { value: 'medium', label: 'M' },
              { value: 'large', label: 'L' },
            ]}
            style={styles.segment}
          />
        </List.Section>

        <Divider style={{ backgroundColor: colors.border }} />

        <List.Section>
          <List.Subheader style={{ color: colors.textSecondary }}>AI (OpenRouter)</List.Subheader>
          {renderKeySection('OpenRouter', openRouter, setOpenRouter)}
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Create a key at openrouter.ai/keys. Tap Test after saving to verify it works.
          </Text>
        </List.Section>

        <View style={[styles.about, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>DevSnippets AI v1.0</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 13 }}>
            Offline-first developer snippet notebook
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontWeight: '700', marginBottom: 16 },
  segment: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 8, marginTop: 4 },
  input: { marginBottom: 8 },
  hint: { fontSize: 12, marginBottom: 16, lineHeight: 18 },
  keyBlock: { marginBottom: 20 },
  keyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  keyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  about: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
});

export default SettingsScreen;
