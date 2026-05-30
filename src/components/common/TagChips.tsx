import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { parseTags } from '../../utils/validation';
import { useAppTheme } from '../../hooks/SettingsContext';

interface Props {
  tags: string;
  onTagPress?: (tag: string) => void;
}

export const TagChips: React.FC<Props> = ({ tags, onTagPress }) => {
  const { colors } = useAppTheme();
  const tagList = parseTags(tags);

  if (!tagList.length) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {tagList.map((tag) => (
          <Chip
            key={tag}
            compact
            mode="outlined"
            onPress={onTagPress ? () => onTagPress(tag) : undefined}
            style={[styles.chip, { borderColor: colors.border }]}
            textStyle={{ color: colors.accent, fontSize: 11 }}
          >
            {tag}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  chip: { height: 28 },
});
