'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchJson } from '@/lib/client-api';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState({ name: '', email: '', department: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJson<{ user: { name: string; email: string; department: string; role: string } }>(`/api/users/${id}`)
      .then((data) => {
        setForm({
          name: data.user.name,
          email: data.user.email,
          department: data.user.department,
          role: data.user.role,
        });
      })
      .catch(() => setError('Failed to load user'));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }

      router.push('/users');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center text-[var(--on-surface-variant)] py-12">Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users" className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--on-surface)]">Edit User</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Department</label>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
            required
          >
            <option value="Engineering">Engineering</option>
            <option value="Security">Security</option>
            <option value="Finance">Finance</option>
            <option value="Data">Data</option>
            <option value="IT">IT</option>
            <option value="Operations">Operations</option>
            <option value="Product">Product</option>
            <option value="HR">HR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
            required
          >
            <option value="Cloud Engineer">Cloud Engineer</option>
            <option value="Security Analyst">Security Analyst</option>
            <option value="Data Engineer">Data Engineer</option>
            <option value="DevOps Specialist">DevOps Specialist</option>
            <option value="Infrastructure Admin">Infrastructure Admin</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Threat Hunter">Threat Hunter</option>
            <option value="Platform Engineer">Platform Engineer</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-[var(--secondary)] bg-[var(--secondary-container)]/10 border border-[var(--secondary)]/30 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/users" className="px-4 py-2 border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:bg-[var(--surface-variant)] transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
