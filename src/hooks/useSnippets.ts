import { useCallback, useState } from 'react';
import type { Snippet } from '../types/snippet';
import {
  getAllSnippets,
  getFavoriteSnippets,
  searchSnippets,
  filterByLanguage,
} from '../database/snippetQueries';

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSnippets();
      setSnippets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load snippets');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFavoriteSnippets();
      setSnippets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = query.trim() ? await searchSnippets(query) : await getAllSnippets();
      setSnippets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterLanguage = useCallback(async (language: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const data = language ? await filterByLanguage(language) : await getAllSnippets();
      setSnippets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Filter failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    snippets,
    loading,
    error,
    loadAll,
    loadFavorites,
    search,
    filterLanguage,
    setSnippets,
  };
};
