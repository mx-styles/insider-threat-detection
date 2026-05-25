import { initDb, queryAll, queryOne, queryDb } from './db';

export type AuthUserRecord = {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'analyst';
  isAdmin: boolean;
  createdAt: string;
  active: boolean;
};

type AuthUserInput = {
  username: string;
  name: string;
  role: 'admin' | 'analyst';
  password: string;
};

type DbRow = {
  id: string;
  username: string;
  name: string;
  role: string;
  is_admin: number;
  active: number;
  password: string;
  created_at: string;
};

function toRecord(row: DbRow): AuthUserRecord {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role as AuthUserRecord['role'],
    isAdmin: row.is_admin === 1,
    createdAt: row.created_at,
    active: row.active === 1,
  };
}

export function listAuthUsers(): AuthUserRecord[] {
  initDb();
  const rows = queryAll<DbRow>('SELECT * FROM auth_users ORDER BY created_at ASC');
  return rows.map(toRecord);
}

export function getAuthUser(id: string): AuthUserRecord | null {
  initDb();
  const row = queryOne<DbRow>('SELECT * FROM auth_users WHERE id = ?', id);
  return row ? toRecord(row) : null;
}

export function getAuthUserByUsername(username: string): AuthUserRecord | null {
  initDb();
  const row = queryOne<DbRow>('SELECT * FROM auth_users WHERE username = ?', username);
  return row ? toRecord(row) : null;
}

export function createAuthUser(input: AuthUserInput): AuthUserRecord {
  initDb();
  const existing = queryOne<{ id: string }>('SELECT id FROM auth_users WHERE username = ?', input.username);
  if (existing) throw new Error('Username already exists');

  const maxRow = queryOne<{ max_id: string | null }>("SELECT MAX(id) AS max_id FROM auth_users WHERE id LIKE 'AU-%'");
  const nextNum = maxRow?.max_id ? parseInt(maxRow.max_id.replace('AU-', ''), 10) + 1 : 5;
  const id = `AU-${String(nextNum).padStart(3, '0')}`;
  const createdAt = new Date().toISOString().split('T')[0];

  queryDb(
    'INSERT INTO auth_users (id, username, name, role, is_admin, active, password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id,
    input.username,
    input.name,
    input.role,
    input.role === 'admin' ? 1 : 0,
    1,
    input.password,
    createdAt,
  );

  return getAuthUser(id)!;
}

export function updateAuthUser(id: string, updates: Partial<{ name: string; role: string; active: boolean; password: string }>): AuthUserRecord | null {
  initDb();
  const existing = queryOne<DbRow>('SELECT * FROM auth_users WHERE id = ?', id);
  if (!existing) return null;

  const name = updates.name ?? existing.name;
  const role = updates.role ?? existing.role;
  const active = updates.active !== undefined ? (updates.active ? 1 : 0) : existing.active;
  const isAdmin = role === 'admin' ? 1 : 0;

  queryDb(
    'UPDATE auth_users SET name = ?, role = ?, is_admin = ?, active = ? WHERE id = ?',
    name, role, isAdmin, active, id,
  );

  if (updates.password) {
    queryDb('UPDATE auth_users SET password = ? WHERE id = ?', updates.password, id);
  }

  return getAuthUser(id);
}

export function deleteAuthUser(id: string): boolean {
  initDb();
  const result = queryDb<{ changes: number }>('DELETE FROM auth_users WHERE id = ?', id);
  return result.changes > 0;
}

export function validateAuthUserPassword(username: string, password: string): boolean {
  initDb();
  const row = queryOne<{ password: string }>('SELECT password FROM auth_users WHERE username = ?', username);
  return row?.password === password;
}
