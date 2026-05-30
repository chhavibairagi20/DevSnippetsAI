export const validateSnippet = (title: string, code: string): string | null => {
  if (!title.trim()) return 'Title is required';
  if (!code.trim()) return 'Code content is required';
  if (title.length > 120) return 'Title must be under 120 characters';
  return null;
};

export const parseTags = (tags: string): string[] =>
  tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

export const joinTags = (tags: string[]): string => tags.join(', ');
