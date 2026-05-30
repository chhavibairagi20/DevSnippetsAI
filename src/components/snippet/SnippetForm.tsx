import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Menu, Text, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { PROGRAMMING_LANGUAGES } from '../../constants/languages';
import { useAppTheme } from '../../hooks/SettingsContext';

export interface SnippetFormData {
  title: string;
  code: string;
  language: string;
  tags: string;
  imageUri?: string | null;
}

interface Props {
  initial: SnippetFormData;
  onSubmit: (data: SnippetFormData) => void;
  submitLabel?: string;
  loading?: boolean;
}

export const SnippetForm: React.FC<Props> = ({
  initial,
  onSubmit,
  submitLabel = 'Save Snippet',
  loading,
}) => {
  const { colors, fontSizes } = useAppTheme();
  const [form, setForm] = useState<SnippetFormData>(initial);
  const [langMenuVisible, setLangMenuVisible] = useState(false);

  const update = (key: keyof SnippetFormData, value: string | null) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      update('imageUri', result.assets[0].uri);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label="Title"
        value={form.title}
        onChangeText={(v) => update('title', v)}
        mode="outlined"
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
      />

      <Menu
        visible={langMenuVisible}
        onDismiss={() => setLangMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setLangMenuVisible(true)}
            style={[styles.langBtn, { borderColor: colors.border }]}
            textColor={colors.text}
            icon="code-tags"
          >
            {form.language}
          </Button>
        }
      >
        {PROGRAMMING_LANGUAGES.map((lang) => (
          <Menu.Item
            key={lang}
            onPress={() => {
              update('language', lang);
              setLangMenuVisible(false);
            }}
            title={lang}
          />
        ))}
      </Menu>

      <TextInput
        label="Tags (comma separated)"
        value={form.tags}
        onChangeText={(v) => update('tags', v)}
        mode="outlined"
        placeholder="react, hooks, api"
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
      />

      <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSizes.caption }]}>
        CODE
      </Text>
      <TextInput
        value={form.code}
        onChangeText={(v) => update('code', v)}
        mode="outlined"
        multiline
        numberOfLines={12}
        style={[styles.codeInput, { fontFamily: 'monospace', fontSize: fontSizes.code }]}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        placeholder="// Paste your snippet here..."
        placeholderTextColor={colors.textMuted}
      />

      {form.imageUri ? (
        <Image source={{ uri: form.imageUri }} style={styles.preview} />
      ) : null}

      <Button mode="outlined" icon="image-plus" onPress={pickImage} style={styles.attachBtn}>
        Attach Screenshot
      </Button>

      <Button
        mode="contained"
        onPress={() => onSubmit(form)}
        loading={loading}
        disabled={loading}
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        labelStyle={styles.saveLabel}
      >
        {submitLabel}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  input: { marginBottom: 12 },
  langBtn: { marginBottom: 12, alignSelf: 'flex-start' },
  label: { marginBottom: 6, letterSpacing: 1, fontWeight: '600' },
  codeInput: { minHeight: 200, textAlignVertical: 'top' },
  preview: { width: '100%', height: 160, borderRadius: 10, marginVertical: 12 },
  attachBtn: { marginBottom: 16 },
  saveBtn: { borderRadius: 10, paddingVertical: 4 },
  saveLabel: { fontSize: 16, fontWeight: '600' },
});
