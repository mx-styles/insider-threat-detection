'use client';

import { Search, Filter, Shield, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '@/lib/client-api';

type UserSummary = {
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
};

function RiskBadge({ score }: { score: number }) {
  let color = 'text-[var(--primary)]';
  let bg = 'bg-[var(--primary-container)]/20';
  
  if (score >= 70) {
    color = 'text-[var(--secondary)]';
    bg = 'bg-[var(--secondary-container)]/20';
  } else if (score >= 40) {
    color = 'text-[var(--tertiary)]';
    bg = 'bg-[var(--tertiary-container)]/20';
  }

  return (
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-semibold ${bg} ${color}`}>
      {score}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'high-risk') {
    return <AlertTriangle className="w-4 h-4 text-[var(--secondary)]" />;
  } else if (status === 'medium-risk') {
    return <Shield className="w-4 h-4 text-[var(--tertiary)]" />;
  }
  return <CheckCircle className="w-4 h-4 text-[var(--primary)]" />;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showThreatsOnly, setShowThreatsOnly] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchJson<{ users: UserSummary[] }>('/api/users')
      .then((data) => {
        if (isMounted) setUsers(data.users);
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return users.filter((user) => {
      const matchSearch = !searchTerm
        || `${user.name} ${user.email} ${user.department} ${user.role}`
          .toLowerCase()
          .includes(query);
      const matchThreat = !showThreatsOnly || user.isInsiderThreat;
      return matchSearch && matchThreat;
    });
  }, [users, searchTerm, showThreatsOnly]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--on-surface)]">User Profiles</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Monitor user behavior and risk scores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:border-[var(--primary)] transition-colors"
            onClick={() => setShowThreatsOnly((current) => !current)}
          >
            <Filter className="w-4 h-4" />
            {showThreatsOnly ? 'Threats Only' : 'Filter'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
        <input
          type="text"
          placeholder="Search users by name, email, or department..."
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* User cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`relative rounded-xl p-5 border transition-colors ${
              user.isInsiderThreat
                ? 'bg-[var(--surface-container)]/80 border-[var(--secondary)]/40'
                : 'bg-[var(--surface-container)] border-[var(--outline-variant)]'
            }`}
          >
            {user.isInsiderThreat && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--secondary)] rounded-l-xl" />
            )}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user.isInsiderThreat ? 'bg-[var(--secondary-container)]/30' : 'bg-[var(--primary-container)]/20'
                }`}>
                  <span className={`text-sm font-semibold ${
                    user.isInsiderThreat ? 'text-[var(--secondary)]' : 'text-[var(--primary)]'
                  }`}>
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--on-surface)]">{user.name}</p>
                    {user.isInsiderThreat && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--secondary)]/20 text-[var(--secondary)] border border-[var(--secondary)]/40">THREAT</span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[var(--on-surface-variant)]">{user.email}</p>
                </div>
              </div>
              <RiskBadge score={user.riskScore} />
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--outline-variant)]">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[var(--on-surface-variant)]">Department</p>
                  <p className="text-[var(--on-surface)] font-medium">{user.department}</p>
                </div>
                <div>
                  <p className="text-[var(--on-surface-variant)]">Role</p>
                  <p className="text-[var(--on-surface)] font-medium">{user.role}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon status={user.status} />
                <span className="text-xs font-mono text-[var(--on-surface-variant)]">
                  {user.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--on-surface-variant)]">
                  {user.alerts} alert{user.alerts !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
