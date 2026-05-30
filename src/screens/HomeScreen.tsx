import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, FAB, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../types/navigation';
import { useSnippets } from '../hooks/useSnippets';
import { useAppTheme } from '../hooks/SettingsContext';
import { SearchBar } from '../components/common/SearchBar';
import { SnippetCard } from '../components/snippet/SnippetCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { toggleFavorite } from '../database/snippetQueries';
import { PROGRAMMING_LANGUAGES } from '../constants/languages';
import { getTabBarHeight } from '../constants/layout';

const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = ({ navigation }) => {
  const { colors, fontSizes } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { snippets, loading, error, loadAll, search, filterLanguage } = useSnippets();
  const [query, setQuery] = useState('');
  const [activeLang, setActiveLang] = useState<string | null>(null);

  const tabBarHeight = getTabBarHeight(insets.bottom);
  const fabBottom = tabBarHeight + 16;
  const listBottomPadding = tabBarHeight + 80;

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const handleSearch = (text: string) => {
    setQuery(text);
    if (activeLang) setActiveLang(null);
    search(text);
  };

  const handleLangFilter = (lang: string | null) => {
    setActiveLang(lang);
    setQuery('');
    filterLanguage(lang);
  };

  const handleFavorite = async (id: number) => {
    await toggleFavorite(id);
    if (query) search(query);
    else if (activeLang) filterLanguage(activeLang);
    else loadAll();
  };

  const renderHeader = () => (
    <View style={[styles.topSection, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSizes.title + 4 }]}>
          DevSnippets
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {snippets.length} snippet{snippets.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <SearchBar value={query} onChangeText={handleSearch} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
        bounces={false}
      >
        <Chip
          selected={!activeLang}
          onPress={() => handleLangFilter(null)}
          style={styles.filterChip}
          textStyle={{ fontSize: 12 }}
        >
          All
        </Chip>
        {PROGRAMMING_LANGUAGES.slice(0, 8).map((lang) => (
          <Chip
            key={lang}
            selected={activeLang === lang}
            onPress={() => handleLangFilter(activeLang === lang ? null : lang)}
            style={styles.filterChip}
            textStyle={{ fontSize: 12 }}
          >
            {lang}
          </Chip>
        ))}
      </ScrollView>

      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {renderHeader()}

      <FlatList
        data={snippets}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <SnippetCard
            snippet={item}
            onPress={() => navigation.navigate('SnippetDetail', { snippetId: item.id })}
            onFavoritePress={() => handleFavorite(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAll} tintColor={colors.primary} />
        }
        contentContainerStyle={
          snippets.length === 0
            ? [styles.emptyList, { paddingBottom: listBottomPadding }]
            : [styles.list, { paddingBottom: listBottomPadding }]
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No snippets yet"
              subtitle="Tap + to create your first code snippet"
              icon="notebook-plus-outline"
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.fab, bottom: fabBottom }]}
        color="#FFF"
        onPress={() => navigation.navigate('CreateSnippet')}
      />

      <LoadingOverlay visible={loading && snippets.length === 0} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    zIndex: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  filters: { maxHeight: 48, marginBottom: 8 },
  filtersContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    paddingRight: 24,
  },
  filterChip: { marginRight: 0 },
  list: { paddingTop: 4 },
  emptyList: { flexGrow: 1 },
  fab: { position: 'absolute', right: 20, borderRadius: 16 },
  error: { textAlign: 'center', paddingHorizontal: 16, paddingBottom: 8 },
});

export default HomeScreen;
