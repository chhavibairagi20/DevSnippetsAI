import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useAppTheme } from '../../hooks/SettingsContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder = 'Search snippets...',
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Searchbar
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[styles.search, { backgroundColor: colors.searchBg }]}
        inputStyle={{ color: colors.text, fontSize: 15 }}
        iconColor={colors.textSecondary}
        placeholderTextColor={colors.textMuted}
        elevation={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingBottom: 8 },
  search: { borderRadius: 10 },
});
