export interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  tags: string;
  favorite: number;
  imageUri?: string | null;
  createdAt: string;
}

export type SnippetInput = Omit<Snippet, 'id' | 'createdAt' | 'favorite'> & {
  favorite?: number;
};

export type ExportFormat = 'txt' | 'js' | 'json';

export interface AIExplanation {
  explanation: string;
  summary: string;
  suggestions: string;
  rawResponse?: string;
}
