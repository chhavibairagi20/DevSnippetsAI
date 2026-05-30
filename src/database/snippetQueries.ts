import { db } from './db';
import type { Snippet, SnippetInput } from '../types/snippet';
import { nowISO } from '../utils/date';

const rowToSnippet = (row: Record<string, unknown>): Snippet => ({
  id: row.id as number,
  title: row.title as string,
  code: row.code as string,
  language: row.language as string,
  tags: (row.tags as string) ?? '',
  favorite: (row.favorite as number) ?? 0,
  imageUri: (row.imageUri as string) ?? null,
  createdAt: row.createdAt as string,
});

export const getAllSnippets = async (): Promise<Snippet[]> => {
  const rows = await db.getAllAsync(
    'SELECT * FROM snippets ORDER BY datetime(createdAt) DESC'
  );
  return rows.map((r) => rowToSnippet(r as Record<string, unknown>));
};

export const getSnippetById = async (id: number): Promise<Snippet | null> => {
  const row = await db.getFirstAsync('SELECT * FROM snippets WHERE id = ?', [id]);
  if (!row) return null;
  return rowToSnippet(row as Record<string, unknown>);
};

export const getFavoriteSnippets = async (): Promise<Snippet[]> => {
  const rows = await db.getAllAsync(
    'SELECT * FROM snippets WHERE favorite = 1 ORDER BY datetime(createdAt) DESC'
  );
  return rows.map((r) => rowToSnippet(r as Record<string, unknown>));
};

export const searchSnippets = async (query: string): Promise<Snippet[]> => {
  const q = `%${query.trim().toLowerCase()}%`;
  const rows = await db.getAllAsync(
    `SELECT * FROM snippets
     WHERE LOWER(title) LIKE ?
        OR LOWER(tags) LIKE ?
        OR LOWER(language) LIKE ?
     ORDER BY datetime(createdAt) DESC`,
    [q, q, q]
  );
  return rows.map((r) => rowToSnippet(r as Record<string, unknown>));
};

export const filterByLanguage = async (language: string): Promise<Snippet[]> => {
  const rows = await db.getAllAsync(
    'SELECT * FROM snippets WHERE LOWER(language) = ? ORDER BY datetime(createdAt) DESC',
    [language.toLowerCase()]
  );
  return rows.map((r) => rowToSnippet(r as Record<string, unknown>));
};

export const insertSnippet = async (input: SnippetInput): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO snippets (title, code, language, tags, favorite, imageUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title.trim(),
      input.code,
      input.language,
      input.tags?.trim() ?? '',
      input.favorite ?? 0,
      input.imageUri ?? null,
      nowISO(),
    ]
  );
  return result.lastInsertRowId;
};

export const updateSnippet = async (
  id: number,
  input: Partial<SnippetInput>
): Promise<void> => {
  const existing = await getSnippetById(id);
  if (!existing) throw new Error('Snippet not found');

  await db.runAsync(
    `UPDATE snippets SET title = ?, code = ?, language = ?, tags = ?, favorite = ?, imageUri = ?
     WHERE id = ?`,
    [
      input.title?.trim() ?? existing.title,
      input.code ?? existing.code,
      input.language ?? existing.language,
      input.tags?.trim() ?? existing.tags,
      input.favorite ?? existing.favorite,
      input.imageUri !== undefined ? (input.imageUri ?? null) : (existing.imageUri ?? null),
      id,
    ]
  );
};

export const deleteSnippet = async (id: number): Promise<void> => {
  await db.runAsync('DELETE FROM snippets WHERE id = ?', [id]);
};

export const toggleFavorite = async (id: number): Promise<void> => {
  const snippet = await getSnippetById(id);
  if (!snippet) throw new Error('Snippet not found');
  await db.runAsync('UPDATE snippets SET favorite = ? WHERE id = ?', [
    snippet.favorite ? 0 : 1,
    id,
  ]);
};
