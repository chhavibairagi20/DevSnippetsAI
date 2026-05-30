import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Snippet } from '../../types/snippet';
import { LANGUAGE_COLORS } from '../../constants/languages';
import { formatDate } from '../../utils/date';
import { TagChips } from '../common/TagChips';
import { CodePreview } from './CodePreview';
import { useAppTheme } from '../../hooks/SettingsContext';

interface Props {
  snippet: Snippet;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export const SnippetCard: React.FC<Props> = ({ snippet, onPress, onFavoritePress }) => {
  const { colors, fontSizes } = useAppTheme();
  const langColor = LANGUAGE_COLORS[snippet.language.toLowerCase()] ?? LANGUAGE_COLORS.other;

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="file-code-outline" size={20} color={langColor} />
              <Text
                style={[styles.title, { color: colors.text, fontSize: fontSizes.body + 1 }]}
                numberOfLines={1}
              >
                {snippet.title}
              </Text>
            </View>
            {onFavoritePress && (
              <IconButton
                icon={snippet.favorite ? 'star' : 'star-outline'}
                iconColor={snippet.favorite ? colors.favorite : colors.textMuted}
                size={20}
                onPress={onFavoritePress}
              />
            )}
          </View>

          <TagChips tags={snippet.tags} />

          <View style={styles.preview}>
            <CodePreview code={snippet.code} language={snippet.language} maxLines={4} />
          </View>

          <Text style={[styles.date, { color: colors.textMuted, fontSize: fontSizes.caption }]}>
            {formatDate(snippet.createdAt)}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontWeight: '600', flex: 1 },
  preview: { marginTop: 10, marginBottom: 8 },
  date: { marginTop: 4 },
});
