import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}

export function initDb(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'analyst',
      is_admin INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  const count = db.prepare('SELECT COUNT(*) AS cnt FROM auth_users').get() as { cnt: number };
  if (count.cnt === 0) {
    const insert = db.prepare(`
      INSERT INTO auth_users (id, username, name, role, is_admin, active, password, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run('AU-001', 'admin', 'Administrator', 'admin', 1, 1, 'admin123', '2025-01-01');
  }
}

export function queryDb<T>(sql: string, ...params: unknown[]): T {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(...params) as T;
}

export function queryAll<T>(sql: string, ...params: unknown[]): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

export function queryOne<T>(sql: string, ...params: unknown[]): T | undefined {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | undefined;
}
