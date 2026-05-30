import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import type { RootStackScreenProps } from '../types/navigation';
import { SnippetForm, type SnippetFormData } from '../components/snippet/SnippetForm';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { getSnippetById, insertSnippet, updateSnippet } from '../database/snippetQueries';
import { validateSnippet } from '../utils/validation';
import { useSettings } from '../hooks/SettingsContext';

const CreateSnippetScreen: React.FC<RootStackScreenProps<'CreateSnippet'>> = ({
  navigation,
  route,
}) => {
  const { settings } = useSettings();
  const snippetId = route.params?.snippetId;
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState<SnippetFormData>({
    title: '',
    code: '',
    language: settings.defaultLanguage,
    tags: '',
    imageUri: null,
  });

  useEffect(() => {
    if (snippetId) {
      getSnippetById(snippetId).then((s) => {
        if (s) {
          setInitial({
            title: s.title,
            code: s.code,
            language: s.language,
            tags: s.tags,
            imageUri: s.imageUri,
          });
        }
      });
    }
  }, [snippetId]);

  const handleSubmit = async (data: SnippetFormData) => {
    const err = validateSnippet(data.title, data.code);
    if (err) {
      Alert.alert('Validation', err);
      return;
    }

    setLoading(true);
    try {
      if (snippetId) {
        await updateSnippet(snippetId, data);
      } else {
        await insertSnippet(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save snippet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SnippetForm
        initial={initial}
        onSubmit={handleSubmit}
        submitLabel={snippetId ? 'Update Snippet' : 'Save Snippet'}
        loading={loading}
      />
      <LoadingOverlay visible={loading} message="Saving..." />
    </>
  );
};

export default CreateSnippetScreen;
