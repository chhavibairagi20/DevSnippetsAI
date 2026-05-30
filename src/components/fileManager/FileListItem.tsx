import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, List, Text } from 'react-native-paper';
import type { LocalFile } from '../../services/fileService';
import { formatFileSize } from '../../services/fileService';
import { useAppTheme } from '../../hooks/SettingsContext';

interface Props {
  file: LocalFile;
  onPress: () => void;
  onDelete: () => void;
  onCopy?: () => void;
}

const getFileIcon = (name: string): string => {
  if (name.endsWith('.js')) return 'language-javascript';
  if (name.endsWith('.json')) return 'code-json';
  return 'file-document-outline';
};

export const FileListItem: React.FC<Props> = ({ file, onPress, onDelete, onCopy }) => {
  const { colors } = useAppTheme();

  return (
    <List.Item
      title={file.name}
      description={`${formatFileSize(file.size)}`}
      left={(props) => <List.Icon {...props} icon={getFileIcon(file.name)} color={colors.primary} />}
      right={() => (
        <View style={styles.actions}>
          {onCopy && <IconButton icon="content-copy" size={20} onPress={onCopy} iconColor={colors.textSecondary} />}
          <IconButton icon="delete-outline" size={20} onPress={onDelete} iconColor={colors.error} />
        </View>
      )}
      onPress={onPress}
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      titleStyle={{ color: colors.text }}
      descriptionStyle={{ color: colors.textMuted }}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
