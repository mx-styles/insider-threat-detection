'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type AuthUser = {
  id: string;
  username: string;
  name: string;
  role: string;
  isAdmin: boolean;
  createdAt: string;
  active: boolean;
};

type ModalMode = 'create' | 'edit' | null;

export default function AuthUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState({ username: '', name: '', role: 'analyst', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    fetch('/api/auth/users', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setUsers(data.users))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', name: '', role: 'analyst', password: '' });
    setError('');
    setModal('create');
  };

  const openEdit = (user: AuthUser) => {
    setEditingUser(user);
    setForm({ username: user.username, name: user.name, role: user.role, password: '' });
    setError('');
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingUser(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (modal === 'create') {
        const res = await fetch('/api/auth/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create');
      } else if (modal === 'edit' && editingUser) {
        const body: Record<string, string> = { name: form.name, role: form.role };
        if (form.password) body.password = form.password;
        const res = await fetch(`/api/auth/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update');
      }
      closeModal();
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: AuthUser) => {
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
        credentials: 'include',
      });
      if (res.ok) loadUsers();
    } catch {}
  };

  const handleDelete = async (user: AuthUser) => {
    if (!confirm(`Delete user "${user.username}"?`)) return;
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) loadUsers();
    } catch {}
  };

  if (authLoading || loading) {
    return <div className="text-center py-12 text-[var(--on-surface-variant)]">Loading...</div>;
  }

  if (!user?.isAdmin) {
    router.replace('/settings');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/settings" className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] flex items-center gap-1 mb-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Settings
          </Link>
          <h1 className="text-2xl font-semibold text-[var(--on-surface)]">Auth Users</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Manage who can log in to the system
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg text-sm text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
          <span className="material-symbols-outlined text-sm">person_add</span>
          New User
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeModal}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-6 shadow-2xl w-full max-w-[560px] mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-4">
              {modal === 'create' ? 'New Auth User' : 'Edit User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modal === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Username</label>
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]" required />
                </div>
              )}
              {modal === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Username (read-only)</label>
                  <input type="text" value={form.username} readOnly
                    className="w-full bg-[var(--surface-variant)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface-variant)] cursor-not-allowed" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]">
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {modal === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]" {...(modal === 'create' ? { required: true } : {})} />
              </div>
              {error && <p className="text-sm text-[var(--secondary)]">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : (modal === 'create' ? 'Create' : 'Save Changes')}
                </button>
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:bg-[var(--surface-variant)] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--outline-variant)]">
              <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)]">Username</th>
              <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)]">Name</th>
              <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)]">Role</th>
              <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)]">Created</th>
              <th className="text-left px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)]">Status</th>
              <th className="text-right px-5 py-3 text-xs font-mono font-semibold text-[var(--on-surface-variant)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--outline-variant)]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--surface-container-high)]/50 transition-colors">
                <td className="px-5 py-3 font-mono text-sm text-[var(--on-surface)]">{u.username}</td>
                <td className="px-5 py-3 text-sm text-[var(--on-surface)]">{u.name}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                    u.role === 'admin' ? 'bg-[var(--secondary)]/20 text-[var(--secondary)] border border-[var(--secondary)]/30' :
                    u.role === 'analyst' ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30' :
                    'bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border border-[var(--outline)]'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-[var(--on-surface-variant)]">{u.createdAt}</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive(u)}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border transition-colors ${
                      u.active
                        ? 'bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30 hover:bg-[var(--primary)]/30'
                        : 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border-[var(--outline)] hover:bg-[var(--surface-container-high)]'
                    }`}>
                    {u.active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(u)}
                      className="px-2 py-1 rounded text-xs font-mono text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(u)}
                      className="px-2 py-1 rounded text-xs font-mono text-[var(--secondary)] hover:bg-[var(--secondary)]/10 transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-[var(--on-surface-variant)]">No auth users found.</div>
        )}
      </div>
    </div>
  );
}
