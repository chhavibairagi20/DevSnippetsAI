import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarHeight } from '../constants/layout';
import type { MainTabScreenProps } from '../types/navigation';
import { useSnippets } from '../hooks/useSnippets';
import { useAppTheme } from '../hooks/SettingsContext';
import { SnippetCard } from '../components/snippet/SnippetCard';
import { EmptyState } from '../components/common/EmptyState';
import { toggleFavorite } from '../database/snippetQueries';

const FavoritesScreen: React.FC<MainTabScreenProps<'Favorites'>> = ({ navigation }) => {
  const { colors, fontSizes } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const { snippets, loading, loadFavorites } = useSnippets();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleUnfavorite = async (id: number) => {
    await toggleFavorite(id);
    loadFavorites();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSizes.title + 2 }]}>
          Favorites
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          {snippets.length} starred snippet{snippets.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={snippets}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <SnippetCard
            snippet={item}
            onPress={() => navigation.navigate('SnippetDetail', { snippetId: item.id })}
            onFavoritePress={() => handleUnfavorite(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadFavorites} tintColor={colors.primary} />
        }
        contentContainerStyle={
          snippets.length === 0
            ? [styles.empty, { paddingBottom: tabBarHeight + 16 }]
            : [styles.list, { paddingBottom: tabBarHeight + 16 }]
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="star-outline"
              title="No favorites yet"
              subtitle="Star snippets from Home or Detail view"
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
  list: { paddingBottom: 24 },
  empty: { flexGrow: 1 },
});

export default FavoritesScreen;
