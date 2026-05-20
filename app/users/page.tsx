'use client';

import { Search, Filter, ChevronRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const users = [
  {
    id: 'USR-001',
    name: 'Jonathan Doe',
    email: 'j.doe@company.com',
    department: 'Engineering',
    role: 'Senior Developer',
    riskScore: 87,
    status: 'high-risk',
    lastActive: '5 min ago',
    alerts: 4,
  },
  {
    id: 'USR-002',
    name: 'Maria Johnson',
    email: 'm.johnson@company.com',
    department: 'DevOps',
    role: 'Cloud Architect',
    riskScore: 72,
    status: 'medium-risk',
    lastActive: '15 min ago',
    alerts: 2,
  },
  {
    id: 'USR-003',
    name: 'Robert Williams',
    email: 'r.williams@company.com',
    department: 'Data Science',
    role: 'Data Engineer',
    riskScore: 68,
    status: 'medium-risk',
    lastActive: '28 min ago',
    alerts: 1,
  },
  {
    id: 'USR-004',
    name: 'Karen Brown',
    email: 'k.brown@company.com',
    department: 'Security',
    role: 'Security Analyst',
    riskScore: 23,
    status: 'low-risk',
    lastActive: '45 min ago',
    alerts: 0,
  },
  {
    id: 'USR-005',
    name: 'Alex Davis',
    email: 'a.davis@company.com',
    department: 'Engineering',
    role: 'Backend Developer',
    riskScore: 89,
    status: 'high-risk',
    lastActive: '1 hr ago',
    alerts: 3,
  },
  {
    id: 'USR-006',
    name: 'Tom Wilson',
    email: 't.wilson@company.com',
    department: 'Infrastructure',
    role: 'SysAdmin',
    riskScore: 45,
    status: 'low-risk',
    lastActive: '2 hr ago',
    alerts: 1,
  },
];

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
          <Link href="/users/peer-analysis" className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:border-[var(--primary)] transition-colors">
            <Shield className="w-4 h-4" />
            Peer Analysis
          </Link>
          <Link href="/users/anomalous-sequences" className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:border-[var(--primary)] transition-colors">
            <AlertTriangle className="w-4 h-4" />
            Anomalous Sequences
          </Link>
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] hover:border-[var(--primary)] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
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
        />
      </div>

      {/* User cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="bg-[var(--surface-container)] rounded-xl p-5 border border-[var(--outline-variant)] hover:border-[var(--primary)]/30 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-container)]/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[var(--primary)]">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--on-surface)]">{user.name}</p>
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
                <ChevronRight className="w-4 h-4 text-[var(--on-surface-variant)] group-hover:text-[var(--primary)] transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
