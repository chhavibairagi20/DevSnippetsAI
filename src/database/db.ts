import * as SQLite from 'expo-sqlite';

/** Singleton SQLite connection for offline snippet storage */
export const db = SQLite.openDatabaseSync('snippets.db');
