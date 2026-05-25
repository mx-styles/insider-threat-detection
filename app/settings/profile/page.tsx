'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <div className="text-center py-12 text-[var(--on-surface-variant)]">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-12 text-[var(--on-surface-variant)]">Not signed in.</div>;
  }

  const displayName = name || user.name;

  const handleSave = async () => {
    if (!displayName) return;
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const body: Record<string, string> = { name: displayName };
      if (password) body.password = password;
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setName('');
      setPassword('');
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[560px] mx-auto space-y-6">
      <div>
        <Link href="/settings" className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] flex items-center gap-1 mb-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Settings
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--on-surface)]">My Profile</h1>
      </div>

      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-[var(--outline-variant)]">
          <div className="w-14 h-14 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
            <span className="text-lg font-semibold text-[var(--on-primary)]">
              {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--on-surface)]">{user.name}</p>
            <p className="text-sm text-[var(--on-surface-variant)]">{user.role}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Username</label>
          <input type="text" value={user.username} readOnly
            className="w-full bg-[var(--surface-variant)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface-variant)] cursor-not-allowed" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Full Name</label>
          <input type="text" value={displayName} onChange={(e) => setName(e.target.value)}
            placeholder={user.name}
            className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">New Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
            className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]" />
        </div>

        {error && <p className="text-sm text-[var(--secondary)]">{error}</p>}
        {saved && <p className="text-sm text-[var(--primary)]">Profile updated successfully.</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving || !displayName}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
