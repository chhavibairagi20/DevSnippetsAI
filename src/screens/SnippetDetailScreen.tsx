import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Divider, IconButton, Menu, Text, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackScreenProps } from '../types/navigation';
import type { AIExplanation, ExportFormat } from '../types/snippet';
import { getSnippetById, deleteSnippet, toggleFavorite } from '../database/snippetQueries';
import { useAppTheme } from '../hooks/SettingsContext';
import { CodePreview } from '../components/snippet/CodePreview';
import { TagChips } from '../components/common/TagChips';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { formatDate } from '../utils/date';
import type { Snippet } from '../types/snippet';
import { generateExplanation, sendAiChat } from '../services/aiService';
import { exportSnippet, shareFile } from '../services/exportService';

const SnippetDetailScreen: React.FC<RootStackScreenProps<'SnippetDetail'>> = ({
  navigation,
  route,
}) => {
  const { colors, fontSizes } = useAppTheme();
  const { snippetId } = route.params;

  type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
  };

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIExplanation | null>(null);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [followUps, setFollowUps] = useState<Array<{ question: string; answer: string }>>([]);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);

  const load = useCallback(async () => {
    const data = await getSnippetById(snippetId);
    setSnippet(data);
    if (data) navigation.setOptions({ title: data.title });
  }, [snippetId, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleFavorite = async () => {
    await toggleFavorite(snippetId);
    load();
  };

  const handleDelete = () => {
    Alert.alert('Delete Snippet', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSnippet(snippetId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleAI = async () => {
    if (!snippet) return;
    setLoading(true);
    setAiResult(null);
    setFollowUps([]);
    setConversation([]);
    try {
      const result = await generateExplanation(snippet.code, snippet.language);
      setAiResult(result);
      if (result.rawResponse) {
        setConversation([
          {
            role: 'system',
            content: 'You are a helpful programming tutor. Analyze the code and respond to follow-up questions using the provided code context.',
          },
          {
            role: 'user',
            content: `Language: ${snippet.language}\n\nCode:\n${snippet.code}`,
          },
          {
            role: 'assistant',
            content: result.rawResponse,
          },
        ]);
      }
    } catch (e) {
      Alert.alert(
        'AI Error',
        e instanceof Error ? e.message : 'Failed to generate explanation. Check your API key and internet.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim() || conversation.length === 0) return;

    setLoading(true);
    try {
      const nextMessages = [
        ...conversation,
        { role: 'user', content: followUp.trim() },
      ];
      const reply = await sendAiChat(nextMessages);
      setConversation([...nextMessages, { role: 'assistant', content: reply }]);
      setFollowUps((current) => [...current, { question: followUp.trim(), answer: reply }]);
      setFollowUp('');
    } catch (e) {
      Alert.alert(
        'AI Error',
        e instanceof Error ? e.message : 'Failed to send follow-up question. Check your API key and internet.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!snippet) return;
    setExportMenuVisible(false);
    setLoading(true);
    try {
      const uri = await exportSnippet(snippet, format);
      Alert.alert('Exported', 'File saved locally.', [
        { text: 'OK' },
        { text: 'Share', onPress: () => shareFile(uri) },
      ]);
    } catch (e) {
      Alert.alert('Export Error', e instanceof Error ? e.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  if (!snippet) {
    return <LoadingOverlay visible message="Loading snippet..." />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.actions}>
        <IconButton
          icon={snippet.favorite ? 'star' : 'star-outline'}
          iconColor={snippet.favorite ? colors.favorite : colors.textMuted}
          onPress={handleFavorite}
        />
        <IconButton
          icon="pencil-outline"
          iconColor={colors.primary}
          onPress={() => navigation.navigate('CreateSnippet', { snippetId })}
        />
        <IconButton icon="delete-outline" iconColor={colors.error} onPress={handleDelete} />
        <Menu
          visible={exportMenuVisible}
          onDismiss={() => setExportMenuVisible(false)}
          anchor={
            <IconButton
              icon="export-variant"
              iconColor={colors.accent}
              onPress={() => setExportMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => handleExport('txt')} title=".txt" />
          <Menu.Item onPress={() => handleExport('js')} title=".js" />
          <Menu.Item onPress={() => handleExport('json')} title=".json" />
        </Menu>
      </View>

      <Text style={[styles.title, { color: colors.text, fontSize: fontSizes.title }]}>
        {snippet.title}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted, fontSize: fontSizes.caption }]}>
        {formatDate(snippet.createdAt)} · {snippet.language}
      </Text>

      <TagChips tags={snippet.tags} />

      {snippet.imageUri ? (
        <Image source={{ uri: snippet.imageUri }} style={styles.image} />
      ) : null}

      <View style={styles.codeSection}>
        <CodePreview code={snippet.code} language={snippet.language} maxLines={50} />
      </View>

      <Button
        mode="contained"
        icon="robot-outline"
        onPress={handleAI}
        style={[styles.aiBtn, { backgroundColor: colors.primary }]}
        labelStyle={{ fontWeight: '600' }}
      >
        Explain with AI
      </Button>

      {aiResult && (
        <Card style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Card.Title title="AI Explanation" titleStyle={{ color: colors.text }} />
          <Card.Content>
            <Text style={[styles.aiLabel, { color: colors.accent }]}>Summary</Text>
            <Text style={{ color: colors.text, marginBottom: 12 }}>{aiResult.summary || aiResult.explanation}</Text>
            <Divider style={{ marginVertical: 8 }} />
            <Text style={[styles.aiLabel, { color: colors.accent }]}>Explanation</Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{aiResult.explanation}</Text>
            {aiResult.suggestions ? (
              <>
                <Divider style={{ marginVertical: 8 }} />
                <Text style={[styles.aiLabel, { color: colors.warning }]}>Suggestions</Text>
                <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{aiResult.suggestions}</Text>
              </>
            ) : null}
          </Card.Content>
        </Card>
      )}

      {conversation.length > 0 && (
        <Card style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Card.Title title="Ask a follow-up" titleStyle={{ color: colors.text }} />
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Follow-up question"
              placeholder="Ask another question about this snippet"
              value={followUp}
              onChangeText={setFollowUp}
              style={styles.followUpInput}
              multiline
            />
            <Button
              mode="contained"
              onPress={handleFollowUp}
              disabled={!followUp.trim() || loading}
              style={[styles.followUpBtn, { backgroundColor: colors.accent }]}
              labelStyle={{ fontWeight: '600' }}
            >
              Ask
            </Button>

            {followUps.length > 0 ? (
              followUps.map((item, index) => (
                <View key={index} style={styles.followUpItem}>
                  <Text style={[styles.aiLabel, { color: colors.accent }]}>Q: {item.question}</Text>
                  <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{item.answer}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.followUpHint, { color: colors.textMuted }]}>Ask another question and the AI will answer it using the same code context.</Text>
            )}
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 40 }} />
      <LoadingOverlay visible={loading} message="Processing..." />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  title: { fontWeight: '700', marginBottom: 4 },
  meta: { marginBottom: 8 },
  image: { width: '100%', height: 180, borderRadius: 10, marginVertical: 12 },
  codeSection: { marginVertical: 12 },
  aiBtn: { marginVertical: 12, borderRadius: 10 },
  aiCard: { borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  aiLabel: { fontWeight: '700', marginBottom: 4, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  followUpInput: { marginBottom: 12, backgroundColor: 'transparent' },
  followUpBtn: { borderRadius: 10, marginBottom: 16 },
  followUpItem: { marginTop: 12 },
  followUpHint: { marginTop: 4, fontSize: 14, lineHeight: 20 },
});

export default SnippetDetailScreen;
