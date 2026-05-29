import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export async function initDb(): Promise<void> {
  db = await SQLite.openDatabaseAsync('habits.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '✅',
      times_per_week INTEGER NOT NULL DEFAULT 7,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      UNIQUE(habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mood_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      morning INTEGER,
      evening INTEGER
    );

    CREATE TABLE IF NOT EXISTS mood_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Migrations for existing installs
  for (const sql of [
    `ALTER TABLE habits ADD COLUMN emoji TEXT NOT NULL DEFAULT '✅'`,
    `ALTER TABLE habits ADD COLUMN times_per_week INTEGER NOT NULL DEFAULT 7`,
  ]) {
    try { await db.execAsync(sql); } catch {}
  }
}
