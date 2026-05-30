import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { LANGUAGE_COLORS } from '../../constants/languages';
import { useAppTheme } from '../../hooks/SettingsContext';

interface Props {
  code: string;
  language: string;
  maxLines?: number;
}

export const CodePreview: React.FC<Props> = ({ code, language, maxLines = 6 }) => {
  const { colors, fontSizes } = useAppTheme();
  const lines = code.split('\n').slice(0, maxLines);
  const langColor = LANGUAGE_COLORS[language.toLowerCase()] ?? LANGUAGE_COLORS.other;

  return (
    <View style={[styles.container, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
      <View style={[styles.langBar, { backgroundColor: colors.surfaceElevated }]}>
        <View style={[styles.dot, { backgroundColor: langColor }]} />
        <Text style={[styles.lang, { color: langColor, fontSize: fontSizes.caption }]}>
          {language}
        </Text>
      </View>
      <ScrollView horizontal nestedScrollEnabled>
        <Text
          style={[styles.code, { color: colors.text, fontSize: fontSizes.code }]}
          selectable
        >
          {lines.join('\n')}
          {code.split('\n').length > maxLines ? '\n…' : ''}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  langBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  lang: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  code: {
    fontFamily: 'monospace',
    padding: 12,
    lineHeight: 20,
  },
});
