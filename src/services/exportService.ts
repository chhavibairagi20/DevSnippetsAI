import * as Sharing from 'expo-sharing';
import type { Snippet, ExportFormat } from '../types/snippet';
import { writeFile } from './fileService';

const extensionMap: Record<ExportFormat, string> = {
  txt: 'txt',
  js: 'js',
  json: 'json',
};

const buildContent = (snippet: Snippet, format: ExportFormat): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(
        {
          title: snippet.title,
          language: snippet.language,
          tags: snippet.tags,
          code: snippet.code,
          createdAt: snippet.createdAt,
        },
        null,
        2
      );
    case 'js':
      return `// ${snippet.title}\n// Language: ${snippet.language}\n// Tags: ${snippet.tags}\n\n${snippet.code}`;
    default:
      return `${snippet.title}\nLanguage: ${snippet.language}\nTags: ${snippet.tags}\n\n${snippet.code}`;
  }
};

export const exportSnippet = async (
  snippet: Snippet,
  format: ExportFormat
): Promise<string> => {
  const safeTitle = snippet.title.replace(/[^a-z0-9_-]/gi, '_').slice(0, 40);
  const fileName = `${safeTitle}.${extensionMap[format]}`;
  const content = buildContent(snippet, format);
  return writeFile('exports/', fileName, content);
};

export const shareFile = async (uri: string): Promise<void> => {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri);
};
