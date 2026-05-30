import { db } from './db';

/** Creates the snippets table if it does not exist */
export const initDatabase = async (): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      tags TEXT,
      favorite INTEGER DEFAULT 0,
      imageUri TEXT,
      createdAt TEXT NOT NULL
    );
  `);
};
