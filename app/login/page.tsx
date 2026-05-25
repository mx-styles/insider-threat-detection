'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const err = await login(username, password);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      router.push('/');
    } catch {
      setError('Connection error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div>
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-[var(--on-surface)]">Insider Threat Detection System</h1>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2.5 text-sm text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                placeholder="Enter username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--outline-variant)] rounded-lg px-3 py-2.5 text-sm text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--secondary)] bg-[var(--secondary-container)]/10 border border-[var(--secondary)]/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] font-medium text-sm hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
