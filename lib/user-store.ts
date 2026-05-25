import { mockData } from './mock-data';

type UserInput = {
  name: string;
  email: string;
  department: string;
  role: string;
};

type UserRecord = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  riskScore: number;
  status: string;
  lastActive: string;
  alerts: number;
  isInsiderThreat: boolean;
  active: boolean;
};

let overrides = new Map<string, Partial<UserRecord>>();

function nextId(): string {
  const existing = mockData.users;
  const maxNum = existing.reduce((max, u) => {
    const num = parseInt(u.id.replace('USR-', ''), 10);
    return num > max ? num : max;
  }, 0);
  const overriddenMax = Array.from(overrides.keys()).reduce((max, id) => {
    const num = parseInt(id.replace('USR-', ''), 10);
    return num > max ? num : max;
  }, 0);
  const next = Math.max(maxNum, overriddenMax) + 1;
  return `USR-${String(next).padStart(3, '0')}`;
}

function mergeOverrides(user: UserRecord): UserRecord {
  const ov = overrides.get(user.id);
  if (!ov) return user;
  return { ...user, ...ov };
}

export function listUsers(): UserRecord[] {
  const base = mockData.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    department: u.department,
    role: u.role,
    riskScore: u.riskScore,
    status: u.status,
    lastActive: u.lastActive,
    alerts: u.alerts,
    isInsiderThreat: u.isInsiderThreat,
    active: true,
  }));
  const merged = base.map(mergeOverrides);
  const added = Array.from(overrides.entries())
    .filter(([id]) => !mockData.users.some((u) => u.id === id))
    .map(([id, ov]) => {
      const base = {
        id,
        name: '',
        email: '',
        department: '',
        role: '',
        riskScore: 0,
        status: 'low-risk',
        lastActive: 'Never',
        alerts: 0,
        isInsiderThreat: false,
        active: true,
      };
      return { ...base, ...ov };
    });
  return [...merged, ...added];
}

export function getUser(id: string): UserRecord | null {
  const all = listUsers();
  return all.find((u) => u.id === id) ?? null;
}

export function createUser(input: UserInput): UserRecord {
  const id = nextId();
  const user: UserRecord = {
    id,
    name: input.name,
    email: input.email,
    department: input.department,
    role: input.role,
    riskScore: 10,
    status: 'low-risk',
    lastActive: 'Just now',
    alerts: 0,
    isInsiderThreat: false,
    active: true,
  };
  overrides.set(id, user);
  return user;
}

export function updateUser(id: string, updates: Partial<UserInput & { active: boolean }>): UserRecord | null {
  const existing = getUser(id);
  if (!existing) return null;
  const merged = { ...overrides.get(id) ?? {}, ...updates };
  overrides.set(id, merged);
  return getUser(id);
}

export function deactivateUser(id: string): UserRecord | null {
  return updateUser(id, { active: false });
}

export function activateUser(id: string): UserRecord | null {
  return updateUser(id, { active: true });
}
