import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarHeight } from '../constants/layout';
import * as Sharing from 'expo-sharing';
import type { MainTabScreenProps } from '../types/navigation';
import { useAppTheme } from '../hooks/SettingsContext';
import { FileListItem } from '../components/fileManager/FileListItem';
import { EmptyState } from '../components/common/EmptyState';
import {
  listFiles,
  deleteFile,
  copyFile,
  readFileContent,
  getBaseDirectory,
  type LocalFile,
} from '../services/fileService';

const SUBDIRS = [
  { value: '', label: 'All' },
  { value: 'exports/', label: 'Exports' },
  { value: 'screenshots/', label: 'Screenshots' },
];

const FileManagerScreen: React.FC<MainTabScreenProps<'Files'>> = () => {
  const { colors, fontSizes } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [subdir, setSubdir] = useState('');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      if (subdir === '') {
        const all = [
          ...(await listFiles('exports/')),
          ...(await listFiles('screenshots/')),
          ...(await listFiles('')),
        ];
        const seen = new Set<string>();
        setFiles(all.filter((f) => !seen.has(f.uri) && seen.add(f.uri)));
      } else {
        setFiles(await listFiles(subdir));
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [subdir]);

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [loadFiles])
  );

  const handleOpen = async (file: LocalFile) => {
    try {
      const content = await readFileContent(file.uri);
      Alert.alert(file.name, content.slice(0, 800) + (content.length > 800 ? '\n…' : ''));
    } catch {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      }
    }
  };

  const handleDelete = (file: LocalFile) => {
    Alert.alert('Delete File', `Delete ${file.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFile(file.uri);
          loadFiles();
        },
      },
    ]);
  };

  const handleCopy = async (file: LocalFile) => {
    try {
      await copyFile(file.uri, `${getBaseDirectory()}screenshots/`);
      Alert.alert('Copied', 'File copied to screenshots folder');
      loadFiles();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Copy failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSizes.title + 2 }]}>
          File Manager
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSizes.caption }}>
          Local storage · offline
        </Text>
      </View>

      <SegmentedButtons
        value={subdir}
        onValueChange={setSubdir}
        buttons={SUBDIRS}
        style={styles.segment}
      />

      <FlatList
        data={files}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <FileListItem
            file={item}
            onPress={() => handleOpen(item)}
            onDelete={() => handleDelete(item)}
            onCopy={() => handleCopy(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadFiles} tintColor={colors.primary} />
        }
        contentContainerStyle={
          files.length === 0
            ? [styles.empty, { paddingBottom: tabBarHeight + 16 }]
            : [styles.list, { paddingBottom: tabBarHeight + 16 }]
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="folder-open-outline"
              title="No files yet"
              subtitle="Export snippets to see them here"
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontWeight: '700', marginBottom: 4 },
  segment: { marginHorizontal: 16, marginBottom: 12 },
  list: { paddingBottom: 24 },
  empty: { flexGrow: 1 },
});

export default FileManagerScreen;
